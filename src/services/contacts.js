import createHttpError from 'http-errors';
import { ContactsCollection } from '../db/models/contact.js';
import { calculatePagination } from '../utils/calculatePagination.js';

export const getAllContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortOrder,
  sortBy = 'name',
  filter = {},
}) => {
  const limit = perPage > 0 ? perPage : 0;
  const skip = page > 0 ? (page - 1) * perPage : 0;

  const baseFilter = { userId };

  const contactsQuery = ContactsCollection.find(baseFilter);

  if (filter.name) {
    contactsQuery.where('name').regex(new RegExp(filter.name, 'i'));
  }
  if (filter.email) {
    contactsQuery.where('email').regex(new RegExp(filter.email, 'i'));
  }
  if (filter.phoneNumber) {
    contactsQuery
      .where('phoneNumber')
      .regex(new RegExp(filter.phoneNumber, 'i'));
  }
  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }
  if (filter.isFavourite !== undefined) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  let query = contactsQuery.skip(skip).limit(limit);

  if (sortOrder) {
    query = query.sort({ [sortBy]: sortOrder });
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.countDocuments(contactsQuery.getFilter()),
    query.exec(),
  ]);

  const paginationData = calculatePagination(contactsCount, page, perPage);

  return {
    contacts,
    ...paginationData,
  };
};

export const getContactById = (contactId, userId) =>
  ContactsCollection.findOne({ _id: contactId, userId });

export const createContact = async (payload) => {
  const { userId, name, email, phoneNumber } = payload;

  const duplicate = await ContactsCollection.findOne({
    userId,
    $or: [
      { name: name.trim().toLowerCase() },
      { phoneNumber: phoneNumber.trim() },
      ...(email ? [{ email: email.trim() }] : []),
    ],
  });

  if (duplicate)
    throw createHttpError(
      400,
      'Contact with the same name, phone number, or email already exists',
    );

  return ContactsCollection.create(payload);
};

export const deleteContact = (contactId, userId) =>
  ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });

export const updateContact = async (
  contactId,
  userId,
  payload,
  options = {},
) => {
  const { name, phoneNumber, email } = payload;

  const duplicate = await ContactsCollection.findOne({
    userId,
    _id: { $ne: contactId },
    $or: [
      { name: name.trim().toLowerCase() },
      { phoneNumber: phoneNumber.trim() },
      ...(email ? [{ email: email.trim() }] : []),
    ],
  });

  if (duplicate)
    throw createHttpError(
      400,
      'Another contact with the same name, phone number, or email already exists',
    );

  const result = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!result.value) return null;

  return {
    contact: result.value,
    isNew: Boolean(result?.lastErrorObject?.upserted),
  };
};
