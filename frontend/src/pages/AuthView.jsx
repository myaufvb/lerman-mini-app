import React, { useState, useEffect } from 'react';
import { Shield, User, Lock, Eye, EyeOff, Smartphone, Sparkles, AlertCircle, RefreshCw, Send, ArrowLeft } from 'lucide-react';
import { InteractivePullLamp } from '../components/InteractivePullLamp';

export function AuthView({ onLoginSuccess, onHaptic }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [isLampOn, setIsLampOn] = useState(false);
  
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
        // ignore network jitter during polling
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

      // Check if Telegram 2FA confirmation is required (login from browser / PC)
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
      setResendStatus('✅ Код отправлен в Telegram!');
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

  const isFormVisible = isLampOn || viewMode === '2fa';

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden transition-colors duration-500 ${isFormVisible ? 'bg-[#121316]' : 'bg-[#0a0b0d]'}`}>
      
      {/* Background ambient gradient glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: isFormVisible 
            ? 'radial-gradient(circle at 35% 45%, rgba(255, 238, 179, 0.08) 0%, rgba(18, 19, 22, 1) 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(10, 12, 16, 1) 0%, #050608 100%)',
          opacity: 1
        }}
      />

      {/* Main Container: Pendant Lamp on the Left, Login Form on the Right */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 w-full max-w-5xl py-6 md:py-10">
        
        {/* 1. The Pendant Lamp with Pull Cord (Scaled up significantly on PC, comfortable on phones) */}
        <div className="flex-shrink-0 flex flex-col items-center md:scale-[1.38] lg:scale-[1.48] md:mr-10 md:-mt-4 origin-center transition-transform duration-300">
          <InteractivePullLamp
            isOn={isFormVisible}
            onToggle={() => {
              setIsLampOn(prev => !prev);
            }}
            onHaptic={onHaptic}
          />
        </div>

        {/* 2. Login & Registration Form (Illuminated by the Lamp) */}
        <div 
          className={`w-full max-w-[340px] sm:max-w-[380px] rounded-[24px] p-6 sm:p-7 relative transition-[opacity,transform] duration-300 ease-out will-change-[opacity,transform] ${
            isFormVisible
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
          }`}
          style={{
            background: 'rgba(30, 32, 38, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isFormVisible ? '1px solid rgba(255, 238, 179, 0.22)' : '1px solid rgba(255, 255, 255, 0.07)',
            boxShadow: isFormVisible 
              ? '0 16px 40px rgba(0, 0, 0, 0.7), -8px 0 25px rgba(255, 238, 179, 0.1)' 
              : '0 12px 30px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* --- VIEW MODE: 2FA TELEGRAM CONFIRMATION --- */}
          {viewMode === '2fa' ? (
            <div className="space-y-4 animate-fade-in">
              {/* Header */}
              <div className="text-center mb-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-400/30 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center mb-2.5 text-amber-300">
                  <Send className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Подтверждение входа
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Введите 6-значный код, отправленный ботом <strong className="text-amber-300">@Lerman_logic_bot</strong>
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Resend status */}
              {resendStatus && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
                  {resendStatus}
                </div>
              )}

              {/* Code input form */}
              <form onSubmit={handleVerifyCodeSubmit} className="space-y-3">
                <div>
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
                        setTimeout(() => handleVerifyCodeSubmit(), 100);
                      }
                    }}
                    className="w-full text-center text-2xl tracking-[0.3em] font-mono py-2.5 bg-black/50 border border-amber-400/40 rounded-xl text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCode || confirmationCode.length < 6}
                  className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #f7e1a0, #c89e50)',
                    color: '#211c0f',
                    boxShadow: '0 4px 15px rgba(200, 158, 80, 0.35)'
                  }}
                >
                  {isVerifyingCode ? 'Проверка кода...' : 'Войти в аккаунт'}
                </button>
              </form>

              {/* Auto-approval Hint Card */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>Вход в один клик</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Или нажмите <strong>«✅ Разрешить вход на ПК»</strong> прямо в Telegram — авторизация произойдет мгновенно!
                </p>
              </div>

              {/* Resend & Back */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-amber-300 hover:text-amber-200 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Выслать код снова</span>
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
            /* --- NORMAL LOGIN / REGISTRATION TABS --- */
            <>
              {/* Header */}
              <div className="text-center mb-5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center mb-2 text-amber-300 shadow-md">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wider">
                  {activeTab === 'login' ? 'Вход в систему' : 'Регистрация'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Безопасный доступ к мониторингу и паролям
                </p>
              </div>

              {/* Liquid Glass Capsule Tabs ("Вход" / "Регистрация") */}
              <div className="flex p-1 rounded-xl mb-4 bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(''); onHaptic?.impact('light'); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                    activeTab === 'login'
                      ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30 shadow-sm'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  Войти
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setError(''); onHaptic?.impact('light'); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 ${
                    activeTab === 'register'
                      ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30 shadow-sm'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  Регистрация
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-3.5 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Animated Tab Content Container */}
              <div key={activeTab} className="animate-tab-switch">
                {/* TAB 1: LOGIN */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-300" />
                      Логин или номер телефона
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Логин или номер телефона"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/50 font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      Пароль
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/50 font-mono transition-colors"
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

                  {/* Submit Button (Exact Golden Gradient Style from Template) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 mt-1 rounded-xl text-xs font-bold transition-all hover:opacity-95 active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5"
                    style={{
                      background: 'linear-gradient(135deg, #f7e1a0, #c89e50)',
                      color: '#211c0f',
                      boxShadow: '0 4px 15px rgba(200, 158, 80, 0.35)'
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isLoading ? 'Проверка...' : 'Получить код'}
                  </button>

                  {/* Telegram Bot Helper Notice */}
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-300 leading-relaxed">
                    <div className="font-semibold text-amber-300 flex items-center gap-1 mb-0.5">
                      <Smartphone className="w-3 h-3" />
                      Код в Telegram
                    </div>
                    Нажмите «Получить код» — бот <strong>@Lerman_logic_bot</strong> пришлет код для входа.
                  </div>
                </form>
              )}

              {/* TAB 2: REGISTER */}
              {activeTab === 'register' && (
                <div className="space-y-3">
                  {/* Telegram Bot Registration Helper */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center space-y-1.5">
                    <h4 className="text-xs font-bold text-amber-200">
                      Регистрация через @Lerman_logic_bot
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Откройте бота в Telegram и отправьте контакт для мгновенного получения доступа.
                    </p>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase font-semibold">или прямо здесь</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Придумайте логин *"
                        value={regLogin}
                        onChange={(e) => setRegLogin(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/50 font-mono"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Номер телефона"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/50 font-mono"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        required
                        placeholder="Придумайте пароль *"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/50 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:opacity-95 active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5"
                      style={{
                        background: 'linear-gradient(135deg, #f7e1a0, #c89e50)',
                        color: '#211c0f',
                        boxShadow: '0 4px 15px rgba(200, 158, 80, 0.35)'
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isLoading ? 'Создание...' : 'Зарегистрироваться'}
                    </button>
                  </form>
                </div>
              )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
