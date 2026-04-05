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
        <img src={icon} alt={label} className="skill-icon" />
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
        {/* ════ BACKGROUND ════ */}
        <div className="hud-bg" />
        <div className="hud-vignette" />

        {/* ════ TOP BAR ════ */}
        <header className="top-bar">
          <div className="tb-logo">
            <img src="/images/game_of_thrones_logo.jpg" alt="Got Game" className="tb-logo-img" />
          </div>

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
              <div className="house-glow" />
            </div>

            <div className="house-name-label">Casa {casa}</div>
            <div className="player-name">{usuario}</div>

            <div className="sidebar-divider" />

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${painel === 'aldeoes' ? 'active' : ''}`}
                onClick={() => setPainel(painel === 'aldeoes' ? null : 'aldeoes')}
              >
                <img src="/images/outros/suditos.jpg" alt="Súditos" className="nav-icon" />
                <div className="nav-info">
                  <span className="nav-label">Súditos</span>
                  <span className="nav-count">{stats?.suditos ?? '…'}</span>
                </div>
              </button>

              <button
                className={`nav-item ${painel === 'pergaminhos' ? 'active' : ''}`}
                onClick={() => setPainel(painel === 'pergaminhos' ? null : 'pergaminhos')}
              >
                <img src="/images/outros/pergaminho.jpg" alt="Pergaminhos" className="nav-icon" />
                <div className="nav-info">
                  <span className="nav-label">Pergaminhos</span>
                  <span className="nav-count">Ações</span>
                </div>
              </button>
            </nav>

            <div className="sidebar-divider" />

            <div className="coins-display">
              <img src="/images/outros/moeda.jpg" alt="Moedas" className="coin-icon" />
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
        }

        .hud-bg {
          position: fixed;
          inset: 0;
          background-image: url('/images/mapa.gif');
          background-size: cover;
          background-position: center;
          filter: brightness(0.28) saturate(0.5);
          z-index: 0;
        }

        .hud-vignette {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.65) 100%);
          z-index: 1;
        }

        /* ── Top Bar ── */
        .top-bar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 20px;
          height: 56px;
          background: linear-gradient(180deg, rgba(5,4,2,0.98) 0%, rgba(10,8,5,0.92) 100%);
          border-bottom: 1px solid var(--border-mid);
          box-shadow: 0 2px 20px rgba(0,0,0,0.8), 0 1px 0 var(--border-dark);
          flex-shrink: 0;
        }

        .tb-logo-img {
          height: 36px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(201,168,76,0.4));
        }

        .tb-skills {
          display: flex;
          gap: 12px;
          flex: 1;
          justify-content: center;
        }

        .tb-logout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          padding: 6px 10px;
          background: transparent;
          border: 1px solid rgba(139,26,26,0.4);
          border-radius: var(--radius-sm);
          color: #c06060;
          cursor: pointer;
          transition: var(--transition);
          font-family: var(--font-ui);
        }

        .tb-logout:hover {
          border-color: var(--red-fire);
          color: #e08080;
          box-shadow: 0 0 12px rgba(192,57,43,0.3);
        }

        .tb-logout-icon { font-size: 1rem; }
        .tb-logout-label { font-size: 0.55rem; letter-spacing: 0.12em; text-transform: uppercase; }

        /* ── Skill Bar ── */
        :global(.skill-bar-wrap) {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 90px;
        }

        :global(.skill-header) {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        :global(.skill-icon) {
          width: 18px;
          height: 18px;
          border-radius: 3px;
          object-fit: cover;
          opacity: 0.85;
        }

        :global(.skill-label) {
          font-family: var(--font-ui);
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-dim);
          flex: 1;
        }

        :global(.skill-value) {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          color: var(--gold);
        }

        :global(.skill-track) {
          height: 3px;
          background: rgba(255,255,255,0.07);
          border-radius: 2px;
          overflow: hidden;
        }

        :global(.skill-fill) {
          height: 100%;
          background: linear-gradient(90deg, var(--gold-dark), var(--gold));
          border-radius: 2px;
          transition: width 0.6s ease;
          box-shadow: 0 0 6px var(--gold-glow);
        }

        /* ── Main Area ── */
        .main-area {
          position: relative;
          z-index: 5;
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 180px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 10px;
          background: linear-gradient(180deg, rgba(5,4,2,0.95) 0%, rgba(8,6,3,0.9) 100%);
          border-right: 1px solid var(--border-dark);
          overflow-y: auto;
          gap: 12px;
        }

        .house-sigil-wrap {
          position: relative;
          width: 110px;
          height: 110px;
          flex-shrink: 0;
        }

        .house-sigil {
          width: 110px;
          height: 110px;
          object-fit: cover;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-dark);
          position: relative;
          z-index: 1;
          transition: var(--transition);
        }

        .house-glow {
          position: absolute;
          inset: -4px;
          border-radius: var(--radius-lg);
          background: transparent;
          box-shadow: 0 0 20px var(--gold-glow);
          opacity: 0.5;
          z-index: 0;
          animation: pulseGold 4s infinite;
        }

        .house-name-label {
          font-family: var(--font-ui);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gold);
          text-align: center;
        }

        .player-name {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 0.85rem;
          color: var(--text-dim);
          text-align: center;
        }

        .sidebar-divider {
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-mid), transparent);
        }

        /* ── Nav items ── */
        .sidebar-nav {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 10px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
        }

        .nav-item:hover {
          background: var(--bg-hover);
          border-color: var(--border-dark);
        }

        .nav-item.active {
          background: var(--bg-active);
          border-color: var(--border-mid);
          box-shadow: inset 0 0 12px rgba(201,168,76,0.06);
        }

        .nav-icon {
          width: 28px;
          height: 28px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .nav-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .nav-label {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-dim);
        }

        .nav-count {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--gold);
        }

        /* ── Coins ── */
        .coins-display {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          background: rgba(201,168,76,0.06);
          border: 1px solid var(--border-dark);
          border-radius: var(--radius-sm);
        }

        .coin-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          object-fit: cover;
          filter: drop-shadow(0 0 6px rgba(201,168,76,0.5));
        }

        .coins-label {
          font-family: var(--font-ui);
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .coins-value {
          font-family: var(--font-ui);
          font-size: 1rem;
          color: var(--gold-bright);
          line-height: 1;
        }

        .coins-unit {
          font-size: 0.65rem;
          color: var(--gold-dark);
        }

        /* ── Center panel ── */
        .center-panel {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: rgba(0,0,0,0.3);
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
          background: rgba(25, 80, 40, 0.4);
          border-color: #4caf50;
          color: #a0d8a8;
        }

        :global(.toast-container.erro) {
          background: rgba(100, 20, 20, 0.4);
          border-color: var(--red-fire);
          color: #f4a0a0;
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
      <img src="/images/game_of_thrones_logo.jpg" alt="Got Game" className="w-logo" />
      <h2 className="w-title">Bem-vindo ao seu domínio</h2>
      <p className="w-subtitle">
        Casa {casa} aguarda suas ordens, milorde.
      </p>
      <p className="w-hint">
        Use o painel à esquerda para ordenar seus súditos ou consultar seus pergaminhos.
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

        .w-logo {
          max-width: 200px;
          opacity: 0.7;
          filter: drop-shadow(0 0 20px rgba(201,168,76,0.3));
          margin-bottom: 24px;
        }

        .w-title {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          color: var(--gold);
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .w-subtitle {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 1.1rem;
          color: var(--text-dim);
          margin-bottom: 16px;
        }

        .w-hint {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--text-faint);
          max-width: 360px;
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
