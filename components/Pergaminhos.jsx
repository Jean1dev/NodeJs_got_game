import { useState, useEffect, useCallback } from 'react';

const ACAO_META = {
  1: { nome: 'Coletando Recursos',  icone: '⚒',  cor: '#4a8f4a', corFundo: 'rgba(74,143,74,0.12)',  durTotal: 1 * 60 * 1000 },
  2: { nome: 'Executando Súditos',  icone: '⚔',  cor: '#8b1a1a', corFundo: 'rgba(139,26,26,0.12)', durTotal: 2 * 60 * 1000 },
  3: { nome: 'Ensinando História',  icone: '📜', cor: '#4a6e8f', corFundo: 'rgba(74,110,143,0.12)', durTotal: 5 * 60 * 1000 },
  4: { nome: 'Ensinando Magia',     icone: '✦', cor: '#6a3d8f', corFundo: 'rgba(106,61,143,0.12)', durTotal: 5 * 60 * 1000 },
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
      <div className="perg-loading">
        <div className="perg-spinner">⟳</div>
        Consultando os pergaminhos...
      </div>
    );
  }

  return (
    <div className="pergaminhos">
      {/* Header */}
      <div className="perg-header">
        <h2 className="perg-title">Pergaminhos Ativos</h2>
        <button className="btn-got perg-refresh" onClick={carregarAcoes}>
          ↻ Atualizar
        </button>
      </div>

      {acoes.length === 0 ? (
        <div className="perg-empty">
          <div className="perg-empty-icon">📜</div>
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
                style={{ '--action-color': meta.cor, '--action-bg': meta.corFundo }}
              >
                {/* Top row */}
                <div className="scroll-top">
                  <div className="scroll-icon">{meta.icone}</div>

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

      <style jsx>{`
        .pergaminhos {
          max-width: 620px;
          animation: fadeIn 0.3s ease;
        }

        /* Header */
        .perg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .perg-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          letter-spacing: 0.1em;
          color: var(--gold);
          margin: 0;
        }

        .perg-refresh {
          padding: 6px 14px;
          font-size: 0.7rem;
        }

        /* Loading */
        .perg-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-dim);
          font-family: var(--font-body);
          font-style: italic;
          padding: 40px 0;
        }

        .perg-spinner {
          font-size: 1.2rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Empty state */
        .perg-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 24px;
          text-align: center;
        }

        .perg-empty-icon {
          font-size: 2.5rem;
          opacity: 0.3;
          margin-bottom: 12px;
        }

        .perg-empty-text {
          font-family: var(--font-ui);
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          color: var(--text-dim);
          margin-bottom: 6px;
        }

        .perg-empty-hint {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.82rem;
          color: var(--text-faint);
        }

        /* Scroll list */
        .scroll-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Scroll card */
        .scroll-card {
          background: rgba(8, 6, 3, 0.88);
          border: 1px solid var(--border-dark);
          border-left: 3px solid var(--action-color);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          transition: border-color 0.3s;
          background-image: linear-gradient(135deg, var(--action-bg) 0%, transparent 60%);
        }

        .scroll-card.done {
          border-left-color: #4caf50;
          background-image: linear-gradient(135deg, rgba(25,80,40,0.15) 0%, transparent 60%);
          opacity: 0.8;
        }

        /* Top row */
        .scroll-top {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .scroll-icon {
          font-size: 1.3rem;
          width: 32px;
          text-align: center;
          flex-shrink: 0;
        }

        .scroll-info { flex: 1; min-width: 0; }

        .scroll-name {
          font-family: var(--font-ui);
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-parchment);
        }

        .scroll-sub {
          font-family: var(--font-body);
          font-size: 0.78rem;
          color: var(--text-dim);
        }

        .scroll-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .scroll-timer {
          font-family: var(--font-ui);
          font-size: 1rem;
          color: var(--gold);
          min-width: 48px;
          text-align: right;
          letter-spacing: 0.05em;
        }

        .scroll-done-badge {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          color: #6cba74;
          padding: 3px 8px;
          border: 1px solid rgba(76, 175, 80, 0.35);
          border-radius: var(--radius-sm);
          background: rgba(25,80,40,0.2);
        }

        .scroll-revoke-btn {
          width: 26px;
          height: 26px;
          background: rgba(100,20,20,0.25);
          border: 1px solid rgba(139,26,26,0.4);
          border-radius: var(--radius-sm);
          color: #c06060;
          cursor: pointer;
          font-size: 0.7rem;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .scroll-revoke-btn:hover {
          background: rgba(139,26,26,0.4);
          border-color: var(--red-fire);
          color: #e08080;
          box-shadow: 0 0 8px rgba(192,57,43,0.3);
        }

        /* Progress */
        .scroll-progress-track {
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }

        .scroll-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--action-color), color-mix(in srgb, var(--action-color) 60%, white));
          border-radius: 2px;
          transition: width 1s linear;
          box-shadow: 0 0 8px var(--action-color);
        }

        .scroll-progress-fill.done {
          background: linear-gradient(90deg, #4caf50, #81c784);
          box-shadow: 0 0 8px rgba(76,175,80,0.5);
        }

        /* Confirm */
        .scroll-confirm {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-dark);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .confirm-text {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.85rem;
          color: var(--text-dim);
        }

        .confirm-btns {
          display: flex;
          gap: 8px;
        }

        .confirm-yes, .confirm-no {
          padding: 7px 14px;
          font-size: 0.72rem;
        }
      `}</style>
    </div>
  );
}
