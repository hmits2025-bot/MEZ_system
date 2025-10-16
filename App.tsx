
import React, { useState, useCallback } from 'react';
import Login from './components/Login';
import MainApp from './components/MainApp';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const handleLogin = useCallback((username: string) => {
    setCurrentUser(username);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      {currentUser ? (
        <MainApp username={currentUser} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
   