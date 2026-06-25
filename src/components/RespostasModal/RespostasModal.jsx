import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import styles from '../ConcertCalendar/ConcertCalendar.module.css';

const grupos = [
  { campo: 'vou', label: 'Vão' },
  { campo: 'vou_la_ter', label: 'Vão lá ter' },
  { campo: 'nao_posso', label: 'Não podem' },
  { campo: 'vou_almoco_jantar', label: 'Vão ao almoço/jantar' },
];

function RespostasModal({ concerto, onClose }) {
  const [respostas, setRespostas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRespostas() {
      const { data, error } = await supabase
        .from('presencas')
        .select('vou, vou_la_ter, nao_posso, vou_almoco_jantar, membros(nome)')
        .eq('concerto_id', concerto.id);

      if (!error) setRespostas(data);
      setLoading(false);
    }

    fetchRespostas();
  }, [concerto.id]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={`${styles.closeBtn} ${styles.noPrint}`} onClick={onClose}>×</button>

        <div className={styles.printArea}>
          <h2 className={styles.modalTitle}>Respostas — {concerto.nome}</h2>
          <p className={styles.modalData}>{concerto.data}</p>

          {loading ? (
            <p>A carregar...</p>
          ) : (
            <div className={styles.respostasLista}>
              {grupos.map((g) => {
                const pessoas = respostas
                  .filter((r) => r[g.campo])
                  .map((r) => r.membros?.nome || 'Sem nome');

                return (
                  <div key={g.campo} className={styles.respostaGrupo}>
                    <p className={styles.respostaGrupoTitulo}>
                      {pessoas.length} {g.label}
                    </p>
                    {pessoas.map((nome, i) => (
                      <p key={i} className={styles.respostaPessoa}>{nome}</p>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && (
          <button className={`${styles.confirmarBtn} ${styles.noPrint}`} onClick={handlePrint}>
            Imprimir / Guardar PDF
          </button>
        )}
      </div>
    </div>
  );
}

export default RespostasModal;
