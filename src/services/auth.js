import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import handlebars from 'handlebars';
import { randomBytes } from 'crypto';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, ONE_MONTH } from '../constants/index.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { getFullName, getTicket } from '../utils/googleAuth.js';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const getUserBySessionId = (sessionId) =>
  UsersCollection.findById(sessionId);

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (!user) throw createHttpError(401, 'User not authorized!');

  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) throw createHttpError(401, 'Wrong password!');

  await SessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_MONTH),
  });
};

export const logoutUser = (sessionId) =>
  SessionsCollection.deleteOne({ _id: sessionId });

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_MONTH),
  };
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) throw createHttpError(401, 'Session not found!');

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired)
    throw createHttpError(401, 'Session token expired!');

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const requestResetPassword = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) throw createHttpError(404, 'User not found!');

  const resetToken = jwt.sign(
    { sub: user._id, email: user.email },
    getEnvVar('JWT_SECRET'),
    { expiresIn: '5m' },
  );

  const resetPasswordTemplate = fs.readFileSync(
    path.resolve('src', 'templates', 'reset-pwd.hbs'),
    'utf-8',
  );

  const template = handlebars.compile(resetPasswordTemplate);

  try {
    await sendEmail(
      email,
      template({
        name: user.name,
        link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
      }),
    );
  } catch (error) {
    throw createHttpError(
      500,
      `Failed to send the email, please try again later. Error: ${error.message}`,
    );
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, getEnvVar('JWT_SECRET'));

    const user = await UsersCollection.findById(decoded.sub);

    if (!user) throw createHttpError(404, 'User not found!');

    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    await SessionsCollection.deleteOne({ userId: user._id });

    await UsersCollection.findByIdAndUpdate(user._id, {
      password: encryptedPassword,
    });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      throw createHttpError(401, 'Token is expired or invalid!');
    }

    throw error;
  }
};

export const loginWithGoogle = async (code) => {
  const loginTicket = await getTicket(code);

  const payload = loginTicket.getPayload();

  if (!payload) throw createHttpError(401, 'Unauthorized');

  let user = await UsersCollection.findOne({ email: payload.email });

  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);

    user = await UsersCollection.create({
      name: getFullName(payload),
      email: payload.email,
      password,
      role: 'parent',
    });
  }

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};
