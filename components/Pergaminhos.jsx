import { useState, useEffect, useCallback } from 'react';

const DESCRICAO_ACAO = {
  1: 'Coletando recursos',
  2: 'Executando súditos',
  3: 'Ensinando história',
  4: 'Ensinando magia',
};

function formatarTempo(ms) {
  if (ms <= 0) return 'Concluído';
  const totalSeg = Math.ceil(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}m ${seg.toString().padStart(2, '0')}s`;
}

export default function Pergaminhos({ onRevogado, onErro }) {
  const [acoes, setAcoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [revogando, setRevogando] = useState(null);
  const [tempos, setTempos] = useState({});

  const carregarAcoes = useCallback(async () => {
    try {
      const res = await fetch('/api/jogo/pergaminhos');
      if (!res.ok) return;
      const data = await res.json();
      setAcoes(data.acoes || []);

      const novosTempos = {};
      for (const a of data.acoes || []) {
        novosTempos[a._id] = a.tempo_restante;
      }
      setTempos(novosTempos);
    } catch {
      // silencioso
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarAcoes();
  }, [carregarAcoes]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTempos(prev => {
        const novo = { ...prev };
        let algumZerou = false;
        for (const id in novo) {
          novo[id] = Math.max(0, novo[id] - 1000);
          if (novo[id] === 0) algumZerou = true;
        }
        return novo;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Recarregar quando alguma ação zerar
  useEffect(() => {
    const algumZerou = Object.values(tempos).some(t => t === 0);
    if (algumZerou && acoes.length > 0) {
      const timeout = setTimeout(() => {
        carregarAcoes();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [tempos, acoes.length, carregarAcoes]);

  async function revogarAcao(id) {
    setRevogando(id);

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
        onRevogado(data.message || 'Ação revogada!');
        carregarAcoes();
      }
    } catch {
      onErro('Erro de conexão');
    } finally {
      setRevogando(null);
    }
  }

  if (carregando) {
    return (
      <div className="pergaminhos-panel text-light">
        Carregando pergaminhos...
      </div>
    );
  }

  return (
    <div className="pergaminhos-panel">
      <h5 className="text-warning mb-3">Pergaminhos de Ação</h5>

      {acoes.length === 0 ? (
        <p className="text-light opacity-75">Nenhuma ação em andamento.</p>
      ) : (
        <div className="acoes-list">
          {acoes.map(acao => {
            const tempoRestante = tempos[acao._id] ?? acao.tempo_restante;
            const concluido = tempoRestante <= 0;

            return (
              <div key={acao._id} className={`acao-item ${concluido ? 'concluido' : ''}`}>
                <div className="acao-info">
                  <div className="acao-descricao">
                    {acao.descricao || DESCRICAO_ACAO[acao.acao]}
                  </div>
                  <div className="acao-detalhes text-secondary small">
                    Quantidade: {acao.quantidade}
                  </div>
                </div>

                <div className="acao-status">
                  <span className={`tempo ${concluido ? 'text-success' : 'text-warning'}`}>
                    {concluido ? '✓ Concluído' : formatarTempo(tempoRestante)}
                  </span>

                  {!concluido && (
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => revogarAcao(acao._id)}
                      disabled={revogando === acao._id}
                    >
                      {revogando === acao._id ? '...' : 'Revogar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        className="btn btn-outline-secondary btn-sm mt-3"
        onClick={carregarAcoes}
      >
        Atualizar
      </button>

      <style jsx>{`
        .pergaminhos-panel {
          background-color: rgba(0, 0, 0, 0.75);
          border: 1px solid #8b7536;
          border-radius: 8px;
          padding: 20px;
          max-width: 600px;
        }

        .acoes-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
        }

        .acao-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid #444;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .acao-item.concluido {
          border-color: #198754;
          background-color: rgba(25, 135, 84, 0.1);
        }

        .acao-descricao {
          color: #e8d5a3;
          font-size: 0.9rem;
        }

        .acao-status {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .tempo {
          font-size: 0.85rem;
          font-weight: bold;
          min-width: 80px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
