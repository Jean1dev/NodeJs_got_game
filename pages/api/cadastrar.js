import { getDb } from '../../lib/mongodb';
import crypto from 'crypto';

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

const CASAS_VALIDAS = [
  'Arryn', 'Baratheon', 'Greyjoy', 'Lannister',
  'Martell', 'Stark', 'Targaryen', 'Tully', 'Tyrell',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { nome, usuario, senha, casa } = req.body;

  if (!nome || !usuario || !senha || !casa) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  if (!CASAS_VALIDAS.includes(casa)) {
    return res.status(400).json({ error: 'Casa inválida' });
  }

  try {
    const db = await getDb();

    const existing = await db.collection('usuarios').findOne({ usuario });
    if (existing) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    await db.collection('usuarios').insertOne({
      nome,
      usuario,
      senha: md5(senha),
      casa,
    });

    await db.collection('jogo').insertOne({
      usuario,
      moeda: 15,
      suditos: 10,
      temor: Math.floor(Math.random() * 1000),
      sabedoria: Math.floor(Math.random() * 1000),
      comercio: Math.floor(Math.random() * 1000),
      magia: Math.floor(Math.random() * 1000),
    });

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
