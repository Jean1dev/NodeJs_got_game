import { getDb } from '../../../lib/mongodb';
import { withSessionRoute } from '../../../lib/session';

async function pergaminhosHandler(req, res) {
  if (!req.session.autorizado) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const db = await getDb();
    const now = Date.now();

    // Processar ações concluídas
    const acoesCompletas = await db.collection('acao').find({
      usuario: req.session.usuario,
      acao_termina_em: { $lte: now },
    }).toArray();

    for (const acao of acoesCompletas) {
      let update = {};
      switch (acao.acao) {
        case 1: // Coletar recursos
          update = { $inc: { moeda: acao.quantidade * 3 } };
          break;
        case 2: // Executar - reduz suditos (já foi descontado na criação)
          update = { $inc: { moeda: 1 } };
          break;
        case 3: // Ensinar história
          update = { $inc: { sabedoria: acao.quantidade * 10 } };
          break;
        case 4: // Ensinar magia
          update = { $inc: { magia: acao.quantidade * 10 } };
          break;
      }
      if (Object.keys(update).length > 0) {
        await db.collection('jogo').updateOne({ usuario: req.session.usuario }, update);
      }
      await db.collection('acao').deleteOne({ _id: acao._id });
    }

    // Buscar ações pendentes
    const acoes = await db.collection('acao').find({
      usuario: req.session.usuario,
    }).toArray();

    const acoesFormatadas = acoes.map(a => ({
      _id: a._id.toString(),
      acao: a.acao,
      quantidade: a.quantidade,
      descricao: a.descricao,
      acao_termina_em: a.acao_termina_em,
      tempo_restante: Math.max(0, a.acao_termina_em - now),
    }));

    return res.status(200).json({ acoes: acoesFormatadas });
  } catch (err) {
    console.error('Erro ao buscar pergaminhos:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withSessionRoute(pergaminhosHandler);
