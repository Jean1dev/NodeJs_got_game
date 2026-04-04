import { getDb } from '../../../lib/mongodb';
import { withSessionRoute } from '../../../lib/session';
import { ObjectId } from 'mongodb';

async function revogarAcaoHandler(req, res) {
  if (!req.session.autorizado) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID da ação é obrigatório' });
  }

  try {
    const db = await getDb();

    const acao = await db.collection('acao').findOne({
      _id: new ObjectId(id),
      usuario: req.session.usuario,
    });

    if (!acao) {
      return res.status(404).json({ error: 'Ação não encontrada' });
    }

    // Devolver moedas/suditos conforme o tipo de ação
    let update = {};
    switch (acao.acao) {
      case 1:
        update = { $inc: { moeda: 2 * acao.quantidade } };
        break;
      case 2:
        update = { $inc: { moeda: 3 * acao.quantidade, suditos: acao.quantidade } };
        break;
      case 3:
      case 4:
        update = { $inc: { moeda: 1 * acao.quantidade } };
        break;
    }

    if (Object.keys(update).length > 0) {
      await db.collection('jogo').updateOne({ usuario: req.session.usuario }, update);
    }

    await db.collection('acao').deleteOne({ _id: new ObjectId(id) });

    return res.status(200).json({ success: true, message: 'Ação revogada com sucesso' });
  } catch (err) {
    console.error('Erro ao revogar ação:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withSessionRoute(revogarAcaoHandler);
