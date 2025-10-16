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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        <main className="flex-grow flex flex-col">
            {currentUser ? (
                <div className="p-4 sm:p-6 lg:p-8">
                    <MainApp username={currentUser} onLogout={handleLogout} />
                </div>
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </main>
        <footer className="text-center text-gray-500 text-sm py-4 border-t border-gray-800">
            © 2025 HMITS. All rights reserved.
        </footer>
    </div>
  );
};

export default App;