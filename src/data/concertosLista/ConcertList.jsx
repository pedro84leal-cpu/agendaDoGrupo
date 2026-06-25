import { useState, useEffect } from 'react';
import styles from '../../components/ConcertCalendar/ConcertCalendar.module.css';
import { supabase } from '../../supabase/supabaseClient';
import ConcertCard from '../../components/ConcertCard/ConcertCard';
import ConcertModal from '../../components/ConcertModal/ConcertModal';

function ConcertList({ concertos, user, isAdmin, onConcertoUpdated }) {
  const [selecionado, setSelecionado] = useState(null);
  const [presencas, setPresencas] = useState({});

  useEffect(() => {
    async function fetchPresencas() {
      const { data } = await supabase
        .from('presencas')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        const map = {};
        data.forEach((p) => {
          map[p.concerto_id] = p;
        });
        setPresencas(map);
      }
    }

    fetchPresencas();
  }, [user.id]);

  function handleSaved(concertoId, presenca) {
    setPresencas((prev) => ({ ...prev, [concertoId]: presenca }));
  }

  function handleUpdated(novoConcerto) {
    onConcertoUpdated(novoConcerto);
    setSelecionado(novoConcerto);
  }

  return (
    <>
      <div className={styles.list}>
        {concertos.map((c) => (
          <ConcertCard
            key={c.id}
            concerto={c}
            presenca={presencas[c.id]}
            onClick={() => setSelecionado(c)}
          />
        ))}
      </div>

      {selecionado && (
        <ConcertModal
          concerto={selecionado}
          user={user}
          isAdmin={isAdmin}
          onClose={() => setSelecionado(null)}
          onSaved={handleSaved}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}

export default ConcertList;
