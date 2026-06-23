'use client';

import { useState } from 'react';
import { Eye, EyeOff, AtSign, Mail, Lock, ArrowRight, Check } from 'lucide-react';
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
      if (mode === 'signup') {
        await api.post('/api/auth/register', { username, email, password: pwd });
      }
      const res = await api.post('/api/auth/login', { email, password: pwd });
      setToken(res.data.token);
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-12 lg:flex-row lg:gap-24 lg:px-20">
      <div className="w-full max-w-[420px] text-center lg:max-w-[480px] lg:text-left">
        <span className="inline-flex items-baseline gap-2 font-title text-[27px] font-bold text-ink">
          <span className="relative">
            Trend
            <span className="absolute left-full top-[0.12em] ml-[0.09em] h-[0.28em] w-[0.28em] rounded-full bg-brand" />
          </span>
          <span className="text-[13px] font-semibold text-faint">by Breezy</span>
        </span>
        <h1 className="mt-6 font-title text-[34px] font-bold leading-[1] -tracking-[1.2px] text-ink lg:text-[52px]">
          {mode === 'login' ? (
            <>Welcome <span className="text-press">back.</span></>
          ) : (
            <>The news, <span className="text-press">by topic.</span></>
          )}
        </h1>
        <p className="mx-auto mt-4 max-w-[340px] text-[15px] font-medium leading-relaxed text-muted lg:mx-0 lg:text-base">
          {mode === 'login'
            ? 'Pick up the topics heating up, right where you left off.'
            : 'Dive into the topics heating up. No endless feed. just what matters.'}
        </p>
      </div>

      <div className="w-full max-w-[400px]">
        <div className="flex rounded-[14px] bg-ink/5 p-1">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-[11px] py-2.5 text-sm font-bold transition ${
                mode === m ? 'bg-surface text-ink shadow-soft' : 'text-muted'
              }`}
            >
              {m === 'login' ? 'Login' : 'Sign up'}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
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
            <button onClick={() => setShowPwd((v) => !v)} aria-label="Toggle password" className="text-faint hover:text-ink">
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </InputRow>
        </div>

        {mode === 'signup' && (
          <>
            <h2 className="mt-5 text-sm font-bold text-ink">Your interests</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {interests.map((it) => (
                <button
                  key={it}
                  onClick={() => togglePick(it)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${
                    picks.includes(it) ? 'bg-tint text-press' : 'border border-line bg-surface text-muted hover:border-brand'
                  }`}
                >
                  {it}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <Checkbox checked={acceptTerms} onChange={() => setAcceptTerms((v) => !v)}>
                I accept the <span className="font-bold text-press">Terms of Use</span> and the <span className="font-bold text-press">Privacy Policy</span>. Required.
              </Checkbox>
              <Checkbox checked={wantEmails} onChange={() => setWantEmails((v) => !v)}>
                I want to receive news, hot-topic alerts and recommendations from Trend by email. (optional)
              </Checkbox>
            </div>
          </>
        )}

        {error && <p className="mt-4 rounded-[12px] bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className={`mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-[16px] text-[15px] font-extrabold transition ${
            canSubmit && !loading
              ? 'bg-brand-grad text-onbrand shadow-glow hover:-translate-y-px active:scale-[0.985]'
              : 'cursor-not-allowed bg-tint text-press/45'
          }`}
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create my account'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </div>
    </main>
  );
}

function InputRow({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[16px] border border-line bg-surface px-4 py-3.5 shadow-soft transition focus-within:border-brand">
      <Icon size={18} className="text-faint" />
      {children}
    </div>
  );
}

function Checkbox({ checked, onChange, children }) {
  return (
    <button onClick={onChange} className="flex items-start gap-2.5 text-left text-xs leading-relaxed text-muted">
      <span className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] border ${checked ? 'border-transparent bg-brand text-white' : 'border-line bg-surface'}`}>
        {checked && <Check size={12} />}
      </span>
      <span>{children}</span>
    </button>
  );
}
