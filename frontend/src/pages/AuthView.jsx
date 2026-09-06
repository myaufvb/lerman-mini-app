import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, User, Lock, Eye, EyeOff, Smartphone, Sparkles, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw, Send } from 'lucide-react';

export function AuthView({ onLoginSuccess, onHaptic }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2FA Telegram Confirmation state
  const [viewMode, setViewMode] = useState('auth'); // 'auth' | '2fa'
  const [authSessionId, setAuthSessionId] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [hasTelegramLinked, setHasTelegramLinked] = useState(true);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  // Register form state
  const [regPhone, setRegPhone] = useState('');
  const [regLogin, setRegLogin] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');

  // Auto-poll Telegram 2FA approval status when in 2FA mode
  useEffect(() => {
    if (viewMode !== '2fa' || !authSessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/check-status?authSessionId=${encodeURIComponent(authSessionId)}`);
        const data = await res.json();
        if (data.approved && data.token && data.user) {
          clearInterval(interval);
          onHaptic?.notification('success');
          onLoginSuccess(data.user, data.token);
        }
      } catch (e) {
        // ignore polling network glitch
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [viewMode, authSessionId, onLoginSuccess, onHaptic]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setError('Введите ваш логин или номер телефона');
      return;
    }

    setError('');
    setIsLoading(true);
    onHaptic?.impact('medium');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: loginInput.trim(),
          password: passwordInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Неверный логин или пароль');
      }

      // Check if Telegram 2FA confirmation is required (e.g. login from PC)
      if (data.requireTelegramConfirmation) {
        setAuthSessionId(data.authSessionId);
        setHasTelegramLinked(data.hasTelegramLinked);
        setViewMode('2fa');
        setError('');
        onHaptic?.impact('light');
        return;
      }

      onHaptic?.notification('success');
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
      onHaptic?.notification('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e) => {
    e?.preventDefault();
    if (!confirmationCode.trim()) {
      setError('Введите 6-значный код из Telegram');
      return;
    }

    setError('');
    setIsVerifyingCode(true);
    onHaptic?.impact('medium');

    try {
      const res = await fetch('/api/auth/verify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authSessionId,
          code: confirmationCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Неверный код подтверждения');
      }

      onHaptic?.notification('success');
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
      onHaptic?.notification('error');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus('Отправка...');
    setError('');
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authSessionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка отправки');
      setResendStatus('✅ Код отправлен повторно в Telegram!');
      setTimeout(() => setResendStatus(''), 4000);
    } catch (err) {
      setError(err.message);
      setResendStatus('');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regLogin.trim() || !regPassword.trim()) {
      setError('Заполните обязательные поля');
      return;
    }

    setError('');
    setIsLoading(true);
    onHaptic?.impact('medium');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: regLogin.trim(),
          password: regPassword.trim(),
          phone: regPhone.trim(),
          name: regName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      onHaptic?.notification('success');
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
      onHaptic?.notification('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-6 relative overflow-hidden animate-scale-in">
        
        {/* Glowing background gradient */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* --- VIEW MODE: 2FA TELEGRAM CONFIRMATION --- */}
        {viewMode === '2fa' ? (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 p-0.5 shadow-xl shadow-cyan-500/25 flex items-center justify-center mb-3 text-cyan-400">
                <Send className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-white">
                Подтверждение входа
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Введите код подтверждения, который вы получили в Телеграм-боте <strong className="text-cyan-400">@Lerman_logic_bot</strong>
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Resend success notice */}
            {resendStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
                {resendStatus}
              </div>
            )}

            {/* Manual Code Input Form */}
            <form onSubmit={handleVerifyCodeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 text-center">
                  Введите 6-значный код из Telegram:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••••"
                  value={confirmationCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setConfirmationCode(val);
                    if (val.length === 6) {
                      // Auto submit when 6 digits are typed
                      setTimeout(() => {
                        handleVerifyCodeSubmit();
                      }, 100);
                    }
                  }}
                  className="w-full text-center text-xl tracking-[0.3em] font-mono py-3 bg-black/60 border border-cyan-500/30 rounded-2xl text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingCode || confirmationCode.length < 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifyingCode ? 'Проверка кода...' : 'Подтвердить вход'}
              </button>
            </form>

            {/* Auto-approval Hint Card */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>Мгновенный вход по кнопке в боте</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Вы также можете просто нажать кнопку <strong>«✅ Разрешить вход на ПК»</strong> прямо в Telegram — этот экран сразу войдет автоматически!
              </p>
            </div>

            {/* Resend & Back buttons */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Выслать код еще раз</span>
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('auth'); setError(''); }}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад</span>
              </button>
            </div>
          </div>
        ) : (
          /* --- VIEW MODE: NORMAL LOGIN / REGISTER --- */
          <>
            {/* Logo & Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/25 flex items-center justify-center mb-3">
                <div className="w-full h-full bg-cyber-900 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h2 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wider">
                Lerman Cyber App
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Безопасный доступ к мониторингу и паролям
              </p>
            </div>

            {/* Tab Switcher (Вход / Регистрация) */}
            <div className="flex bg-white/5 p-1 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Регистрация
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Tab 1: LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    Логин или номер телефона
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+79991234567 или логин"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Пароль (если установлен)"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isLoading ? 'Отправка кода...' : 'Получить код'}
                </button>

                {/* Telegram Bot Helper Hint */}
                <div className="mt-4 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-slate-300 leading-relaxed space-y-1">
                  <div className="font-semibold text-cyan-400 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    Вход по коду из Telegram
                  </div>
                  <p>
                    Нажмите кнопку <strong>«Получить код»</strong>, и в ваш Telegram-бот <strong>@Lerman_logic_bot</strong> придет код подтверждения для входа в приложение.
                  </p>
                </div>
              </form>
            )}

            {/* Tab 2: REGISTER */}
            {activeTab === 'register' && (
              <div className="space-y-4">
                {/* Telegram 1-click registration prompt */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">
                    Быстрая регистрация через Telegram
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    1. Откройте чат с <strong>@Lerman_logic_bot</strong><br/>
                    2. Нажмите <strong>«📝 Зарегистрироваться»</strong><br/>
                    3. Нажмите <strong>«📱 Поделиться контактом»</strong><br/>
                    4. Напишите пароль — бот выдаст вам данные!
                  </p>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase font-semibold">или прямо здесь</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Придумайте логин *"
                      value={regLogin}
                      onChange={(e) => setRegLogin(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Номер телефона (+7...)"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      placeholder="Придумайте пароль *"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isLoading ? 'Создание...' : 'Зарегистрироваться'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
