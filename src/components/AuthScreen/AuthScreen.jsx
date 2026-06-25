import { useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import styles from './AuthScreen.module.css';
import logo from '../../images/Logo.png';
import crtlLogo from '../../images/logo_pequeno-Photoroom.png';

async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const nomeGuardado = localStorage.getItem('agenda_nome');

export default function AuthScreen({ onLogin }) {
  const [modo, setModo] = useState(nomeGuardado ? 'pin_rapido' : 'login');

  // PIN rápido
  const [pinRapido, setPinRapido] = useState('');
  const [erroRapido, setErroRapido] = useState('');
  const [loadingRapido, setLoadingRapido] = useState(false);

  // Login completo
  const [nomeLogin, setNomeLogin] = useState('');
  const [pinLogin, setPinLogin] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Registo
  const [nomeRegisto, setNomeRegisto] = useState('');
  const [pinRegisto, setPinRegisto] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [erroRegisto, setErroRegisto] = useState('');
  const [loadingRegisto, setLoadingRegisto] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handlePinRapido(e) {
    e.preventDefault();
    setErroRapido('');
    setLoadingRapido(true);

    const pinHash = await hashPin(pinRapido);

    const { data, error } = await supabase
      .from('membros')
      .select('id, nome, role')
      .ilike('nome', nomeGuardado)
      .eq('pin', pinHash)
      .single();

    setLoadingRapido(false);

    if (error || !data) {
      setErroRapido('PIN incorreto.');
      setPinRapido('');
      return;
    }

    onLogin(data);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErroLogin('');
    setLoadingLogin(true);

    const pinHash = await hashPin(pinLogin);

    const { data, error } = await supabase
      .from('membros')
      .select('id, nome, role')
      .ilike('nome', nomeLogin.trim())
      .eq('pin', pinHash)
      .single();

    setLoadingLogin(false);

    if (error || !data) {
      setErroLogin('Nome ou PIN incorretos.');
      return;
    }

    localStorage.setItem('agenda_nome', data.nome);
    onLogin(data);
  }

  async function handleRegisto(e) {
    e.preventDefault();
    setErroRegisto('');

    if (pinRegisto.length !== 6) {
      setErroRegisto('O PIN deve ter exatamente 6 dígitos.');
      return;
    }
    if (pinRegisto !== pinConfirm) {
      setErroRegisto('Os PINs não coincidem.');
      return;
    }

    setLoadingRegisto(true);

    const { data: existing } = await supabase
      .from('membros')
      .select('id')
      .ilike('nome', nomeRegisto.trim())
      .single();

    if (existing) {
      setErroRegisto('Este nome já está registado.');
      setLoadingRegisto(false);
      return;
    }

    const pinHash = await hashPin(pinRegisto);

    const { error } = await supabase
      .from('membros')
      .insert({ nome: nomeRegisto.trim(), pin: pinHash, role: 'membro' });

    setLoadingRegisto(false);

    if (error) {
      setErroRegisto('Erro ao criar conta. Tenta novamente.');
      return;
    }

    localStorage.setItem('agenda_nome', nomeRegisto.trim());
    setSucesso(true);
    setTimeout(() => {
      setSucesso(false);
      setModo('pin_rapido');
      setNomeRegisto('');
      setPinRegisto('');
      setPinConfirm('');
    }, 2000);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={logo} alt="Logo Rancho" className={styles.logo} />
        <h1 className={styles.titulo}>Agenda do Grupo</h1>
      </div>

      {modo === 'pin_rapido' && (
        <form className={styles.form} onSubmit={handlePinRapido}>
          <p className={styles.boasVindas}>Olá, <strong>{nomeGuardado}</strong> 👋</p>

          <label className={styles.label}>
            PIN
            <input
              className={styles.input}
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="······"
              value={pinRapido}
              onChange={(e) => setPinRapido(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />
          </label>

          {erroRapido && <p className={styles.erro}>{erroRapido}</p>}

          <button className={styles.botao} type="submit" disabled={loadingRapido}>
            {loadingRapido ? 'A entrar...' : 'Entrar'}
          </button>

          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => { setModo('login'); setErroLogin(''); }}
          >
            Entrar com outro utilizador
          </button>
        </form>
      )}

      {(modo === 'login' || modo === 'registo') && (
        <>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${modo === 'login' ? styles.tabAtivo : ''}`}
              onClick={() => { setModo('login'); setErroLogin(''); }}
            >
              Entrar
            </button>
            <button
              className={`${styles.tab} ${modo === 'registo' ? styles.tabAtivo : ''}`}
              onClick={() => { setModo('registo'); setErroRegisto(''); }}
            >
              Criar conta
            </button>
          </div>

          {modo === 'login' ? (
            <form className={styles.form} onSubmit={handleLogin}>
              <label className={styles.label}>
                Nome
                <input
                  className={styles.input}
                  type="text"
                  placeholder="O teu nome"
                  value={nomeLogin}
                  onChange={(e) => setNomeLogin(e.target.value)}
                  required
                />
              </label>

              <label className={styles.label}>
                PIN (6 dígitos)
                <input
                  className={styles.input}
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="······"
                  value={pinLogin}
                  onChange={(e) => setPinLogin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </label>

              {erroLogin && <p className={styles.erro}>{erroLogin}</p>}

              <button className={styles.botao} type="submit" disabled={loadingLogin}>
                {loadingLogin ? 'A entrar...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleRegisto}>
              {sucesso ? (
                <div className={styles.sucesso}>
                  <p>✅ Conta criada! A redirecionar...</p>
                </div>
              ) : (
                <>
                  <label className={styles.label}>
                    Nome próprio
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Como te chamam no grupo"
                      value={nomeRegisto}
                      onChange={(e) => setNomeRegisto(e.target.value)}
                      required
                    />
                  </label>

                  <label className={styles.label}>
                    PIN (6 dígitos)
                    <input
                      className={styles.input}
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="······"
                      value={pinRegisto}
                      onChange={(e) => setPinRegisto(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </label>

                  <label className={styles.label}>
                    Confirmar PIN
                    <input
                      className={styles.input}
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="······"
                      value={pinConfirm}
                      onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </label>

                  {erroRegisto && <p className={styles.erro}>{erroRegisto}</p>}

                  <button className={styles.botao} type="submit" disabled={loadingRegisto}>
                    {loadingRegisto ? 'A criar conta...' : 'Registar'}
                  </button>
                </>
              )}
            </form>
          )}
        </>
      )}

      <footer className={styles.footer}>
        <span>Criado por</span>
        <img src={crtlLogo} alt="Ctrl Studio" className={styles.footerLogo} />
      </footer>
    </div>
  );
}
