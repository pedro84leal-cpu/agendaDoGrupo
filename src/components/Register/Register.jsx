import { useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import styles from './Register.module.css';

export default function Register({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar tamanho da senha (mínimo 4 caracteres)
    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      setLoading(false);
      return;
    }

    // 1. Criar a conta no Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      // Traduzir mensagens de erro comuns
      if (signUpError.message === 'Password should be at least 6 characters') {
        setError('A senha deve ter pelo menos 4 caracteres.');
      } else if (signUpError.message.includes('already registered')) {
        setError('Este email já está registado.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    // 2. Criar o perfil do usuário na tabela 'profiles'
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, nome }]);

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        setError('Erro ao criar perfil. Tente novamente.');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSuccess(true);
    
    // Voltar para o login após 2 segundos
    setTimeout(() => {
      onRegister();
    }, 2000);
  };

  if (success) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successBox}>
          <h2>✅ Conta criada com sucesso!</h2>
          <p>Verifique o seu email para confirmar o registo.</p>
          <p>A voltar ao login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Criar Conta</h2>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className={styles.input}
              placeholder="Digite seu nome completo"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="exemplo@email.com"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'A criar conta...' : 'Registar'}
          </button>
        </form>
        
        <p className={styles.loginLink}>
          Já tem conta?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onRegister(); }}>
            Fazer Login
          </a>
        </p>
      </div>
    </div>
  );
}