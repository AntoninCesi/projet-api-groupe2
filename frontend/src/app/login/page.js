'use client';

import { useState } from 'react';
<<<<<<< Updated upstream
import { Eye, EyeOff, AtSign, Mail, Lock, ArrowRight, Check } from 'lucide-react';
=======
import { Apple, Eye, EyeOff, AtSign, Mail, Lock, ArrowRight, Check } from 'lucide-react';
>>>>>>> Stashed changes
import api from '@/utils/api';
import { setToken } from '@/utils/auth';
import { interests } from '@/data/auth';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [username, setUsername] = useState('');
  const [picks, setPicks] = useState([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [wantEmails, setWantEmails] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function togglePick(it) {
    setPicks((p) => (p.includes(it) ? p.filter((x) => x !== it) : [...p, it]));
  }

  async function handleSubmit() {
    if (!canSubmit || loading) return;
    setError('');
    setLoading(true);
    try {
<<<<<<< Updated upstream
=======
      // signup -> on crée le compte puis on enchaîne sur le login
>>>>>>> Stashed changes
      if (mode === 'signup') {
        await api.post('/api/auth/register', { username, email, password: pwd });
      }
      const res = await api.post('/api/auth/login', { email, password: pwd });
      setToken(res.data.token);
<<<<<<< Updated upstream
      // hard reload: middleware 
=======
      // hard reload: middleware + pages relisent le cookie tout de suite
>>>>>>> Stashed changes
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const canSubmit = mode === 'login'
    ? email && pwd
    : username && email && pwd.length >= 8 && acceptTerms;

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-6 pb-12">
      <div className="pt-10 text-center">
        <p className="font-title text-2xl font-bold text-ink">
          Trend<span className="text-brand">*</span> <span className="text-sm font-normal text-faint">by Breezy</span>
        </p>
        <h1 className="mt-5 font-title text-3xl font-bold text-ink">
          The news, <span className="text-brand">by topic.</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Dive into the topics heating up. No endless feed — just what matters.
        </p>
      </div>

      {/* tabs login / signup */}
      <div className="mt-6 flex rounded-2xl bg-line/60 p-1">
        <button onClick={() => setMode('login')} className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-muted'}`}>
          Login
        </button>
        <button onClick={() => setMode('signup')} className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-ink shadow-sm' : 'text-muted'}`}>
          Sign up
        </button>
      </div>

      {/* champs */}
      <div className="space-y-3">
        {mode === 'signup' && (
          <InputRow icon={AtSign}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_handle" className="w-full bg-transparent text-ink outline-none placeholder:text-faint" />
          </InputRow>
        )}
        <InputRow icon={Mail}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-ink outline-none placeholder:text-faint" />
        </InputRow>
        <InputRow icon={Lock}>
          <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="8 characters minimum" className="w-full bg-transparent text-ink outline-none placeholder:text-faint" />
          <button onClick={() => setShowPwd((v) => !v)} aria-label="Toggle password" className="text-faint">
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </InputRow>
      </div>

      {/* sign up terms + tags */}
      {mode === 'signup' && (
        <>
          <h2 className="mt-5 text-sm font-semibold text-ink">Your interests</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {interests.map((it) => (
              <button key={it} onClick={() => togglePick(it)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${picks.includes(it) ? 'bg-brand/10 text-brand' : 'border border-line bg-white text-muted'}`}>
                {it}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <Checkbox checked={acceptTerms} onChange={() => setAcceptTerms((v) => !v)}>
              I accept the <span className="font-medium text-brand">Terms of Use</span> and the <span className="font-medium text-brand">Privacy Policy</span>. Required.
            </Checkbox>
            <Checkbox checked={wantEmails} onChange={() => setWantEmails((v) => !v)}>
              I want to receive news, hot-topic alerts and recommendations from Trend by email. (optional)
            </Checkbox>
          </div>
          <p className="mt-3 text-xs text-faint">
            Your data stays in the EU and is never sold. You can withdraw consent anytime in Settings → Privacy.
          </p>
        </>
      )}

      {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-white ${canSubmit && !loading ? 'bg-brand-grad' : 'bg-brand/40'}`}
      >
        {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create my account'}
        {!loading && <ArrowRight size={18} />}
      </button>
    </main>
  );
}

function InputRow({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 focus-within:border-brand">
      <Icon size={18} className="text-faint" />
      {children}
    </div>
  );
}

function Checkbox({ checked, onChange, children }) {
  return (
    <button onClick={onChange} className="flex items-start gap-2 text-left text-xs text-muted">
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? 'border-brand bg-brand text-white' : 'border-line bg-white'}`}>
        {checked && <Check size={12} />}
      </span>
      <span>{children}</span>
    </button>
  );
}