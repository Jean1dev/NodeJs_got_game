import { useState, useEffect, useCallback } from 'react';

const ACAO_META = {
  1: { nome: 'Coletando Recursos',  img: '/images/habilidades/comercio.jpg',  cor: '#6e8a4a', durTotal: 1 * 60 * 1000 },
  2: { nome: 'Executando Súditos',  img: '/images/habilidades/temor.jpg',     cor: '#8a2a22', durTotal: 2 * 60 * 1000 },
  3: { nome: 'Ensinando História',  img: '/images/habilidades/sabedoria.jpg', cor: '#4a6e8a', durTotal: 5 * 60 * 1000 },
  4: { nome: 'Ensinando Magia',     img: '/images/habilidades/magia.jpg',     cor: '#6a4a8a', durTotal: 5 * 60 * 1000 },
};

function formatarTempo(ms) {
  if (ms <= 0) return '0:00';
  const totalSeg = Math.ceil(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${seg.toString().padStart(2, '0')}`;
}

export default function Pergaminhos({ onRevogado, onErro }) {
  const [acoes, setAcoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [revogando, setRevogando] = useState(null);
  const [confirmar, setConfirmar] = useState(null);
  const [tempos, setTempos] = useState({});

  const carregarAcoes = useCallback(async () => {
    try {
      const res = await fetch('/api/jogo/pergaminhos');
      if (!res.ok) return;
      const data = await res.json();
      setAcoes(data.acoes || []);
      const t = {};
      for (const a of data.acoes || []) t[a._id] = a.tempo_restante;
      setTempos(t);
    } catch { /* silencioso */ }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregarAcoes(); }, [carregarAcoes]);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTempos(prev => {
        const novo = {};
        for (const id in prev) novo[id] = Math.max(0, prev[id] - 1000);
        return novo;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Recarregar ao concluir
  useEffect(() => {
    const algumZerou = Object.values(tempos).some(t => t === 0);
    if (algumZerou && acoes.length > 0) {
      const t = setTimeout(() => carregarAcoes(), 2500);
      return () => clearTimeout(t);
    }
  }, [tempos, acoes.length, carregarAcoes]);

  async function revogarAcao(id) {
    setRevogando(id);
    setConfirmar(null);
    try {
      const res = await fetch('/api/jogo/revogar-acao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        onErro(data.error || 'Erro ao revogar ação');
      } else {
        onRevogado(data.message || 'Ação revogada com sucesso!');
        carregarAcoes();
      }
    } catch { onErro('Erro de conexão'); }
    finally { setRevogando(null); }
  }

  if (carregando) {
    return (
      <div className="got-card perg">
        <div className="perg-inner">
          <div className="perg-loading">
            <div className="perg-spinner">⟳</div>
            Consultando os pergaminhos...
          </div>
        </div>
        <style jsx>{loadingStyles}</style>
      </div>
    );
  }

  return (
    <div className="got-card perg">
      <div className="perg-inner">
        {/* Header */}
        <div className="perg-header">
          <div>
            <h2 className="perg-title">Pergaminhos Ativos</h2>
            <p className="perg-desc">As ordens decretadas e seu progresso.</p>
          </div>
          <button className="btn-got perg-refresh" onClick={carregarAcoes}>
            ↻ Atualizar
          </button>
        </div>

        {acoes.length === 0 ? (
          <div className="perg-empty">
            <div className="perg-empty-seal">✦</div>
            <p className="perg-empty-text">Nenhuma ordem em andamento.</p>
            <p className="perg-empty-hint">
              Ordene seus súditos para ver as ações aqui.
            </p>
          </div>
        ) : (
          <div className="scroll-list">
            {acoes.map(acao => {
              const meta = ACAO_META[acao.acao] || ACAO_META[1];
              const tempoRestante = tempos[acao._id] ?? acao.tempo_restante;
              const concluido = tempoRestante <= 0;
              const pct = concluido
                ? 100
                : Math.max(0, Math.min(100, ((meta.durTotal - tempoRestante) / meta.durTotal) * 100));

              const confirmando = confirmar === acao._id;

              return (
                <div
                  key={acao._id}
                  className={`scroll-card ${concluido ? 'done' : ''}`}
                  style={{ '--action-color': meta.cor }}
                >
                  {/* Top row */}
                  <div className="scroll-top">
                    <div className="scroll-icon-frame">
                      <img src={meta.img} alt={meta.nome} className="scroll-icon" />
                    </div>

                    <div className="scroll-info">
                      <div className="scroll-name">{acao.descricao || meta.nome}</div>
                      <div className="scroll-sub">
                        {acao.quantidade} súdito{acao.quantidade !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="scroll-right">
                      {concluido ? (
                        <div className="scroll-done-badge">✓ Concluído</div>
                      ) : (
                        <div className="scroll-timer">{formatarTempo(tempoRestante)}</div>
                      )}

                      {!concluido && !confirmando && (
                        <button
                          className="scroll-revoke-btn"
                          onClick={() => setConfirmar(acao._id)}
                          disabled={revogando === acao._id}
                          title="Revogar ordem"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="scroll-progress-track">
                    <div
                      className={`scroll-progress-fill ${concluido ? 'done' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Confirm revoke */}
                  {confirmando && (
                    <div className="scroll-confirm animate-fade">
                      <span className="confirm-text">Revogar e recuperar recursos?</span>
                      <div className="confirm-btns">
                        <button
                          className="btn-got btn-got-danger confirm-yes"
                          onClick={() => revogarAcao(acao._id)}
                          disabled={revogando === acao._id}
                        >
                          {revogando === acao._id ? '...' : 'Sim, revogar'}
                        </button>
                        <button
                          className="btn-got confirm-no"
                          onClick={() => setConfirmar(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .perg {
          max-width: 720px;
          margin: 0 auto;
          animation: fadeIn 0.3s ease;
        }

        .perg-inner { padding: 32px 36px 36px; }

        /* Header */
        .perg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(120, 90, 40, 0.25);
          padding-bottom: 18px;
          gap: 16px;
        }

        .perg-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.35rem;
          letter-spacing: 0.05em;
          color: var(--ink);
          margin: 0;
        }

        .perg-desc {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.92rem;
          color: var(--ink-dim);
          margin: 5px 0 0;
        }

        .perg-refresh {
          padding: 8px 16px;
          font-size: 0.62rem;
          flex-shrink: 0;
        }

        /* Empty state */
        .perg-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 24px;
          text-align: center;
        }

        .perg-empty-seal {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: radial-gradient(circle at 36% 32%, #b8463a, #8a2a22 60%, #5e1c16 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f3d9a0;
          font-family: var(--font-ui);
          font-size: 1.2rem;
          opacity: 0.6;
          margin-bottom: 14px;
        }

        .perg-empty-text {
          font-family: var(--font-ui);
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          color: var(--ink-dim);
          margin-bottom: 6px;
        }

        .perg-empty-hint {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.9rem;
          color: var(--ink-faint);
        }

        /* Scroll list */
        .scroll-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Scroll card */
        .scroll-card {
          position: relative;
          padding: 16px 18px;
          background: rgba(255, 251, 240, 0.5);
          border: 1px solid rgba(120, 90, 40, 0.28);
          border-left: 4px solid var(--action-color);
          border-radius: var(--radius-md);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
          transition: border-color 0.3s;
        }

        .scroll-card.done {
          border-left-color: #4a6e3c;
        }

        /* Top row */
        .scroll-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
        }

        .scroll-icon-frame {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(74, 58, 32, 0.4);
        }

        .scroll-icon { width: 100%; height: 100%; object-fit: cover; display: block; }

        .scroll-info { flex: 1; min-width: 0; }

        .scroll-name {
          font-family: var(--font-ui);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink);
        }

        .scroll-sub {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--ink-dim);
        }

        .scroll-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .scroll-timer {
          font-family: var(--font-ui);
          font-size: 1.05rem;
          color: #8a6d2e;
          min-width: 54px;
          text-align: right;
          letter-spacing: 0.04em;
        }

        .scroll-done-badge {
          font-family: var(--font-ui);
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4a6e3c;
          padding: 4px 10px;
          border: 1px solid rgba(74, 110, 60, 0.4);
          border-radius: var(--radius-sm);
          background: rgba(74, 110, 60, 0.12);
        }

        .scroll-revoke-btn {
          width: 28px;
          height: 28px;
          background: rgba(138, 42, 34, 0.1);
          border: 1px solid rgba(138, 42, 34, 0.4);
          border-radius: var(--radius-sm);
          color: var(--red-wax);
          cursor: pointer;
          font-size: 0.7rem;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .scroll-revoke-btn:hover {
          background: rgba(138, 42, 34, 0.2);
          border-color: var(--red-wax);
          color: var(--red-deep);
        }

        /* Progress */
        .scroll-progress-track {
          height: 5px;
          background: rgba(74, 58, 32, 0.14);
          border-radius: 3px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(44, 33, 20, 0.25);
        }

        .scroll-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--action-color), color-mix(in srgb, var(--action-color) 55%, #f4ead2));
          border-radius: 3px;
          transition: width 1s linear;
          box-shadow: 0 0 6px var(--action-color);
        }

        .scroll-progress-fill.done {
          background: linear-gradient(90deg, #4a6e3c, #7da45a);
          box-shadow: 0 0 6px rgba(74, 110, 60, 0.5);
        }

        /* Confirm */
        .scroll-confirm {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(120, 90, 40, 0.25);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .confirm-text {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.9rem;
          color: var(--ink-dim);
        }

        .confirm-btns {
          display: flex;
          gap: 8px;
        }

        .confirm-yes, .confirm-no {
          padding: 7px 14px;
          font-size: 0.62rem;
        }
      `}</style>
    </div>
  );
}

const loadingStyles = `
  .perg {
    max-width: 720px;
    margin: 0 auto;
  }
  .perg-inner { padding: 32px 36px 36px; }
  .perg-loading {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--ink-dim);
    font-family: var(--font-body);
    font-style: italic;
    padding: 40px 0;
  }
  .perg-spinner {
    font-size: 1.2rem;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
