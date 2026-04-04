import { getDb } from '../../../lib/mongodb';
import { withSessionRoute } from '../../../lib/session';

async function suditosHandler(req, res) {
  if (!req.session.autorizado) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { acao, quantidade } = req.body;
  const qtd = parseInt(quantidade, 10);

  if (!acao || isNaN(qtd) || qtd <= 0) {
    return res.status(400).json({ error: 'Ação e quantidade são obrigatórios' });
  }

  const acaoNum = parseInt(acao, 10);
  if (![1, 2, 3, 4].includes(acaoNum)) {
    return res.status(400).json({ error: 'Tipo de ação inválido' });
  }

  try {
    const db = await getDb();
    const jogo = await db.collection('jogo').findOne({ usuario: req.session.usuario });

    if (!jogo) {
      return res.status(404).json({ error: 'Dados do jogo não encontrados' });
    }

    // Calcular custos por tipo de ação
    let custoMoeda = 0;
    let custoSudito = 0;
    let duracaoMs = 0;
    let descricao = '';

    switch (acaoNum) {
      case 1: // Coletar recursos
        custoMoeda = 2 * qtd;
        custoSudito = 0;
        duracaoMs = 1 * 60 * 1000;
        descricao = 'Coletando recursos';
        break;
      case 2: // Executar súdito
        custoMoeda = 3 * qtd;
        custoSudito = qtd;
        duracaoMs = 2 * 60 * 1000;
        descricao = 'Executando súditos';
        break;
      case 3: // Ensinar história
        custoMoeda = 1 * qtd;
        custoSudito = 0;
        duracaoMs = 5 * 60 * 1000;
        descricao = 'Ensinando história';
        break;
      case 4: // Ensinar magia
        custoMoeda = 1 * qtd;
        custoSudito = 0;
        duracaoMs = 5 * 60 * 1000;
        descricao = 'Ensinando magia';
        break;
    }

    if (jogo.moeda < custoMoeda) {
      return res.status(400).json({ error: 'Moedas insuficientes' });
    }

    if (jogo.suditos < (custoSudito + qtd)) {
      return res.status(400).json({ error: 'Súditos insuficientes' });
    }

    const acaoTerminaEm = Date.now() + duracaoMs;

    await db.collection('jogo').updateOne(
      { usuario: req.session.usuario },
      { $inc: { moeda: -custoMoeda, suditos: -custoSudito } }
    );

    await db.collection('acao').insertOne({
      usuario: req.session.usuario,
      acao: acaoNum,
      quantidade: qtd,
      acao_termina_em: acaoTerminaEm,
      descricao,
    });

    return res.status(200).json({ success: true, message: 'Ação ordenada com sucesso' });
  } catch (err) {
    console.error('Erro ao ordenar ação:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export default withSessionRoute(suditosHandler);
