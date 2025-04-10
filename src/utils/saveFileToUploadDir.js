import fs from 'node:fs/promises';
import path from 'node:path';
import { getEnvVar } from './getEnvVar.js';

export const saveFileToUploadDir = async (file) => {
  await fs.rename(file.path, path.resolve('src', 'uploads', file.filename));

  return `${getEnvVar('APP_DOMAIN')}/uploads/${file.filename}`;
};
