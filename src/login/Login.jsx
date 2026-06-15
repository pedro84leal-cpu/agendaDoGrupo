import { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import styles from '../login/Login.module.css';
import logo from '../images/Logo.png'
import crtlLogo from '../images/logo_pequeno-Photoroom.png'
import Register from '../components/Register/Register';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [showRegister, setShowRegister] = useState(false); // <-- ADICIONAR ESTA LINHA

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro('Email ou password inválidos.');
      return;
    }

    onLogin(data.session);
  }

  // ADICIONAR ESTA PARTE - Se showRegister for true, mostrar o registo
  if (showRegister) {
    return <Register onRegister={() => setShowRegister(false)} />;
  }

  return (
    <div className={styles.container}>
        <div className={styles.text}>
            <h2>
                Agenda do Grupo
            </h2>

        </div>
        <div className={styles.contentImg}>
            <img src={logo} alt='Logo' className={styles.img} />

        </div>
      <form className={styles.form} onSubmit={handleLogin}>
        <h2>Entrar</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {erro && <p className={styles.erro}>{erro}</p>}

        <button type="submit">Entrar</button>
      </form>

      {/* ADICIONAR ESTE LINK PARA REGISTO */}
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Não tem conta?{' '}
        <a 
          href="#" 
          onClick={(e) => { 
            e.preventDefault(); 
            setShowRegister(true); 
          }}
          style={{ color: '#6c63ff', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Criar conta
        </a>
      </p>

        <footer className={styles.footer}>
            <span>Create by:</span>
            <img src={crtlLogo} alt="Ctrl Studio" className={styles.footerLogo} />
        </footer>
    </div>
  );
}

export default Login;