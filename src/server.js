import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import { getEnvVar } from './utils/getEnvVar.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(getEnvVar('PORT', '3000'));

export const setupServer = () => {
  const app = express();

  app.use(
    cors({
      origin: [
        'http://localhost:5175',
        'https://phonebook-frontend-p4qy.onrender.com',
      ],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(path.resolve('src', 'uploads')));
  app.use('/api-docs', swaggerDocs());

  app.use(router);

  app.use(notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
