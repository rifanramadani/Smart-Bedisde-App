import React, { useState } from 'react';
import { Activity, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateRegister: () => void;
}

export function Login({ onLoginSuccess, onNavigateRegister }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'test' && password === 'qwerty123') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Username atau password tidak valid. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 mb-4">
            <Activity className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">VitaGuard Portal</h1>
          <p className="text-slate-400 text-sm mt-2 text-center">
            Sistem Pemantauan Pasien Terintegrasi<br/>Khusus Tenaga Kesehatan
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-400 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Username / NIK</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <a href="#" className="text-xs text-rose-400 hover:text-rose-300 transition-colors">Lupa sandi?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3.5 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Masuk ke Sistem
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Belum memiliki akses?{' '}
            <button 
              onClick={onNavigateRegister}
              className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
            >
              Daftar sebagai Nakes
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
