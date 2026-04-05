import Head from 'next/head';
import Link from 'next/link';

export default function Sucesso() {
  return (
    <>
      <Head>
        <title>Got Game — Juramento selado!</title>
      </Head>

      <div className="scene">
        <div className="scene-bg" />
        <div className="scene-overlay" />

        <div className="content animate-fade">
          <div className="seal">✦</div>
          <h1 className="title">Juramento Selado</h1>
          <div className="got-ornament mb-4">Bem-vindo a Westeros</div>
          <p className="message">
            Sua conta foi criada com sucesso. Os reinos aguardam seu comando, milorde.
          </p>
          <Link href="/" className="btn-got btn-got-primary enter-btn">
            ⚔ Entrar no Reino
          </Link>
        </div>
      </div>

      <style jsx>{`
        .scene {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
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
          background: radial-gradient(ellipse at center, transparent, rgba(7,6,4,0.8));
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 48px 32px;
          background: rgba(8, 6, 3, 0.9);
          border: 1px solid var(--border-mid);
          border-radius: var(--radius-lg);
          max-width: 420px;
          width: 90%;
          box-shadow: 0 12px 48px rgba(0,0,0,0.7), 0 0 30px var(--gold-glow);
        }

        .content::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        .seal {
          font-size: 2.5rem;
          color: var(--gold);
          margin-bottom: 16px;
          animation: pulseGold 3s infinite;
          filter: drop-shadow(0 0 12px var(--gold-glow));
        }

        .title {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          letter-spacing: 0.15em;
          color: var(--gold);
          margin-bottom: 8px;
        }

        .message {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 1rem;
          color: var(--text-dim);
          line-height: 1.6;
          margin-bottom: 28px;
          max-width: 300px;
        }

        .enter-btn {
          padding: 13px 32px;
          font-size: 0.85rem;
          text-decoration: none;
          display: inline-block;
        }
      `}</style>
    </>
  );
}
