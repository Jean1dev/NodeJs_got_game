import { withSessionRoute } from '../../../lib/session';

async function logoutHandler(req, res) {
  req.session.destroy();
  return res.status(200).json({ success: true });
}

export default withSessionRoute(logoutHandler);
