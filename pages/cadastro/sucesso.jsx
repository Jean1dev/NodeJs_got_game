import Head from 'next/head';
import Link from 'next/link';

export default function Sucesso() {
  return (
    <>
      <Head>
        <title>Got Game - Cadastro realizado!</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>

      <div
        className="d-flex align-items-center justify-content-center min-vh-100"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <div
          className="card text-center shadow-lg"
          style={{
            backgroundColor: 'rgba(0,0,0,0.85)',
            border: '1px solid #8b7536',
            minWidth: 320,
          }}
        >
          <div className="card-body p-4">
            <h2 className="text-warning mb-3">Conta criada com sucesso!</h2>
            <p className="text-light mb-4">
              Sua conta foi criada. Agora você pode entrar no jogo.
            </p>
            <Link href="/" className="btn btn-warning fw-bold">
              Ir para o Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
