const parseString = (str) => {
  if (typeof str !== 'string') return;

  const trimmedStr = str.trim();
  if (trimmedStr.length === 0) return;

  return trimmedStr;
};

const parseContactType = (type) => {
  const isString = typeof type === 'string';

  if (!isString) return;

  const types = ['work', 'home', 'personal'];

  if (types.includes(type)) return type;
};

const parseIsFavourite = (isFavourite) => {
  const isString = typeof isFavourite === 'string';
  const isBoolean = typeof isFavourite === 'boolean';

  if (isBoolean) return isFavourite;

  if (isString) {
    if (isFavourite.toLowerCase() === 'true') return true;
    if (isFavourite.toLowerCase() === 'false') return false;
  }
};

export const parseFilterParams = (query) => {
  const { name, email, phoneNumber, contactType, isFavourite } = query;

  const parsedName = parseString(name);
  const parsedEmail = parseString(email);
  const parsedPhoneNumber = parseString(phoneNumber);
  const parsedContactType = parseContactType(contactType);
  const parsedIsFavourite = parseIsFavourite(isFavourite);

  return {
    name: parsedName,
    email: parsedEmail,
    phoneNumber: parsedPhoneNumber,
    contactType: parsedContactType,
    isFavourite: parsedIsFavourite,
  };
};
