import { useState } from 'react';

const ACOES = [
  {
    id: '1',
    nome: 'Coletar Recursos',
    descricao: 'Envie súditos para coletar recursos nos arredores',
    efeito: '+3G por súdito ao concluir',
    custoMoeda: 2,
    custoSudito: 0,
    duracao: '1 min',
    cor: '#4a8f4a',
    corBorda: 'rgba(74,143,74,0.5)',
    icone: '⚒',
  },
  {
    id: '2',
    nome: 'Executar Súdito',
    descricao: 'Elimine os fracos para fortalecer o reino com o medo',
    efeito: '+Temor e intimidação',
    custoMoeda: 3,
    custoSudito: 1,
    duracao: '2 min',
    cor: '#8b1a1a',
    corBorda: 'rgba(139,26,26,0.5)',
    icone: '⚔',
  },
  {
    id: '3',
    nome: 'Ensinar História',
    descricao: 'Instruía os súditos nos livros e crônicas de Westeros',
    efeito: '+10 Sabedoria por súdito',
    custoMoeda: 1,
    custoSudito: 0,
    duracao: '5 min',
    cor: '#4a6e8f',
    corBorda: 'rgba(74,110,143,0.5)',
    icone: '📜',
  },
  {
    id: '4',
    nome: 'Ensinar Magia',
    descricao: 'Desperte o poder das artes arcanas em seus seguidores',
    efeito: '+10 Magia por súdito',
    custoMoeda: 1,
    custoSudito: 0,
    duracao: '5 min',
    cor: '#6a3d8f',
    corBorda: 'rgba(106,61,143,0.5)',
    icone: '✦',
  },
];

export default function Aldeoes({ onAcaoConcluida, onErro, suditos = 0, moedas = 0 }) {
  const [acaoSelecionada, setAcaoSelecionada] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [carregando, setCarregando] = useState(false);

  const acao = ACOES.find(a => a.id === acaoSelecionada);
  const custoTotal = acao ? acao.custoMoeda * quantidade : 0;
  const suditosNecessarios = acao ? (acao.custoSudito + 1) * quantidade : 0;
  const podeExecutar = acao && moedas >= custoTotal && suditos >= suditosNecessarios;

  async function handleOrdenar() {
    if (!acaoSelecionada) { onErro('Selecione uma ação'); return; }
    if (quantidade < 1) { onErro('Quantidade inválida'); return; }

    setCarregando(true);
    try {
      const res = await fetch('/api/jogo/suditos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: acaoSelecionada, quantidade }),
      });
      const data = await res.json();
      if (!res.ok) {
        onErro(data.error || 'Erro ao ordenar ação');
      } else {
        setAcaoSelecionada(null);
        setQuantidade(1);
        onAcaoConcluida(data.message || `${acao.nome} ordenada para ${quantidade} súdito(s)!`);
      }
    } catch {
      onErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="aldeoes">
      {/* Header */}
      <div className="aldeoes-header">
        <h2 className="aldeoes-title">Ordenar Súditos</h2>
        <div className="aldeoes-resources">
          <div className="res-badge">
            <img src="/images/outros/suditos.jpg" alt="Súditos" />
            <span>{suditos}</span>
          </div>
          <div className="res-badge gold">
            <img src="/images/outros/moeda.jpg" alt="Moedas" />
            <span>{moedas} G</span>
          </div>
        </div>
      </div>

      {/* Action cards */}
      <div className="actions-grid">
        {ACOES.map(a => {
          const selected = acaoSelecionada === a.id;
          return (
            <button
              key={a.id}
              className={`action-card ${selected ? 'selected' : ''}`}
              style={{ '--action-color': a.cor, '--action-border': a.corBorda }}
              onClick={() => setAcaoSelecionada(selected ? null : a.id)}
            >
              <div className="ac-icon">{a.icone}</div>
              <div className="ac-body">
                <div className="ac-name">{a.nome}</div>
                <div className="ac-desc">{a.descricao}</div>
                <div className="ac-meta">
                  <span className="ac-cost">
                    -{a.custoMoeda}G {a.custoSudito > 0 ? `• -${a.custoSudito} súdito` : ''}
                  </span>
                  <span className="ac-reward">{a.efeito}</span>
                  <span className="ac-duration">⏱ {a.duracao}</span>
                </div>
              </div>
              {selected && <div className="ac-selected-mark">✦</div>}
            </button>
          );
        })}
      </div>

      {/* Order form */}
      {acaoSelecionada && (
        <div className="order-panel animate-fade">
          <div className="order-divider">
            <span>Configurar Ordem</span>
          </div>

          <div className="order-controls">
            <div className="qty-wrap">
              <label className="form-label">Súditos a enviar</label>
              <div className="qty-input">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                >−</button>
                <input
                  type="number"
                  className="form-control qty-field"
                  min="1"
                  max={suditos}
                  value={quantidade}
                  onChange={e => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantidade(q => q + 1)}
                >+</button>
              </div>
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span className="summary-label">Custo total</span>
                <span className={`summary-val ${moedas < custoTotal ? 'insuf' : ''}`}>
                  {custoTotal} G
                </span>
              </div>
              {acao.custoSudito > 0 && (
                <div className="summary-row">
                  <span className="summary-label">Súditos perdidos</span>
                  <span className={`summary-val ${suditos < suditosNecessarios ? 'insuf' : ''}`}>
                    {acao.custoSudito * quantidade}
                  </span>
                </div>
              )}
              <div className="summary-row">
                <span className="summary-label">Duração</span>
                <span className="summary-val gold">{acao.duracao}</span>
              </div>
            </div>
          </div>

          <button
            className={`btn-got btn-got-primary order-btn ${!podeExecutar ? 'disabled' : ''}`}
            onClick={handleOrdenar}
            disabled={carregando || !podeExecutar}
          >
            {carregando
              ? '⟳ Ordenando...'
              : !podeExecutar
              ? '✕ Recursos insuficientes'
              : `⚔ Ordenar ${acao.nome}`}
          </button>
        </div>
      )}

      <style jsx>{`
        .aldeoes {
          max-width: 680px;
          animation: fadeIn 0.3s ease;
        }

        /* Header */
        .aldeoes-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .aldeoes-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          letter-spacing: 0.1em;
          color: var(--gold);
          margin: 0;
        }

        .aldeoes-resources {
          display: flex;
          gap: 10px;
        }

        .res-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(0,0,0,0.5);
          border: 1px solid var(--border-dark);
          border-radius: var(--radius-sm);
          font-family: var(--font-ui);
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .res-badge.gold { color: var(--gold); }

        .res-badge img {
          width: 20px;
          height: 20px;
          border-radius: 3px;
          object-fit: cover;
        }

        /* Action grid */
        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }

        .action-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          background: rgba(10, 8, 4, 0.85);
          border: 1px solid var(--border-dark);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .action-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--action-color);
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .action-card:hover {
          border-color: var(--action-border);
          background: rgba(15, 12, 6, 0.9);
          transform: translateY(-1px);
        }

        .action-card:hover::before { opacity: 1; }

        .action-card.selected {
          border-color: var(--action-border);
          background: rgba(20, 15, 8, 0.95);
          box-shadow: 0 0 16px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.2);
        }

        .action-card.selected::before { opacity: 1; width: 4px; }

        .ac-icon {
          font-size: 1.4rem;
          line-height: 1;
          flex-shrink: 0;
          margin-top: 2px;
          width: 28px;
          text-align: center;
        }

        .ac-body { flex: 1; min-width: 0; }

        .ac-name {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-parchment);
          margin-bottom: 4px;
        }

        .ac-desc {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--text-dim);
          line-height: 1.35;
          margin-bottom: 8px;
        }

        .ac-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ac-cost, .ac-reward, .ac-duration {
          font-family: var(--font-ui);
          font-size: 0.62rem;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .ac-cost     { background: rgba(139,26,26,0.25); color: #d07070; border: 1px solid rgba(139,26,26,0.3); }
        .ac-reward   { background: rgba(74,143,74,0.2);  color: #80c880; border: 1px solid rgba(74,143,74,0.3); }
        .ac-duration { background: rgba(255,255,255,0.05); color: var(--text-faint); border: 1px solid var(--border-dark); }

        .ac-selected-mark {
          position: absolute;
          top: 8px; right: 10px;
          color: var(--gold);
          font-size: 0.7rem;
          animation: fadeIn 0.2s;
        }

        /* Order panel */
        .order-panel {
          background: rgba(8, 6, 3, 0.9);
          border: 1px solid var(--border-mid);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .order-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          font-family: var(--font-ui);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold);
        }

        .order-divider::before,
        .order-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-mid), transparent);
        }

        .order-controls {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        /* Quantity input */
        .qty-wrap { flex: 0 0 auto; }

        .qty-input {
          display: flex;
          align-items: center;
          gap: 0;
          margin-top: 6px;
        }

        .qty-btn {
          width: 36px;
          height: 38px;
          background: rgba(0,0,0,0.6);
          border: 1px solid var(--border-dark);
          color: var(--gold);
          font-size: 1.1rem;
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .qty-btn:first-child { border-radius: var(--radius-sm) 0 0 var(--radius-sm); }
        .qty-btn:last-child  { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
        .qty-btn:hover { background: var(--bg-hover); border-color: var(--gold-dark); }

        .qty-field {
          width: 64px !important;
          text-align: center;
          border-radius: 0 !important;
          border-left: none !important;
          border-right: none !important;
          font-family: var(--font-ui) !important;
        }

        /* Summary */
        .order-summary {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-label {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .summary-val {
          font-family: var(--font-ui);
          font-size: 0.85rem;
          color: var(--text-parchment);
        }

        .summary-val.insuf { color: #e05858; }
        .summary-val.gold  { color: var(--gold); }

        /* Order button */
        .order-btn {
          width: 100%;
          padding: 13px;
          font-size: 0.82rem;
        }

        .order-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: var(--red-blood);
          color: #c06060;
        }
      `}</style>
    </div>
  );
}
