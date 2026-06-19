import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { withSessionSsr } from '../lib/session';
import Aldeoes from '../components/Aldeoes';
import Pergaminhos from '../components/Pergaminhos';

const SKILL_MAX = 1000;

function SkillBar({ label, value, icon }) {
  const pct = Math.min(100, Math.round(((value ?? 0) / SKILL_MAX) * 100));
  return (
    <div className="skill-bar-wrap">
      <div className="skill-header">
        <span className="skill-icon-frame">
          <img src={icon} alt={label} className="skill-icon" />
        </span>
        <span className="skill-label">{label}</span>
        <span className="skill-value">{value ?? '—'}</span>
      </div>
      <div className="skill-track">
        <div className="skill-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Toast({ mensagem, onClose }) {
  if (!mensagem) return null;
  return (
    <div className={`toast-container ${mensagem.tipo}`}>
      <span className="toast-icon">{mensagem.tipo === 'erro' ? '✕' : '✓'}</span>
      <span className="toast-text">{mensagem.texto}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}

export default function Jogo({ usuario, casa }) {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [painel, setPainel] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const carregarStats = useCallback(async () => {
    try {
      const res = await fetch('/api/jogo/stats');
      if (res.status === 401) { router.push('/'); return; }
      setStats(await res.json());
    } catch { /* silencioso */ }
  }, [router]);

  useEffect(() => { carregarStats(); }, [carregarStats]);

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
        <title>Got Game — {usuario}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="hud">
        {/* ════ TOP BAR ════ */}
        <header className="top-bar">
          <div className="tb-logo">GOT&nbsp;GAME</div>

          <div className="tb-skills">
            <SkillBar label="Temor"     value={stats?.temor}     icon="/images/habilidades/temor.jpg" />
            <SkillBar label="Sabedoria" value={stats?.sabedoria} icon="/images/habilidades/sabedoria.jpg" />
            <SkillBar label="Comércio"  value={stats?.comercio}  icon="/images/habilidades/comercio.jpg" />
            <SkillBar label="Magia"     value={stats?.magia}     icon="/images/habilidades/magia.jpg" />
          </div>

          <button className="tb-logout" onClick={sair} title="Sair">
            <span className="tb-logout-icon">⏏</span>
            <span className="tb-logout-label">Sair</span>
          </button>
        </header>

        {/* ════ MAIN AREA ════ */}
        <div className="main-area">

          {/* ── Sidebar: House ── */}
          <aside className="sidebar">
            <div className="house-sigil-wrap">
              <img
                src={`/images/casa_${casaLower}.jpg`}
                alt={`Casa ${casa}`}
                className="house-sigil"
              />
            </div>

            <div className="house-id">
              <div className="house-name-label">Casa {casa}</div>
              <div className="player-name">{usuario}</div>
            </div>

            <div className="sidebar-divider" />

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${painel === 'aldeoes' ? 'active' : ''}`}
                onClick={() => setPainel(painel === 'aldeoes' ? null : 'aldeoes')}
              >
                <span className="nav-icon-frame">
                  <img src="/images/outros/suditos.jpg" alt="Súditos" className="nav-icon" />
                </span>
                <div className="nav-info">
                  <span className="nav-label">Súditos</span>
                  <span className="nav-count">{stats?.suditos ?? '…'}</span>
                </div>
              </button>

              <button
                className={`nav-item ${painel === 'pergaminhos' ? 'active' : ''}`}
                onClick={() => setPainel(painel === 'pergaminhos' ? null : 'pergaminhos')}
              >
                <span className="nav-icon-frame">
                  <img src="/images/outros/pergaminho.jpg" alt="Pergaminhos" className="nav-icon" />
                </span>
                <div className="nav-info">
                  <span className="nav-label">Pergaminhos</span>
                  <span className="nav-sub">Ações ativas</span>
                </div>
              </button>
            </nav>

            <div className="sidebar-divider" />

            <div className="coins-display">
              <span className="coin-frame">
                <img src="/images/outros/moeda.jpg" alt="Moedas" className="coin-icon" />
              </span>
              <div>
                <div className="coins-label">Tesouro</div>
                <div className="coins-value">{stats?.moeda ?? '…'} <span className="coins-unit">G</span></div>
              </div>
            </div>
          </aside>

          {/* ── Center Panel ── */}
          <main className="center-panel">
            <Toast mensagem={mensagem} onClose={() => setMensagem(null)} />

            {painel === null && <WelcomeScreen casa={casa} />}

            {painel === 'aldeoes' && (
              <Aldeoes
                suditos={stats?.suditos ?? 0}
                moedas={stats?.moeda ?? 0}
                onAcaoConcluida={msg => {
                  exibirMensagem('sucesso', msg);
                  carregarStats();
                  setPainel('pergaminhos');
                }}
                onErro={msg => exibirMensagem('erro', msg)}
              />
            )}

            {painel === 'pergaminhos' && (
              <Pergaminhos
                onRevogado={msg => { exibirMensagem('sucesso', msg); carregarStats(); }}
                onErro={msg => exibirMensagem('erro', msg)}
              />
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        /* ── Layout ── */
        .hud {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          background-color: var(--vellum);
        }

        /* ── Top Bar (leather) ── */
        .top-bar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 0 22px;
          height: 64px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #cdb787, #bda468);
          border-bottom: 1px solid var(--gold-dark);
          box-shadow: inset 0 -2px 6px rgba(74, 58, 32, 0.25), inset 0 1px 0 rgba(255, 250, 235, 0.5);
        }

        .tb-logo {
          font-family: var(--font-ui);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: var(--ink);
          white-space: nowrap;
        }

        .tb-skills {
          display: flex;
          gap: 26px;
          flex: 1;
          justify-content: center;
        }

        .tb-logout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          padding: 7px 13px;
          background: rgba(122, 42, 34, 0.1);
          border: 1px solid rgba(122, 42, 34, 0.5);
          border-radius: var(--radius-sm);
          color: var(--red-wax);
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-ui);
        }

        .tb-logout:hover {
          background: rgba(122, 42, 34, 0.2);
          border-color: var(--red-wax);
        }

        .tb-logout-icon { font-size: 0.85rem; line-height: 1; }
        .tb-logout-label { font-size: 0.55rem; letter-spacing: 0.12em; text-transform: uppercase; }

        /* ── Skill Bar ── */
        :global(.skill-bar-wrap) {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 118px;
        }

        :global(.skill-header) {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        :global(.skill-icon-frame) {
          width: 20px;
          height: 20px;
          border-radius: 3px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(74, 58, 32, 0.5);
        }

        :global(.skill-icon) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        :global(.skill-label) {
          font-family: var(--font-ui);
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-leather);
          flex: 1;
        }

        :global(.skill-value) {
          font-family: var(--font-ui);
          font-size: 0.66rem;
          color: var(--gold-dark);
        }

        :global(.skill-track) {
          height: 4px;
          background: rgba(44, 33, 20, 0.2);
          border-radius: 3px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(44, 33, 20, 0.3);
        }

        :global(.skill-fill) {
          height: 100%;
          background: linear-gradient(90deg, #8a6d2e, #c2a154);
          border-radius: 3px;
          transition: width 0.6s ease;
          box-shadow: 0 0 5px rgba(194, 161, 84, 0.6);
        }

        /* ── Main Area ── */
        .main-area {
          position: relative;
          z-index: 5;
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* ── Sidebar (leather) ── */
        .sidebar {
          width: 208px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 22px 16px;
          background: linear-gradient(180deg, #c9b487, #bca566);
          border-right: 1px solid var(--gold-dark);
          box-shadow: inset -2px 0 6px rgba(74, 58, 32, 0.2);
          overflow-y: auto;
        }

        .house-sigil-wrap {
          position: relative;
          width: 120px;
          height: 144px;
          flex-shrink: 0;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid rgba(74, 58, 32, 0.5);
          box-shadow: 0 8px 18px -8px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 250, 235, 0.35);
        }

        .house-sigil {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .house-id { text-align: center; }

        .house-name-label {
          font-family: var(--font-ui);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
        }

        .player-name {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.9rem;
          color: #5e4d30;
        }

        .sidebar-divider {
          width: 78%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(74, 58, 32, 0.5), transparent);
        }

        /* ── Nav items ── */
        .sidebar-nav {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255, 251, 240, 0.3);
          border-color: rgba(74, 58, 32, 0.18);
        }

        .nav-item.active {
          background: rgba(255, 251, 240, 0.45);
          border-color: rgba(74, 58, 32, 0.22);
        }

        .nav-icon-frame {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(74, 58, 32, 0.4);
        }

        .nav-icon {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .nav-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .nav-label {
          font-family: var(--font-ui);
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #5e4d30;
        }

        .nav-count {
          font-family: var(--font-ui);
          font-size: 0.9rem;
          color: var(--gold-dark);
        }

        .nav-sub {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.8rem;
          color: var(--ink-faint);
        }

        /* ── Coins ── */
        .coins-display {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          background: rgba(154, 123, 52, 0.14);
          border: 1px solid rgba(154, 123, 52, 0.4);
          border-radius: var(--radius-md);
          box-shadow: inset 0 0 12px rgba(154, 123, 52, 0.1);
        }

        .coin-frame {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(122, 95, 36, 0.6);
          box-shadow: 0 0 8px rgba(194, 161, 84, 0.4);
        }

        .coin-icon {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .coins-label {
          font-family: var(--font-ui);
          font-size: 0.56rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }

        .coins-value {
          font-family: var(--font-ui);
          font-size: 1.1rem;
          color: var(--gold-dark);
          line-height: 1;
          white-space: nowrap;
        }

        .coins-unit {
          font-size: 0.72rem;
          color: var(--gold);
        }

        /* ── Center panel (parchment) ── */
        .center-panel {
          flex: 1;
          overflow-y: auto;
          padding: 32px 40px;
          background-color: var(--parchment);
          background-image: var(--parchment-fill);
        }

        /* ── Toast ── */
        :global(.toast-container) {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
          animation: slideDown 0.3s ease;
          border-left: 3px solid;
        }

        :global(.toast-container.sucesso) {
          background: rgba(74, 110, 60, 0.14);
          border-color: #4a6e3c;
          color: #3c5a30;
        }

        :global(.toast-container.erro) {
          background: rgba(138, 42, 34, 0.12);
          border-color: var(--red-wax);
          color: var(--red-deep);
        }

        :global(.toast-icon) {
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        :global(.toast-text) {
          flex: 1;
          font-family: var(--font-body);
          font-size: 0.95rem;
        }

        :global(.toast-close) {
          background: none;
          border: none;
          color: inherit;
          opacity: 0.6;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0 4px;
          line-height: 1;
        }

        :global(.toast-close:hover) { opacity: 1; }
      `}</style>
    </>
  );
}

function WelcomeScreen({ casa }) {
  return (
    <div className="welcome">
      <div className="w-seal">✦</div>
      <h2 className="w-title">Bem-vindo ao seu domínio</h2>
      <p className="w-subtitle">
        A Casa {casa} aguarda suas ordens, milorde.
      </p>
      <p className="w-hint">
        Use o painel à esquerda para ordenar seus súditos ou consultar os pergaminhos das ações em andamento.
      </p>

      <style jsx>{`
        .welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          padding: 24px;
          animation: fadeIn 0.5s ease;
        }

        .w-seal {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: radial-gradient(circle at 36% 32%, #b8463a, #8a2a22 60%, #5e1c16 100%);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35), inset 0 2px 5px rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-ui);
          font-size: 1.6rem;
          color: #f3d9a0;
          margin-bottom: 24px;
        }

        .w-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.7rem;
          color: var(--ink);
          letter-spacing: 0.05em;
          margin: 0 0 10px;
        }

        .w-subtitle {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 1.2rem;
          color: var(--ink-body);
          margin: 0 0 8px;
        }

        .w-hint {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: var(--ink-faint);
          max-width: 400px;
          line-height: 1.55;
          margin: 0;
        }
      `}</style>
    </div>
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
