
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { User, Asset, Request, AuditLog } from './types';
import { INITIAL_ASSETS, INITIAL_REQUESTS, INITIAL_LOGS } from './constants';

// Lazy load components for performance
const Auth = lazy(() => import('./components/Auth').then(module => ({ default: module.Auth })));
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const LandingPage = lazy(() => import('./components/LandingPage').then(module => ({ default: module.LandingPage })));

type AppView = 'landing' | 'auth' | 'dashboard';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    <p className="font-sans text-indigo-400 tracking-widest text-xs font-black animate-pulse uppercase">Loading SubGuard...</p>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Dynamic Title Management for SEO
    if (view === 'landing') {
        document.title = "SubGuard | Enterprise Asset & License Management";
    } else if (view === 'auth') {
        document.title = "SubGuard | Secure Access";
    } else if (view === 'dashboard') {
        document.title = "Dashboard | SubGuard Financial Protocol";
    }

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
    
    setIsInitializing(false);
  }, [view]);

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

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
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
      </Suspense>
    </div>
  );
};

export default App;
