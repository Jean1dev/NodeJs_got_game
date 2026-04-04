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
        <div className="scene-bg" />
        <div className="scene-overlay" />

        <div className="page-wrap animate-fade">
          {/* Header */}
          <div className="page-header">
            <img src="/images/game_of_thrones_logo.jpg" alt="Game of Thrones" className="header-logo" />
            <div className="got-ornament mt-2">Juramento de Lealdade</div>
          </div>

          <div className="got-card main-card">
            {/* Etapas */}
            <div className="steps-bar">
              <div className={`step ${etapa >= 1 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span className="step-label">Identidade</span>
              </div>
              <div className="step-line" />
              <div className={`step ${etapa >= 2 ? 'active' : ''}`}>
                <span className="step-num">2</span>
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
                <p className="choose-label">Escolha a casa à qual você jurará lealdade:</p>

                <div className="houses-grid">
                  {CASAS.map(({ nome, lema }) => (
                    <button
                      key={nome}
                      type="button"
                      className={`house-card ${form.casa === nome ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, casa: nome })}
                    >
                      <img
                        src={`/images/casa_${nome.toLowerCase()}.jpg`}
                        alt={`Casa ${nome}`}
                        className="house-img"
                      />
                      <div className="house-name">{nome}</div>
                      <div className="house-lema">"{lema}"</div>
                      {form.casa === nome && <div className="house-check">✦</div>}
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
                    {carregando ? 'Registrando...' : '⚔ Jurar Lealdade'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="back-link">
            Já possui conta?{' '}
            <Link href="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
              Entrar no reino
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .scene {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }

        .scene-bg {
          position: fixed;
          inset: 0;
          background-image: url('/images/mapa.gif');
          background-size: cover;
          background-position: center;
          filter: brightness(0.3) saturate(0.5);
          z-index: 0;
        }

        .scene-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 0%, rgba(7,6,4,0.75) 80%);
          z-index: 1;
        }

        .page-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 700px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .page-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-logo {
          max-height: 80px;
          object-fit: contain;
          filter: drop-shadow(0 0 14px rgba(201,168,76,0.45));
        }

        .main-card {
          width: 100%;
          padding: 32px;
        }

        /* ── Steps bar ── */
        .steps-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 28px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0.35;
          transition: opacity 0.3s;
        }

        .step.active { opacity: 1; }

        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--gold-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-ui);
          font-size: 0.7rem;
          color: var(--gold);
        }

        .step.active .step-num {
          background: var(--gold-dark);
          border-color: var(--gold);
          box-shadow: 0 0 10px var(--gold-glow);
        }

        .step-label {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-dim);
        }

        .step-line {
          width: 48px;
          height: 1px;
          background: linear-gradient(90deg, var(--gold-dark), transparent);
          margin: 0 8px;
        }

        /* ── Form fields ── */
        .field-group {
          margin-bottom: 18px;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          margin-top: 4px;
          font-size: 0.85rem;
        }

        /* ── House selection ── */
        .choose-label {
          font-family: var(--font-body);
          font-style: italic;
          color: var(--text-dim);
          text-align: center;
          margin-bottom: 20px;
          font-size: 1rem;
        }

        .houses-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .house-card {
          position: relative;
          background: rgba(10, 8, 4, 0.8);
          border: 1px solid var(--border-dark);
          border-radius: var(--radius-md);
          padding: 12px 8px;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }

        .house-card:hover {
          border-color: var(--border-mid);
          background: var(--bg-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        }

        .house-card.selected {
          border-color: var(--gold);
          background: var(--bg-active);
          box-shadow: 0 0 18px var(--gold-glow), inset 0 0 12px rgba(201,168,76,0.06);
        }

        .house-img {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          filter: brightness(0.85);
          transition: filter 0.2s;
        }

        .house-card:hover .house-img,
        .house-card.selected .house-img {
          filter: brightness(1);
        }

        .house-name {
          font-family: var(--font-ui);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          color: var(--gold);
          text-transform: uppercase;
        }

        .house-lema {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.65rem;
          color: var(--text-faint);
          line-height: 1.3;
          display: none;
        }

        .house-card.selected .house-lema {
          display: block;
          color: var(--text-dim);
        }

        .house-check {
          position: absolute;
          top: 6px;
          right: 8px;
          color: var(--gold-bright);
          font-size: 0.8rem;
          animation: fadeIn 0.2s;
        }

        /* ── Bottom row ── */
        .btn-row {
          display: flex;
          gap: 12px;
        }

        .btn-row .btn-got:first-child {
          flex: 0 0 auto;
          padding: 12px 20px;
        }

        .btn-row .btn-got:last-child {
          flex: 1;
          padding: 12px;
          font-size: 0.85rem;
        }

        /* ── Back link ── */
        .back-link {
          margin-top: 20px;
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text-dim);
        }
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
