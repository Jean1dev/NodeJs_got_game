import { useState } from 'react';

const ACOES = [
  {
    id: '1',
    nome: 'Coletar Recursos',
    descricao: 'Envie súditos para recolher recursos nos arredores.',
    efeito: '+3 G / súdito',
    custoMoeda: 2,
    custoSudito: 0,
    duracao: '1 min',
    cor: '#6e8a4a',
    img: '/images/habilidades/comercio.jpg',
  },
  {
    id: '2',
    nome: 'Executar Súdito',
    descricao: 'Elimine os fracos e governe pelo medo.',
    efeito: '+ Temor',
    custoMoeda: 3,
    custoSudito: 1,
    duracao: '2 min',
    cor: '#8a2a22',
    img: '/images/habilidades/temor.jpg',
  },
  {
    id: '3',
    nome: 'Ensinar História',
    descricao: 'Instrua o povo nas crônicas de Westeros.',
    efeito: '+10 Sabedoria',
    custoMoeda: 1,
    custoSudito: 0,
    duracao: '5 min',
    cor: '#4a6e8a',
    img: '/images/habilidades/sabedoria.jpg',
  },
  {
    id: '4',
    nome: 'Ensinar Magia',
    descricao: 'Desperte o poder das artes arcanas.',
    efeito: '+10 Magia',
    custoMoeda: 1,
    custoSudito: 0,
    duracao: '5 min',
    cor: '#6a4a8a',
    img: '/images/habilidades/magia.jpg',
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
    <div className="got-card aldeoes">
      <div className="aldeoes-inner">
        {/* Header */}
        <div className="aldeoes-header">
          <div>
            <h2 className="aldeoes-title">Ordenar Súditos</h2>
            <p className="aldeoes-desc">Designe seu povo às tarefas do reino.</p>
          </div>
          <div className="aldeoes-resources">
            <div className="res-badge">
              <span className="res-icon"><img src="/images/outros/suditos.jpg" alt="Súditos" /></span>
              <span>{suditos}</span>
            </div>
            <div className="res-badge gold">
              <span className="res-icon round"><img src="/images/outros/moeda.jpg" alt="Moedas" /></span>
              <span className="nowrap">{moedas} G</span>
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
                style={{ '--action-color': a.cor }}
                onClick={() => setAcaoSelecionada(selected ? null : a.id)}
              >
                <div className="ac-rail" />
                {selected && <div className="ac-selected-mark">✦</div>}
                <div className="ac-icon-frame">
                  <img src={a.img} alt={a.nome} className="ac-icon" />
                </div>
                <div className="ac-body">
                  <div className="ac-name">{a.nome}</div>
                  <div className="ac-desc">{a.descricao}</div>
                  <div className="ac-meta">
                    <span className="ac-cost">
                      −{a.custoMoeda} G{a.custoSudito > 0 ? ` · −${a.custoSudito} súdito` : ''}
                    </span>
                    <span className="ac-reward">{a.efeito}</span>
                    <span className="ac-duration">⏱ {a.duracao}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Order form */}
        {acaoSelecionada && (
          <div className="order-panel animate-fade">
            <div className="order-divider">
              <span className="line" />
              <span>Configurar Ordem — {acao.nome}</span>
              <span className="line" />
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
                    <span className={`summary-val ${suditos < suditosNecessarios ? 'insuf' : 'wax'}`}>
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
      </div>

      <style jsx>{`
        .aldeoes {
          max-width: 720px;
          margin: 0 auto;
          animation: fadeIn 0.3s ease;
        }

        .aldeoes-inner { padding: 32px 36px 36px; }

        /* Header */
        .aldeoes-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(120, 90, 40, 0.25);
          padding-bottom: 18px;
          gap: 16px;
        }

        .aldeoes-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.35rem;
          letter-spacing: 0.05em;
          color: var(--ink);
          margin: 0;
        }

        .aldeoes-desc {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.92rem;
          color: var(--ink-dim);
          margin: 5px 0 0;
        }

        .aldeoes-resources {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .res-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 13px;
          background: rgba(255, 251, 240, 0.55);
          border: 1px solid rgba(120, 90, 40, 0.32);
          border-radius: var(--radius-sm);
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--ink-leather);
        }

        .res-badge.gold {
          background: rgba(154, 123, 52, 0.12);
          border-color: rgba(154, 123, 52, 0.4);
          color: var(--gold-dark);
        }

        .res-icon {
          width: 22px;
          height: 22px;
          border-radius: 3px;
          overflow: hidden;
          display: block;
        }
        .res-icon.round { border-radius: 50%; }
        .res-icon img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .nowrap { white-space: nowrap; }

        /* Action grid */
        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .action-card {
          position: relative;
          display: flex;
          gap: 14px;
          padding: 16px 16px 16px 18px;
          background: rgba(255, 251, 240, 0.5);
          border: 1px solid rgba(120, 90, 40, 0.3);
          border-radius: var(--radius-md);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          overflow: hidden;
        }

        .ac-rail {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: var(--action-color);
        }

        .action-card:hover {
          border-color: var(--border-mid);
          transform: translateY(-1px);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5), 0 8px 18px -12px rgba(74, 58, 32, 0.5);
        }

        .action-card.selected {
          border: 2px solid var(--gold-leaf);
          box-shadow: 0 0 0 1px rgba(216, 182, 94, 0.4);
        }

        .ac-icon-frame {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(74, 58, 32, 0.45);
          box-shadow: 0 4px 10px -5px rgba(0, 0, 0, 0.4);
        }

        .ac-icon { width: 100%; height: 100%; object-fit: cover; display: block; }

        .ac-body { flex: 1; min-width: 0; }

        .ac-name {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .ac-desc {
          font-family: var(--font-body);
          font-size: 0.92rem;
          color: var(--ink-body);
          line-height: 1.35;
          margin-bottom: 10px;
        }

        .ac-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ac-cost, .ac-reward, .ac-duration {
          font-family: var(--font-ui);
          font-size: 0.58rem;
          letter-spacing: 0.04em;
          padding: 3px 7px;
          border-radius: 3px;
        }

        .ac-cost     { background: rgba(138, 42, 34, 0.1);  color: var(--red-wax); border: 1px solid rgba(138, 42, 34, 0.3); }
        .ac-reward   { background: rgba(74, 110, 60, 0.13); color: #4a6e3c;        border: 1px solid rgba(74, 110, 60, 0.34); }
        .ac-duration { background: rgba(120, 90, 40, 0.1);  color: var(--ink-body); border: 1px solid rgba(120, 90, 40, 0.3); }

        .ac-selected-mark {
          position: absolute;
          top: 10px; right: 12px;
          color: #8a6d2e;
          font-size: 0.8rem;
          animation: fadeIn 0.2s;
        }

        /* Order panel */
        .order-panel {
          margin-top: 18px;
          padding: 22px 24px;
          background: rgba(255, 251, 240, 0.6);
          border: 1px solid rgba(154, 123, 52, 0.45);
          border-radius: var(--radius-md);
          box-shadow: inset 0 0 16px rgba(154, 123, 52, 0.08);
        }

        .order-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          font-family: var(--font-ui);
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8a6d2e;
        }

        .order-divider .line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(154, 123, 52, 0.5), transparent);
        }

        .order-controls {
          display: flex;
          gap: 32px;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        /* Quantity input */
        .qty-wrap { flex: 0 0 auto; }

        .qty-input {
          display: flex;
          align-items: center;
          margin-top: 2px;
        }

        .qty-btn {
          width: 40px;
          height: 42px;
          background: rgba(255, 251, 240, 0.7);
          border: 1px solid rgba(120, 90, 40, 0.4);
          color: #8a6d2e;
          font-size: 1.1rem;
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .qty-btn:first-child { border-radius: var(--radius-sm) 0 0 var(--radius-sm); }
        .qty-btn:last-child  { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
        .qty-btn:hover { background: rgba(154, 123, 52, 0.15); }

        .qty-field {
          width: 70px !important;
          height: 42px;
          text-align: center;
          border-radius: 0 !important;
          border-left: none !important;
          border-right: none !important;
          font-family: var(--font-ui) !important;
          font-size: 1.05rem;
        }

        /* Summary */
        .order-summary {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 9px;
          padding-top: 2px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dotted rgba(120, 90, 40, 0.3);
          padding-bottom: 7px;
        }
        .summary-row:last-child { border-bottom: none; padding-bottom: 0; }

        .summary-label {
          font-family: var(--font-ui);
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-dim);
        }

        .summary-val {
          font-family: var(--font-ui);
          font-size: 0.88rem;
          color: var(--ink);
        }

        .summary-val.insuf { color: var(--red-fire); }
        .summary-val.wax   { color: var(--red-wax); }
        .summary-val.gold  { color: #8a6d2e; }

        /* Order button */
        .order-btn {
          width: 100%;
          padding: 14px;
        }

        .order-btn.disabled {
          background: rgba(138, 42, 34, 0.08);
          border-color: rgba(138, 42, 34, 0.4);
          color: var(--red-wax);
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
