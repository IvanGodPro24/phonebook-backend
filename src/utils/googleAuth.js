import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';
import { getEnvVar } from './getEnvVar.js';

const googleOAuthClient = new OAuth2Client({
  clientId: getEnvVar('GOOGLE_CLIENT_ID'),
  clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
  redirectUri: getEnvVar('GOOGLE_REDIRECT_URI'),
});

export const generateAuthUrl = () =>
  googleOAuthClient.generateAuthUrl({
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });

export const getTicket = async (code) => {
  const response = await googleOAuthClient.getToken(code);

  if (!response.tokens.id_token) throw createHttpError(401, 'Unauthorized');

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: response.tokens.id_token,
  });

  return ticket;
};

export const getFullName = (payload) => {
  let fullname = 'Guest';

  if (payload.given_name && payload.family_name) {
    fullname = `${payload.given_name} ${payload.family_name}`;
  } else if (payload.given_name) {
    fullname = payload.given_name;
  }

  return fullname;
};
