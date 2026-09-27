import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Eye, EyeOff, Music2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('form');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  const reset = () => {
    setError(''); setHint('');
    setUsername(''); setEmail(''); setPassword('');
    setOtp(['', '', '', '', '', '']);
    setStep('form'); setLoading(false); setShowPass(false);
  };
  const switchMode = (m) => { reset(); setMode(m); };
  const handleClose = () => { reset(); setMode('login'); onClose(); };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const n = [...otp]; digits.split('').forEach((d, i) => { n[i] = d; }); setOtp(n);
    document.getElementById(`otp-${Math.min(digits.length, 5)}`)?.focus();
  };

  const sendOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.sendSignupOtp(email);
      if (res.success) { setHint(res.message || `Code sent to ${email}`); setStep('otp'); setTimeout(() => document.getElementById('otp-0')?.focus(), 80); }
      else setError(res.message || 'Failed to send code.');
    } catch { setError('Cannot reach server. Is Spring Boot running?'); }
    finally { setLoading(false); }
  };

  const verifyRegister = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter all 6 digits.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.verifyAndRegister({ username, email, password, otp: code });
      if (res.success) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
        localStorage.setItem('mf_user', JSON.stringify(res.data));
        onSuccess(res.data); handleClose();
      } else setError(res.message || 'Verification failed.');
    } catch { setError('Cannot reach server. Is Spring Boot running?'); }
    finally { setLoading(false); }
  };

  const login = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 } });
        localStorage.setItem('mf_user', JSON.stringify(res.data));
        onSuccess(res.data); handleClose();
      } else setError(res.message || 'Invalid email or password.');
    } catch { setError('Cannot reach server. Is Spring Boot running?'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const field = (label, type, value, onChange, placeholder, icon, extra) => (
    <div>
      <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
        style={{ color: 'rgba(232,221,212,0.4)' }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(232,221,212,0.35)' }}>
          {icon}
        </span>
        <input type={type} required value={value} onChange={onChange}
          placeholder={placeholder} {...extra}
          className="water-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium"
          style={{ paddingLeft: icon ? 40 : 16 }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
        onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-3xl p-8 overflow-hidden z-10"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(20,16,14,0.96) 40%)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderTop: '1px solid rgba(255,255,255,0.22)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient glows */}
        <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.18) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,90,60,0.22) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        {/* Close */}
        <button onClick={handleClose} className="absolute top-5 right-5 p-2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(232,221,212,0.5)' }}>
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)' }}>
            <Music2 className="w-7 h-7" style={{ color: '#c9a96e' }} />
          </div>
          <h2 className="text-2xl font-black text-stone-100 mb-1">
            {mode === 'register' ? (step === 'otp' ? 'Check Your Inbox' : 'Create Account') : 'Welcome Back'}
          </h2>
          <p className="text-xs" style={{ color: 'rgba(232,221,212,0.4)' }}>
            {mode === 'register'
              ? step === 'otp' ? `6-digit code sent to ${email}` : 'Join Melo-Fine — OTP verified signup'
              : 'Sign in and receive a personalised welcome email'}
          </p>
        </div>

        {/* Alerts */}
        {error && <div className="alert-error mb-5">⚠ {error}</div>}
        {hint && !error && step === 'otp' && (
          <div className="alert-success mb-5"><CheckCircle2 className="w-4 h-4 shrink-0" />{hint}</div>
        )}

        {/* Register form */}
        {mode === 'register' && step === 'form' && (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgba(232,221,212,0.4)' }}>Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(232,221,212,0.35)' }} />
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. AudioVibes99"
                  className="water-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgba(232,221,212,0.4)' }}>Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(232,221,212,0.35)' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="water-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgba(232,221,212,0.4)' }}>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(232,221,212,0.35)' }} />
                <input type={showPass ? 'text' : 'password'} required minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="water-input w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(232,221,212,0.4)' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-peach w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Send Verification Code</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* OTP step */}
        {mode === 'register' && step === 'otp' && (
          <form onSubmit={verifyRegister} className="space-y-6">
            <div>
              <p className="text-[11px] font-bold text-center uppercase tracking-wider mb-4"
                style={{ color: 'rgba(232,221,212,0.4)' }}>Enter 6-Digit Code</p>
              <div className="flex justify-center">
                <input
                  id="otp-0"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={otp.join('')}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                    const arr = digits.split('');
                    while (arr.length < 6) arr.push('');
                    setOtp(arr);
                  }}
                  onPaste={handlePaste}
                  placeholder="000000"
                  className="water-input text-center text-3xl font-black w-full max-w-[260px] py-4 rounded-xl tracking-widest"
                  style={{ letterSpacing: '0.7rem', caretColor: '#c9a96e' }}
                />
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs"
                style={{ color: 'rgba(232,221,212,0.35)' }}>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#6ee7b7' }} />
                Expires in 5 min • Check spam folder
              </div>
            </div>
            <button type="submit" disabled={loading || otp.join('').length !== 6}
              className="btn-peach w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /><span>Verify & Create Account</span></>}
            </button>
            <button type="button" onClick={() => { setStep('form'); setOtp(['','','','','','']); setError(''); setHint(''); }}
              className="w-full text-center text-xs transition-colors"
              style={{ color: 'rgba(232,221,212,0.35)' }}>
              ← Change email or details
            </button>
          </form>
        )}

        {/* Login form */}
        {mode === 'login' && (
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgba(232,221,212,0.4)' }}>Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(232,221,212,0.35)' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="water-input w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: 'rgba(232,221,212,0.4)' }}>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(232,221,212,0.35)' }} />
                <input type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Your password"
                  className="water-input w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(232,221,212,0.4)' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-peach w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In & Listen</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* Toggle */}
        <div className="mt-7 pt-5 text-center text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(232,221,212,0.4)' }}>
          {mode === 'register'
            ? <>Already have an account? <button onClick={() => switchMode('login')} className="font-bold" style={{ color: '#c9a96e' }}>Sign In</button></>
            : <>New here? <button onClick={() => switchMode('register')} className="font-bold" style={{ color: '#c9a96e' }}>Create Account with OTP</button></>
          }
        </div>
      </div>
    </div>
  );
}


