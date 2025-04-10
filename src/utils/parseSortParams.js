import { SORT_ORDER } from '../constants/index.js';

const parseSortOrder = (sortOrder) => {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);

  if (!isKnownOrder) return SORT_ORDER.ASC;

  return sortOrder;
};

const parseSortBy = (sortBy) => {
  const keysOfContact = ['_id', 'name', 'email', 'isFavourite', 'contactType'];

  if (!keysOfContact.includes(sortBy)) return 'name';

  return sortBy;
};

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
