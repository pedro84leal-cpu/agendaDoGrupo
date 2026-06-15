import { useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import styles from '../ConcertCalendar/ConcertCalendar.module.css';

function AddConcertModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    nome: '',
    local: '',
    data: '',
    hora_encontro: '',
    hora_refeicao: '',
    hora_atuacao: '',
  });
  const [erro, setErro] = useState('');
  const [guardando, setGuardando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setGuardando(true);

    const payload = {
      nome: form.nome,
      local: form.local,
      data: form.data,
      hora_encontro: form.hora_encontro || null,
      hora_refeicao: form.hora_refeicao || null,
      hora_atuacao: form.hora_atuacao || null,
    };

    const { data, error } = await supabase
      .from('concertos')
      .insert(payload)
      .select()
      .single();

    setGuardando(false);

    if (error) {
      setErro('Não foi possível guardar. Verifica os campos.');
      return;
    }

    onCreated(data);
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <h2 className={styles.modalTitle}>Adicionar atuação</h2>

        <form onSubmit={handleSubmit} className={styles.formAdd}>
          <label>
            Nome (Festival, festa...)
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </label>

          <label>
            Local (Morada, ponto de referência)
            <input name="local" value={form.local} onChange={handleChange} required />
          </label>

          <label>
            Data
            <input type="date" name="data" value={form.data} onChange={handleChange} required />
          </label>

          <label>
            Hora ponto de encontro (sede)
            <input type="time" name="hora_encontro" value={form.hora_encontro} onChange={handleChange} />
          </label>

          <label>
            Hora almoço/jantar
            <input type="time" name="hora_refeicao" value={form.hora_refeicao} onChange={handleChange} />
          </label>

          <label>
            Hora da atuação
            <input type="time" name="hora_atuacao" value={form.hora_atuacao} onChange={handleChange} />
          </label>

          {erro && <p className={styles.erro}>{erro}</p>}

          <button type="submit" disabled={guardando}>
            {guardando ? 'A guardar...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddConcertModal;