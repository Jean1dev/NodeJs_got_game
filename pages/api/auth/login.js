import { getDb } from '../../../lib/mongodb';
import { withSessionRoute } from '../../../lib/session';
import crypto from 'crypto';

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  try {
    const db = await getDb();
    const user = await db.collection('usuarios').findOne({
      usuario,
      senha: md5(senha),
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    req.session.autorizado = true;
    req.session.usuario = user.usuario;
    req.session.casa = user.casa;
    await req.session.save();

    return res.status(200).json({
      success: true,
      usuario: user.usuario,
      casa: user.casa,
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withSessionRoute(loginHandler);
