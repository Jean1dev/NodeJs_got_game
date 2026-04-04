import { useState } from 'react';

const ACOES = [
  { value: '1', label: 'Coletar recursos (custo: 2G + entrega 3G)', icon: '⚒️' },
  { value: '2', label: 'Executar súdito (custo: 3G + 1 súdito)', icon: '⚔️' },
  { value: '3', label: 'Ensinar história (custo: 1G, +sabedoria)', icon: '📜' },
  { value: '4', label: 'Ensinar magia (custo: 1G, +magia)', icon: '✨' },
];

export default function Aldeoes({ onAcaoConcluida, onErro }) {
  const [form, setForm] = useState({ acao: '', quantidade: '' });
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.acao || !form.quantidade) {
      onErro('Selecione uma ação e informe a quantidade');
      return;
    }

    const qtd = parseInt(form.quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) {
      onErro('Quantidade inválida');
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch('/api/jogo/suditos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: form.acao, quantidade: qtd }),
      });

      const data = await res.json();

      if (!res.ok) {
        onErro(data.error || 'Erro ao ordenar ação');
      } else {
        setForm({ acao: '', quantidade: '' });
        onAcaoConcluida(data.message || 'Ação ordenada com sucesso!');
      }
    } catch {
      onErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="aldeoes-panel">
      <h5 className="text-warning mb-3">Ordenar Súditos</h5>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-light">Tipo de ação</label>
          <select
            className="form-select bg-dark text-light border-secondary"
            value={form.acao}
            onChange={e => setForm({ ...form, acao: e.target.value })}
            required
          >
            <option value="">Selecione uma ação...</option>
            {ACOES.map(a => (
              <option key={a.value} value={a.value}>
                {a.icon} {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label text-light">Quantidade de súditos</label>
          <input
            type="number"
            className="form-control bg-dark text-light border-secondary"
            min="1"
            value={form.quantidade}
            onChange={e => setForm({ ...form, quantidade: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-warning fw-bold"
          disabled={carregando}
        >
          {carregando ? 'Ordenando...' : 'Ordenar Ação'}
        </button>
      </form>

      <style jsx>{`
        .aldeoes-panel {
          background-color: rgba(0, 0, 0, 0.75);
          border: 1px solid #8b7536;
          border-radius: 8px;
          padding: 20px;
          max-width: 480px;
        }
      `}</style>
    </div>
  );
}
