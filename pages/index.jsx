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
        setErro(data.error || 'Erro ao fazer login');
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
        <title>Got Game - Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>

      <div className="login-bg d-flex align-items-center justify-content-center min-vh-100">
        <div className="card login-card shadow-lg">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <img
                src="/images/game_of_thrones_logo.jpg"
                alt="Game of Thrones"
                className="img-fluid logo"
              />
            </div>

            {erro && (
              <div className="alert alert-danger" role="alert">
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="usuario" className="form-label text-light">
                  Usuário
                </label>
                <input
                  id="usuario"
                  type="text"
                  className="form-control"
                  value={form.usuario}
                  onChange={e => setForm({ ...form, usuario: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label htmlFor="senha" className="form-label text-light">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  className="form-control"
                  value={form.senha}
                  onChange={e => setForm({ ...form, senha: e.target.value })}
                  required
                />
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-warning fw-bold"
                  disabled={carregando}
                >
                  {carregando ? 'Entrando...' : 'Entrar'}
                </button>
                <Link href="/cadastro" className="btn btn-outline-light">
                  Criar conta
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-bg {
          background-color: #1a1a1a;
          background-image: url('/images/mapa.gif');
          background-size: cover;
          background-position: center;
        }
        .login-card {
          background-color: rgba(0, 0, 0, 0.85);
          border: 1px solid #8b7536;
          min-width: 350px;
          max-width: 400px;
          width: 100%;
        }
        .logo {
          max-height: 120px;
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
