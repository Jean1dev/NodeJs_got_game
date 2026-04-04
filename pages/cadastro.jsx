import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { withSessionSsr } from '../lib/session';

const CASAS = [
  'Arryn', 'Baratheon', 'Greyjoy', 'Lannister',
  'Martell', 'Stark', 'Targaryen', 'Tully', 'Tyrell',
];

export default function Cadastro() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', usuario: '', senha: '', casa: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!form.casa) {
      setErro('Selecione uma casa');
      return;
    }

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
      } else {
        router.push('/cadastro/sucesso');
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
        <title>Got Game - Cadastro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>

      <div className="cadastro-bg min-vh-100 py-4">
        <div className="container">
          <div className="card cadastro-card shadow-lg mx-auto">
            <div className="card-body p-4">
              <h2 className="text-center text-warning mb-4">Criar Conta</h2>

              {erro && (
                <div className="alert alert-danger">{erro}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-light">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-light">Usuário</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.usuario}
                    onChange={e => setForm({ ...form, usuario: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-light">Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.senha}
                    onChange={e => setForm({ ...form, senha: e.target.value })}
                    required
                    minLength={4}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-light d-block mb-2">
                    Escolha sua Casa
                  </label>
                  <div className="row g-2">
                    {CASAS.map(casa => (
                      <div key={casa} className="col-4">
                        <input
                          type="radio"
                          className="btn-check"
                          name="casa"
                          id={`casa-${casa}`}
                          value={casa}
                          checked={form.casa === casa}
                          onChange={e => setForm({ ...form, casa: e.target.value })}
                        />
                        <label
                          className="btn btn-outline-secondary casa-btn w-100 p-1"
                          htmlFor={`casa-${casa}`}
                        >
                          <img
                            src={`/images/casa_${casa.toLowerCase()}.jpg`}
                            alt={`Casa ${casa}`}
                            className="img-fluid mb-1"
                            style={{ maxHeight: '60px', objectFit: 'contain' }}
                          />
                          <div className="small text-light">{casa}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-warning fw-bold"
                    disabled={carregando}
                  >
                    {carregando ? 'Cadastrando...' : 'Cadastrar'}
                  </button>
                  <Link href="/" className="btn btn-outline-light">
                    Já tenho conta
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cadastro-bg {
          background-color: #1a1a1a;
        }
        .cadastro-card {
          background-color: rgba(0, 0, 0, 0.85);
          border: 1px solid #8b7536;
          max-width: 640px;
        }
        .casa-btn {
          border-color: #555;
          background-color: rgba(255,255,255,0.05);
        }
        .casa-btn:hover {
          background-color: rgba(255,255,255,0.1);
        }
        :global(.btn-check:checked + .casa-btn) {
          border-color: #ffc107;
          background-color: rgba(255, 193, 7, 0.15);
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
