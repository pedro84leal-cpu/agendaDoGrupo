import { useState, useEffect } from 'react';
import { supabase } from '../src/supabase/supabaseClient';
import Login from '../src/login/Login';
import ConcertCalendar from '../src/components/ConcertCalendar/ConcertCalendar';
import SetupProfile from '../src/SetupProfile/SetupProfile';
import './App.css'

async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('nome')
    .eq('id', userId)
    .single();

  return data;
}

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session) {
      setSession(session);
      const data = await fetchProfile(session.user.id);
      setProfile(data);
    }
    setLoading(false);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
    setSession(session);
    if (session) {
      const data = await fetchProfile(session.user.id);
      setProfile(data);
    } else {
      setProfile(null);
    }
    setLoading(false);
  });

  return () => listener.subscription.unsubscribe();
}, []);

  if (loading) return null;

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  if (!profile?.nome) {
    return (
      <SetupProfile
        session={session}
        onDone={(nome) => setProfile({ nome })}
      />
    );
  }

  return <ConcertCalendar session={session} />;
}

export default App;