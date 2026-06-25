import { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen/AuthScreen';
import ConcertCalendar from './components/ConcertCalendar/ConcertCalendar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('agenda_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function handleLogin(userData) {
    localStorage.setItem('agenda_user', JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem('agenda_user');
    setUser(null);
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <ConcertCalendar user={user} onLogout={handleLogout} />;
}

export default App;
