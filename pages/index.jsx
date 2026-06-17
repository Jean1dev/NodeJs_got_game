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
        <div className="login-wrapper animate-fade">
          {/* Card */}
          <div className="got-card login-card">
            <div className="login-eyebrow">✦ &nbsp; Reinos de Westeros &nbsp; ✦</div>
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
          padding: 24px 16px;
          background-color: var(--vellum);
          background-image: radial-gradient(120% 80% at 50% -10%, #2e261a 0%, #1d1810 70%);
        }

        /* ── Wrapper ── */
        .login-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 420px;
        }

        /* ── Card ── */
        .login-card {
          width: 100%;
          padding: 40px 36px 36px;
        }

        .login-eyebrow {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: var(--gold);
          text-align: center;
          margin-bottom: 12px;
        }

        .login-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.5rem;
          letter-spacing: 0.05em;
          text-align: center;
          color: var(--ink);
          margin-bottom: 26px;
        }

        /* ── Fields ── */
        .field-group {
          margin-bottom: 18px;
        }

        /* ── Submit ── */
        .submit-btn {
          width: 100%;
          padding: 14px;
          margin-top: 8px;
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
          padding: 12px;
          text-decoration: none;
        }

        /* ── Footer ── */
        .footer-text {
          margin-top: 24px;
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.92rem;
          color: var(--ink-faint);
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
