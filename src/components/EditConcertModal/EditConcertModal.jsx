import { useState } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import styles from '../ConcertCalendar/ConcertCalendar.module.css';

function EditConcertModal({ concerto, onClose, onUpdated }) {
  const [form, setForm] = useState({
    nome: concerto.nome || '',
    local: concerto.local || '',
    data: concerto.data || '',
    hora_encontro: concerto.hora_encontro?.slice(0, 5) || '',
    hora_refeicao: concerto.hora_refeicao?.slice(0, 5) || '',
    hora_atuacao: concerto.hora_atuacao?.slice(0, 5) || '',
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
      .update(payload)
      .eq('id', concerto.id)
      .select()
      .single();

    setGuardando(false);

    if (error) {
      setErro('Não foi possível guardar. Verifica os campos.');
      return;
    }

    onUpdated(data);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <h2 className={styles.modalTitle}>Editar saída</h2>

        <form onSubmit={handleSubmit} className={styles.formAdd}>
          <label>
            Nome da saída
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </label>

          <label>
            Local
            <input name="local" value={form.local} onChange={handleChange} required />
          </label>

          <label>
            Data
            <input type="date" name="data" value={form.data} onChange={handleChange} required />
          </label>

          <label>
            Hora ponto de encontro
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
            {guardando ? 'A guardar...' : 'Guardar alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditConcertModal;