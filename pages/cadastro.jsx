import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { withSessionSsr } from '../lib/session';

const CASAS = [
  { nome: 'Arryn',      lema: 'Tão Alto Como a Honra' },
  { nome: 'Baratheon',  lema: 'A Nossa É a Fúria' },
  { nome: 'Greyjoy',    lema: 'Nós Não Semeamos' },
  { nome: 'Lannister',  lema: 'Ouça Meu Rugido' },
  { nome: 'Martell',    lema: 'Indobrado, Não Dobrado' },
  { nome: 'Stark',      lema: 'O Inverno Está Chegando' },
  { nome: 'Targaryen',  lema: 'Fogo e Sangue' },
  { nome: 'Tully',      lema: 'Família, Dever, Honra' },
  { nome: 'Tyrell',     lema: 'Crescendo Forte' },
];

export default function Cadastro() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', usuario: '', senha: '', casa: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [etapa, setEtapa] = useState(1); // 1 = dados, 2 = escolha de casa

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.casa) { setErro('Escolha sua casa antes de prosseguir'); return; }
    setErro('');
    setCarregando(true);
    try {
      const res = await fetch('/api/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Erro ao cadastrar');
        setEtapa(1);
      } else {
        router.push('/cadastro/sucesso');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  function irParaEtapa2(e) {
    e.preventDefault();
    if (!form.nome || !form.usuario || !form.senha) {
      setErro('Preencha todos os campos');
      return;
    }
    if (form.senha.length < 4) {
      setErro('Senha deve ter ao menos 4 caracteres');
      return;
    }
    setErro('');
    setEtapa(2);
  }

  return (
    <>
      <Head>
        <title>Got Game — Criar Conta</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="scene">
        <div className="page-wrap animate-fade">
          <div className="got-card main-card">
            {/* Header */}
            <div className="card-header">
              <div className="eyebrow">✦ &nbsp; Game of Thrones &nbsp; ✦</div>
              <h2 className="card-title">Juramento de Lealdade</h2>
              <p className="card-sub">
                {etapa === 1
                  ? 'Apresente-se diante dos sete reinos.'
                  : 'Diante dos sete reinos, a qual casa você jurará sua espada?'}
              </p>
            </div>

            {/* Etapas */}
            <div className="steps-bar">
              <div className={`step ${etapa >= 1 ? 'active' : ''}`}>
                <span className="step-num">I</span>
                <span className="step-label">Identidade</span>
              </div>
              <div className="step-line" />
              <div className={`step ${etapa >= 2 ? 'active' : ''}`}>
                <span className="step-num">II</span>
                <span className="step-label">Sua Casa</span>
              </div>
            </div>

            {erro && <div className="got-alert got-alert-error mb-4">⚠ {erro}</div>}

            {/* ── Etapa 1: dados pessoais ── */}
            {etapa === 1 && (
              <form onSubmit={irParaEtapa2} noValidate className="animate-fade">
                <div className="field-group">
                  <label className="form-label">Nome completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    placeholder="Seu nome nos reinos"
                    autoFocus
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="form-label">Nome de usuário</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.usuario}
                    onChange={e => setForm({ ...form, usuario: e.target.value })}
                    placeholder="Como será conhecido"
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="form-label">Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.senha}
                    onChange={e => setForm({ ...form, senha: e.target.value })}
                    placeholder="Mínimo 4 caracteres"
                    minLength={4}
                    required
                  />
                </div>
                <button type="submit" className="btn-got btn-got-primary submit-btn">
                  Escolher Casa →
                </button>
              </form>
            )}

            {/* ── Etapa 2: escolha de casa ── */}
            {etapa === 2 && (
              <form onSubmit={handleSubmit} noValidate className="animate-fade">
                <div className="houses-grid">
                  {CASAS.map(({ nome, lema }) => (
                    <button
                      key={nome}
                      type="button"
                      className={`house-card ${form.casa === nome ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, casa: nome })}
                    >
                      {form.casa === nome && <span className="house-seal">✦</span>}
                      <div className="house-img-frame">
                        <img
                          src={`/images/casa_${nome.toLowerCase()}.jpg`}
                          alt={`Casa ${nome}`}
                          className="house-img"
                        />
                      </div>
                      <div className="house-name">{nome}</div>
                      <div className="house-lema">“{lema}”</div>
                    </button>
                  ))}
                </div>

                <div className="btn-row">
                  <button
                    type="button"
                    className="btn-got"
                    onClick={() => { setEtapa(1); setErro(''); }}
                  >
                    ← Voltar
                  </button>
                  <button
                    type="submit"
                    className="btn-got btn-got-primary"
                    disabled={!form.casa || carregando}
                  >
                    {carregando
                      ? 'Registrando...'
                      : `Jurar Lealdade${form.casa ? ` à Casa ${form.casa}` : ''} ⚔`}
                  </button>
                </div>
              </form>
            )}

            <div className="card-foot">
              Já possui conta?{' '}
              <Link href="/" className="foot-link">Entrar no reino</Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scene {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          background-color: var(--vellum);
          background-image: radial-gradient(120% 80% at 50% -10%, #2e261a 0%, #1d1810 70%);
        }

        .page-wrap {
          position: relative;
          width: 100%;
          max-width: 720px;
        }

        .main-card {
          width: 100%;
          padding: 40px 44px 0;
        }

        /* ── Header ── */
        .card-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .eyebrow {
          font-family: var(--font-ui);
          font-size: 0.72rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: var(--gold);
        }

        .card-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.85rem;
          letter-spacing: 0.05em;
          color: var(--ink);
          margin: 12px 0 6px;
        }

        .card-sub {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 1.05rem;
          color: var(--ink-body);
          margin: 0;
        }

        /* ── Steps bar ── */
        .steps-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.55;
          transition: opacity 0.3s;
        }

        .step.active { opacity: 1; }

        .step-num {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1.5px solid var(--gold-leaf);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--gold-dark);
        }

        .step.active .step-num {
          background: #8a6d2e;
          border-color: var(--gold-bright);
          color: var(--parchment-hi);
          box-shadow: 0 0 0 4px rgba(216, 182, 94, 0.18);
        }

        .step-label {
          font-family: var(--font-ui);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-dim);
        }

        .step.active .step-label { color: var(--ink); }

        .step-line {
          width: 64px;
          height: 1px;
          background: linear-gradient(90deg, #b09040, #d8b65e);
          margin: 0 16px;
        }

        /* ── Form fields ── */
        .field-group { margin-bottom: 18px; }

        .submit-btn {
          width: 100%;
          padding: 14px;
          margin-top: 6px;
        }

        /* ── Houses grid ── */
        .houses-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .house-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 18px 14px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-dark);
          background: rgba(255, 251, 240, 0.5);
          box-shadow: 0 2px 0 rgba(120, 90, 40, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: var(--transition);
          text-align: center;
        }

        .house-card:hover {
          border-color: var(--border-mid);
          transform: translateY(-2px);
          box-shadow: 0 10px 22px -12px rgba(74, 58, 32, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        }

        .house-card.selected {
          border: 2px solid var(--gold-leaf);
          box-shadow: 0 0 0 1px rgba(216, 182, 94, 0.4), 0 10px 24px -10px rgba(122, 42, 34, 0.5);
        }

        .house-seal {
          position: absolute;
          top: -11px;
          right: -11px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: radial-gradient(circle at 36% 32%, #b8463a, #8a2a22 60%, #5e1c16 100%);
          box-shadow: 0 3px 7px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-ui);
          font-size: 0.85rem;
          color: #f3d9a0;
          animation: fadeIn 0.2s;
        }

        .house-img-frame {
          width: 96px;
          height: 118px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid rgba(74, 58, 32, 0.45);
          box-shadow: 0 6px 14px -6px rgba(0, 0, 0, 0.45);
        }

        .house-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .house-name {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink);
        }

        .house-lema {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.85rem;
          color: var(--ink-dim);
          line-height: 1.35;
          min-height: 36px;
        }

        /* ── Bottom row ── */
        .btn-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 34px;
        }

        .btn-row :global(.btn-got:first-child) {
          flex: 0 0 auto;
        }

        .btn-row :global(.btn-got:last-child) {
          flex: 1;
          padding: 14px;
        }

        /* ── Foot ── */
        .card-foot {
          text-align: center;
          padding: 24px 0 22px;
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.95rem;
          color: var(--ink-faint);
        }

        .foot-link {
          color: #8a6d2e;
          text-decoration: none;
          border-bottom: 1px solid rgba(138, 109, 46, 0.5);
        }
        .foot-link:hover { color: var(--gold-dark); }
      `}</style>
    </>
  );
}

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  if (req.session.autorizado) {
    return { redirect: { destination: '/jogo', permanent: false } };
  }
  return { props: {} };
});
