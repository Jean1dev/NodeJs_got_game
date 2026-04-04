import { getIronSession } from 'iron-session';

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'got-game-secret-key-must-be-32chars!!',
  cookieName: 'got-game-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession(req, res) {
  return getIronSession(req, res, sessionOptions);
}

export function withSessionRoute(handler) {
  return async function (req, res) {
    const session = await getIronSession(req, res, sessionOptions);
    req.session = session;
    return handler(req, res);
  };
}

export function withSessionSsr(handler) {
  return async function (context) {
    const session = await getIronSession(
      context.req,
      context.res,
      sessionOptions
    );
    context.req.session = session;
    return handler(context);
  };
}
