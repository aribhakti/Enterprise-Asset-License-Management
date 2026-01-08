
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { User, Asset, Request, AuditLog } from './types';
import { INITIAL_ASSETS, INITIAL_REQUESTS, INITIAL_LOGS } from './constants';

type AppView = 'landing' | 'auth' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('subguard_user');
    const savedAssets = localStorage.getItem('subguard_assets');
    const savedRequests = localStorage.getItem('subguard_requests');
    const savedLogs = localStorage.getItem('subguard_logs');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
    
    if (savedAssets) setAssets(JSON.parse(savedAssets));
    else setAssets(INITIAL_ASSETS);

    if (savedRequests) setRequests(JSON.parse(savedRequests));
    else setRequests(INITIAL_REQUESTS);

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    else setLogs(INITIAL_LOGS);
    
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const handleSignIn = (userData: User) => {
    setUser(userData);
    localStorage.setItem('subguard_user', JSON.stringify(userData));
    setView('dashboard');
  };

  const handleUserUpdate = (userData: User) => {
    setUser(userData);
    localStorage.setItem('subguard_user', JSON.stringify(userData));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('subguard_user');
    setView('landing');
  };

  const enterGuestMode = () => {
    setUser({
      id: 'guest',
      email: 'guest@subguard.io',
      businessName: 'Guest Explorer'
    });
    setView('dashboard');
  };

  const updateAssets = (newAssets: Asset[]) => {
    setAssets(newAssets);
    localStorage.setItem('subguard_assets', JSON.stringify(newAssets));
    // Add generic log
    const newLog: AuditLog = {
      id: Math.random().toString(36),
      action: 'Registry Update',
      actor: user?.businessName || 'System',
      target: 'Asset Registry',
      timestamp: new Date().toISOString(),
      details: 'Asset list was modified manually.'
    };
    updateLogs([newLog, ...logs]);
  };

  const updateRequests = (newRequests: Request[]) => {
    setRequests(newRequests);
    localStorage.setItem('subguard_requests', JSON.stringify(newRequests));
  };

  const updateLogs = (newLogs: AuditLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('subguard_logs', JSON.stringify(newLogs));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
        <p className="font-orbitron text-violet-400 tracking-widest text-sm animate-pulse uppercase">Initializing Registry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {view === 'landing' && (
        <LandingPage onGetStarted={() => setView('auth')} onTryNow={enterGuestMode} />
      )}
      {view === 'auth' && (
        <Auth onAuthSuccess={handleSignIn} onBack={() => setView('landing')} />
      )}
      {view === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          assets={assets} 
          requests={requests}
          logs={logs}
          onUpdate={updateAssets} 
          onRequestUpdate={updateRequests}
          onLogUpdate={updateLogs}
          onSignOut={handleSignOut}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
};

export default App;
