
import React, { useState, useEffect } from 'react';
import { AuthMode, User } from '../types';
import { Shield, Sparkles, User as UserIcon, Lock, ChevronLeft, Zap, Mail, ArrowRight, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Clear errors when switching modes
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setNewPassword('');
    setResetCode('');
  }, [mode]);

  const getUsersDB = (): User[] => {
    const stored = localStorage.getItem('subguard_users_db');
    return stored ? JSON.parse(stored) : [];
  };

  const saveUsersDB = (users: User[]) => {
    localStorage.setItem('subguard_users_db', JSON.stringify(users));
  };

  const handleSignIn = () => {
    const users = getUsersDB();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
      // Remove password before passing to app state
      const { password, ...safeUser } = user;
      onAuthSuccess(safeUser);
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleSignUp = () => {
    const users = getUsersDB();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('This email is already registered. Please sign in.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      businessName,
      password // storing password in localstorage for prototype purposes
    };

    saveUsersDB([...users, newUser]);
    
    // Auto login
    const { password: _, ...safeUser } = newUser;
    onAuthSuccess(safeUser);
  };

  const handleForgotPass = () => {
    const users = getUsersDB();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Simulate API call
    setTimeout(() => {
      if (exists) {
        setMode('verify');
        setSuccessMsg(`Reset code sent to ${email}`);
      } else {
        // Security best practice: don't reveal if user exists, but for UX here we might show error or fake success
        // Let's fake success to prevent enumeration, but alert for this prototype
        setMode('verify');
        setSuccessMsg(`Reset code sent to ${email}`);
      }
      setLoading(false);
    }, 1500);
  };

  const handleResetPass = () => {
    if (resetCode !== '1234') { // Mock code
      setError('Invalid reset code. Try "1234"');
      return;
    }
    
    const users = getUsersDB();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex > -1) {
      users[userIndex].password = newPassword;
      saveUsersDB(users);
      setSuccessMsg('Password updated successfully!');
      setTimeout(() => setMode('signin'), 1500);
    } else {
      setError('Account not found.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      switch (mode) {
        case 'signin':
          handleSignIn();
          break;
        case 'signup':
          handleSignUp();
          break;
        case 'forgot':
          handleForgotPass();
          return; // handleForgot manages its own loading/mode switch
        case 'verify':
          handleResetPass();
          break;
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md relative z-10">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-xs font-black uppercase tracking-widest animate-in slide-in-from-left-4 duration-500"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] border border-white shadow-2xl relative overflow-hidden group animate-in zoom-in-95 duration-500">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-100 transition-transform group-hover:scale-110 duration-500">
              {mode === 'forgot' || mode === 'verify' ? <KeyRound className="w-8 h-8 text-white" /> : <Zap className="w-8 h-8 text-white" />}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'verify' && 'Secure Reset'}
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              {mode === 'signin' && 'Access your subscription vault.'}
              {mode === 'signup' && 'Start tracking your assets today.'}
              {mode === 'forgot' && 'Enter your email to receive a code.'}
              {mode === 'verify' && 'Enter the code sent to your email.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start gap-3 text-xs font-bold animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl flex items-start gap-3 text-xs font-bold animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                <div className="relative group/input">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input 
                    type="text" required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300 delay-75">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input 
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            {(mode === 'signin' || mode === 'signup') && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300 delay-100">
                <div className="flex justify-between items-center ml-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Key</label>
                   {mode === 'signin' && (
                     <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-widest">Forgot?</button>
                   )}
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input 
                    type="password" required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                  />
                </div>
              </div>
            )}

            {mode === 'verify' && (
              <>
                <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verification Code</label>
                  <div className="relative group/input">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
                    <input 
                      type="text" required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 tracking-widest"
                    />
                  </div>
                </div>
                <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300 delay-75">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
                    <input 
                      type="password" required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New secure password"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-slate-200 active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'signin' && 'Unlock Account'}
                  {mode === 'signup' && 'Create My Vault'}
                  {mode === 'forgot' && 'Send Reset Code'}
                  {mode === 'verify' && 'Update Password'}
                  {!['forgot', 'verify'].includes(mode) && <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            {mode === 'signin' && (
              <button onClick={() => setMode('signup')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all">
                Don't have an account? <span className="text-slate-900 font-black">Sign Up</span>
              </button>
            )}
            {mode === 'signup' && (
              <button onClick={() => setMode('signin')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all">
                Already have an account? <span className="text-slate-900 font-black">Sign In</span>
              </button>
            )}
            {(mode === 'forgot' || mode === 'verify') && (
              <button onClick={() => setMode('signin')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all">
                Return to <span className="text-slate-900 font-black">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
