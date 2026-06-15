import { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import styles from '../login/Login.module.css';

function SetupProfile({ session, onDone }) {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    const { error } = await supabase
      .from('profiles')
      .update({ nome })
      .eq('id', session.user.id);

    if (error) {
      setErro('Não foi possível guardar o nome.');
      return;
    }

    onDone(nome);
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Como te chamas?</h2>
        <p style={{ fontSize: '13px', color: '#666', margin: '-8px 0 0' }}>
          Este nome vai aparecer para os outros membros.
        </p>

        <input
          type="text"
          placeholder="O teu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        {erro && <p className={styles.erro}>{erro}</p>}

        <button type="submit">Continuar</button>
      </form>
    </div>
  );
}

export default SetupProfile;