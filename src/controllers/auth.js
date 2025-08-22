import { ONE_MONTH } from '../constants/index.js';
import {
  getUserBySessionId,
  loginUser,
  loginWithGoogle,
  logoutUser,
  refreshUserSession,
  registerUser,
  requestResetPassword,
  resetPassword,
} from '../services/auth.js';
import { generateAuthUrl } from '../utils/googleAuth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
    sameSite: 'none',
    secure: true,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
    sameSite: 'none',
    secure: true,
  });

  const user = await getUserBySessionId(session.userId);

  res.json({
    user: {
      name: user.name,
      email: user.email,
    },
    accessToken: session.accessToken,
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.sendStatus(204);
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_MONTH),
    sameSite: 'none',
    secure: true,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_MONTH),
    sameSite: 'none',
    secure: true,
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUserSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  const user = await getUserBySessionId(session.userId);

  res.json({
    user: {
      name: user.name,
      email: user.email,
    },
    accessToken: session.accessToken,
  });
};

export const requestResetPasswordController = async (req, res) => {
  await requestResetPassword(req.body.email);

  res.json({
    message: 'Reset password email has been successfully sent.',
  });
};

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;

  await resetPassword(token, password);

  res.json({
    message: 'Password has been successfully reset.',
  });
};

export const getGoogleAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();

  res.json({
    message: 'Successfully get Google OAuth url!',
    url,
  });
};

export const loginWithGoogleController = async (req, res) => {
  const session = await loginWithGoogle(req.body.code);

  setupSession(res, session);

  const user = await getUserBySessionId(session.userId);

  res.json({
    user: {
      name: user.name,
      email: user.email,
    },
    accessToken: session.accessToken,
  });
};
