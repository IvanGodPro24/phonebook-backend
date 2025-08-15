import createHttpError from 'http-errors';
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { getEnvVar } from '../utils/getEnvVar.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortOrder, sortBy } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const contacts = await getAllContacts({
    userId: req.user._id,
    page,
    perPage,
    sortOrder,
    sortBy,
    filter,
  });

  res.json(contacts);
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;

  const contact = await getContactById(contactId, req.user._id);

  if (!contact) throw createHttpError(404, 'Contact not found!');

  res.json(contact);
};

export const createContactController = async (req, res) => {
  let photoUrl = null;

  if (req.file) {
    photoUrl =
      getEnvVar('ENABLE_CLOUDINARY') === 'true'
        ? await saveFileToCloudinary(req.file)
        : await saveFileToUploadDir(req.file);
  }

  const contact = await createContact({
    userId: req.user._id,
    photo: photoUrl,
    ...req.body,
  });

  res.status(201).json(contact);
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;

  const contact = await deleteContact(contactId, req.user._id);

  if (!contact) throw createHttpError(404, 'Contact not found!');

  res.json(contact);
};

const handleContactUpdate = async (req, res, next, upsert = false) => {
  const { contactId } = req.params;

  const payload = { ...req.body };

  if (payload.email === '') {
    payload.email = null;
  }

  if (req.file) {
    payload.photo =
      getEnvVar('ENABLE_CLOUDINARY') === 'true'
        ? await saveFileToCloudinary(req.file)
        : await saveFileToUploadDir(req.file);
  }

  const result = await updateContact(contactId, req.user._id, payload, {
    upsert,
  });

  if (!result) throw createHttpError(404, 'Contact not found!');

  const status = result.isNew ? 201 : 200;

  res.status(status).json(result.contact);
};

export const upsertContactController = (req, res, next) =>
  handleContactUpdate(req, res, next, true);

export const patchContactController = (req, res, next) =>
  handleContactUpdate(req, res, next);
