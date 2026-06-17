import Head from 'next/head';
import Link from 'next/link';

export default function Sucesso() {
  return (
    <>
      <Head>
        <title>Got Game — Juramento selado!</title>
      </Head>

      <div className="scene">
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
          padding: 24px 16px;
          background-color: var(--vellum);
          background-image: radial-gradient(120% 80% at 50% -10%, #2e261a 0%, #1d1810 70%);
        }

        .content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 48px 36px;
          max-width: 440px;
          width: 100%;
          border: 1px solid #b6975c;
          border-radius: var(--radius-lg);
          background-color: var(--parchment);
          background-image: var(--parchment-fill);
          box-shadow: var(--shadow-card);
          overflow: hidden;
        }

        .content::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #b6924a 18%, #d8b65e 50%, #b6924a 82%, transparent);
        }

        .seal {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: radial-gradient(circle at 36% 32%, #b8463a, #8a2a22 60%, #5e1c16 100%);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35), inset 0 2px 5px rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-ui);
          font-size: 1.8rem;
          color: #f3d9a0;
          margin-bottom: 18px;
          animation: pulseGold 3s infinite;
        }

        .title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.7rem;
          letter-spacing: 0.06em;
          color: var(--ink);
          margin-bottom: 8px;
        }

        .message {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 1.05rem;
          color: var(--ink-body);
          line-height: 1.6;
          margin-bottom: 28px;
          max-width: 320px;
        }

        .enter-btn {
          padding: 14px 32px;
          text-decoration: none;
          display: inline-block;
        }
      `}</style>
    </>
  );
}
