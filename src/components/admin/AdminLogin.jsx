import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { getAdminPassword, setAdminAuth } from '../../utils/storage';

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctPassword = getAdminPassword();
    if (password === correctPassword) {
      setAdminAuth(true);
      onLoginSuccess();
    } else {
      setError('Incorrect admin password. Default password is: rabee2026');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Quiz</span>
      </button>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-100">
        <div className="mb-4">
          <img src="/logo.png" alt="Ma'din Logo" className="h-14 w-auto object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 font-serif mb-1">
          Admin Portal Gate
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Access local quiz evaluation dashboard, participant records, and CSV exports.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password (default: rabee2026)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] transition-all shadow-md shadow-emerald-800/20 cursor-pointer"
          >
            Authenticate & Open Dashboard
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold">Frontend-Only Security Notice:</span> This application runs entirely inside this browser. This password protects local evaluator tools and does not connect to a remote server. Default: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">rabee2026</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
