import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { withSessionSsr } from '../lib/session';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ usuario: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Usuário ou senha inválidos');
      } else {
        router.push('/jogo');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Got Game — Entrar</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="scene">
        {/* mapa com overlay escuro */}
        <div className="scene-bg" />
        <div className="scene-overlay" />

        <div className="login-wrapper animate-fade">
          {/* Logo */}
          <div className="logo-wrap">
            <img src="/images/game_of_thrones_logo.jpg" alt="Game of Thrones" className="logo-img" />
          </div>

          {/* Separador ornamental */}
          <div className="got-ornament mb-4">Reinos de Westeros</div>

          {/* Card */}
          <div className="got-card login-card">
            <h2 className="login-title">Acesso ao Reino</h2>

            {erro && (
              <div className="got-alert got-alert-error mb-4">
                ⚠ {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label htmlFor="usuario" className="form-label">Usuário</label>
                <input
                  id="usuario"
                  type="text"
                  className="form-control"
                  value={form.usuario}
                  onChange={e => setForm({ ...form, usuario: e.target.value })}
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>

              <div className="field-group">
                <label htmlFor="senha" className="form-label">Senha</label>
                <input
                  id="senha"
                  type="password"
                  className="form-control"
                  value={form.senha}
                  onChange={e => setForm({ ...form, senha: e.target.value })}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className={`btn-got btn-got-primary submit-btn ${carregando ? 'loading' : ''}`}
                disabled={carregando}
              >
                {carregando ? (
                  <span className="spinner">⟳ Verificando...</span>
                ) : (
                  '⚔ Entrar no Reino'
                )}
              </button>
            </form>

            <div className="got-divider">ou</div>

            <Link href="/cadastro" className="btn-got register-btn">
              ✦ Criar Nova Conta
            </Link>
          </div>

          <p className="footer-text">
            O inverno está chegando — e o trono espera por você.
          </p>
        </div>
      </div>

      <style jsx>{`
        /* ── Scene ── */
        .scene {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .scene-bg {
          position: fixed;
          inset: 0;
          background-image: url('/images/mapa.gif');
          background-size: cover;
          background-position: center;
          filter: brightness(0.35) saturate(0.6);
          z-index: 0;
        }

        .scene-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 0%, rgba(7,6,4,0.7) 80%);
          z-index: 1;
        }

        /* ── Wrapper ── */
        .login-wrapper {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 420px;
          padding: 24px 16px;
        }

        /* ── Logo ── */
        .logo-wrap {
          margin-bottom: 12px;
        }

        .logo-img {
          max-height: 100px;
          max-width: 280px;
          object-fit: contain;
          filter: drop-shadow(0 0 18px rgba(201,168,76,0.5));
        }

        /* ── Card ── */
        .login-card {
          width: 100%;
          padding: 32px;
        }

        .login-title {
          font-size: 1.1rem;
          letter-spacing: 0.15em;
          text-align: center;
          color: var(--gold);
          margin-bottom: 24px;
          text-transform: uppercase;
        }

        /* ── Fields ── */
        .field-group {
          margin-bottom: 18px;
        }

        /* ── Submit ── */
        .submit-btn {
          width: 100%;
          padding: 12px;
          margin-top: 8px;
          font-size: 0.85rem;
        }

        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Register link ── */
        .register-btn {
          display: block;
          width: 100%;
          text-align: center;
          padding: 11px;
          text-decoration: none;
          font-size: 0.8rem;
        }

        /* ── Footer ── */
        .footer-text {
          margin-top: 24px;
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.85rem;
          color: var(--text-faint);
          text-align: center;
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
