import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import styles from '../ConcertCalendar/ConcertCalendar.module.css';
import ConcertList from '../../data/concertosLista/ConcertList';
import AddConcertModal from '../AddConcertModal/AddConcertModal';

function ConcertCalendar({ session }) {
  const [concertos, setConcertos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

useEffect(() => {
  async function fetchConcertos() {
    const { data, error } = await supabase
      .from('concertos')
      .select('*')
      .order('data', { ascending: true });

    if (!error) setConcertos(data);
    setLoading(false);
  }

  async function checkAdmin() {
    const { data } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .single();

    setIsAdmin(!!data);
  }

  fetchConcertos();
  checkAdmin();
}, [session.user.id]);


 function handleConcertoUpdated(novoConcerto) {
  setConcertos((prev) =>
    prev
      .map((c) => (c.id === novoConcerto.id ? novoConcerto : c))
      .sort((a, b) => a.data.localeCompare(b.data))
  );
}

function handleCreated(novoConcerto) {
  setConcertos((prev) =>
    [...prev, novoConcerto].sort((a, b) => a.data.localeCompare(b.data))
  );
}

async function handleLogout() {
  await supabase.auth.signOut();
}

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Próximas atuações</h2>
        <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
      </div>

      {loading ? (
        <p>A carregar...</p>
      ) : (
        <ConcertList
            concertos={concertos}
            session={session}
            isAdmin={isAdmin}
            onConcertoUpdated={handleConcertoUpdated}
          />
      )}

      {isAdmin && (
        <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
          Adicionar atuação
        </button>
      )}

      {showAddModal && (
        <AddConcertModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

export default ConcertCalendar;