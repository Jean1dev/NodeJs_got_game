import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { withSessionSsr } from '../lib/session';
import Aldeoes from '../components/Aldeoes';
import Pergaminhos from '../components/Pergaminhos';

export default function Jogo({ usuario, casa }) {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [painel, setPainel] = useState(null); // 'aldeoes' | 'pergaminhos' | null
  const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso'|'erro', texto }

  const carregarStats = useCallback(async () => {
    try {
      const res = await fetch('/api/jogo/stats');
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch {
      // silencioso
    }
  }, [router]);

  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  function exibirMensagem(tipo, texto) {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 4000);
  }

  const casaLower = casa.toLowerCase();

  return (
    <>
      <Head>
        <title>Got Game - {usuario}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>

      <div className="jogo-wrapper">
        {/* Barra superior - habilidades */}
        <div className="top-bar">
          <div className="skill-item">
            <img src="/images/habilidades/temor.jpg" alt="Temor" />
            <span>Temor: {stats?.temor ?? '...'}</span>
          </div>
          <div className="skill-item">
            <img src="/images/habilidades/sabedoria.jpg" alt="Sabedoria" />
            <span>Sabedoria: {stats?.sabedoria ?? '...'}</span>
          </div>
          <div className="skill-item">
            <img src="/images/habilidades/comercio.jpg" alt="Comércio" />
            <span>Comércio: {stats?.comercio ?? '...'}</span>
          </div>
          <div className="skill-item">
            <img src="/images/habilidades/magia.jpg" alt="Magia" />
            <span>Magia: {stats?.magia ?? '...'}</span>
          </div>
          <button className="btn btn-sm btn-outline-light ms-auto" onClick={sair}>
            Sair
          </button>
        </div>

        {/* Área principal */}
        <div className="main-area">
          {/* Brasão da casa */}
          <div className="house-panel">
            <img
              src={`/images/casa_${casaLower}.jpg`}
              alt={`Casa ${casa}`}
              className="house-img"
            />
            <div className="text-warning fw-bold mt-2">Casa {casa}</div>
            <div className="text-light small">{usuario}</div>
          </div>

          {/* Painel central */}
          <div className="center-panel">
            {mensagem && (
              <div
                className={`alert ${mensagem.tipo === 'erro' ? 'alert-danger' : 'alert-success'} alert-dismissible`}
              >
                {mensagem.texto}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMensagem(null)}
                />
              </div>
            )}

            {painel === null && (
              <div className="text-center text-warning p-4">
                <img
                  src="/images/game_of_thrones_logo.jpg"
                  alt="Got Game"
                  style={{ maxWidth: 200 }}
                  className="mb-3"
                />
                <p className="text-light">
                  Selecione uma ação na barra inferior
                </p>
              </div>
            )}

            {painel === 'aldeoes' && (
              <Aldeoes
                onAcaoConcluida={(msg) => {
                  exibirMensagem('sucesso', msg);
                  carregarStats();
                  setPainel(null);
                }}
                onErro={(msg) => exibirMensagem('erro', msg)}
              />
            )}

            {painel === 'pergaminhos' && (
              <Pergaminhos
                onRevogado={(msg) => {
                  exibirMensagem('sucesso', msg);
                  carregarStats();
                }}
                onErro={(msg) => exibirMensagem('erro', msg)}
              />
            )}
          </div>
        </div>

        {/* Barra inferior - recursos */}
        <div className="bottom-bar">
          <button
            className={`resource-btn ${painel === 'aldeoes' ? 'active' : ''}`}
            onClick={() => setPainel(painel === 'aldeoes' ? null : 'aldeoes')}
          >
            <img src="/images/outros/suditos.jpg" alt="Súditos" />
            <span>{stats?.suditos ?? '...'}</span>
          </button>

          <button
            className={`resource-btn ${painel === 'pergaminhos' ? 'active' : ''}`}
            onClick={() => setPainel(painel === 'pergaminhos' ? null : 'pergaminhos')}
          >
            <img src="/images/outros/pergaminho.jpg" alt="Pergaminhos" />
            <span>Ações</span>
          </button>

          <div className="resource-btn">
            <img src="/images/outros/moeda.jpg" alt="Moedas" />
            <span>{stats?.moeda ?? '...'}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .jogo-wrapper {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-image: url('/images/mapa.gif');
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        .top-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          background-color: rgba(0, 0, 0, 0.85);
          border-bottom: 2px solid #8b7536;
          flex-shrink: 0;
        }

        .skill-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #e8d5a3;
          font-size: 0.85rem;
        }

        .skill-item img {
          width: 28px;
          height: 28px;
          object-fit: cover;
          border-radius: 4px;
        }

        .main-area {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .house-panel {
          width: 160px;
          flex-shrink: 0;
          background-color: rgba(0, 0, 0, 0.75);
          border-right: 1px solid #8b7536;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 8px;
        }

        .house-img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #8b7536;
        }

        .center-panel {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background-color: rgba(0, 0, 0, 0.5);
        }

        .bottom-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          background-color: rgba(0, 0, 0, 0.85);
          border-top: 2px solid #8b7536;
          flex-shrink: 0;
        }

        .resource-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #555;
          border-radius: 6px;
          color: #e8d5a3;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .resource-btn:hover {
          border-color: #ffc107;
          background-color: rgba(255, 193, 7, 0.1);
        }

        .resource-btn.active {
          border-color: #ffc107;
          background-color: rgba(255, 193, 7, 0.2);
        }

        .resource-btn img {
          width: 28px;
          height: 28px;
          object-fit: cover;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  if (!req.session.autorizado) {
    return { redirect: { destination: '/', permanent: false } };
  }
  return {
    props: {
      usuario: req.session.usuario,
      casa: req.session.casa,
    },
  };
});
