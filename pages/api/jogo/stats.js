import { getDb } from '../../../lib/mongodb';
import { withSessionRoute } from '../../../lib/session';

async function statsHandler(req, res) {
  if (!req.session.autorizado) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const db = await getDb();
    const jogo = await db.collection('jogo').findOne({ usuario: req.session.usuario });

    if (!jogo) {
      return res.status(404).json({ error: 'Dados do jogo não encontrados' });
    }

    return res.status(200).json({
      usuario: req.session.usuario,
      casa: req.session.casa,
      moeda: jogo.moeda,
      suditos: jogo.suditos,
      temor: jogo.temor,
      sabedoria: jogo.sabedoria,
      comercio: jogo.comercio,
      magia: jogo.magia,
    });
  } catch (err) {
    console.error('Erro ao buscar stats:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withSessionRoute(statsHandler);
