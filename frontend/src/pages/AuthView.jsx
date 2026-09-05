import React, { useState } from 'react';
import { Shield, KeyRound, User, Lock, Eye, EyeOff, Smartphone, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function AuthView({ onLoginSuccess, onHaptic }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register form state (for direct web registration if desired)
  const [regPhone, setRegPhone] = useState('');
  const [regLogin, setRegLogin] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginInput.trim() || !passwordInput.trim()) {
      setError('Заполните логин и пароль');
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

      onHaptic?.notification('success');
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
      onHaptic?.notification('error');
    } finally {
      setIsLoading(false);
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
                placeholder="+79991234567 или admin"
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
                  required
                  placeholder="••••••••••••"
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
              <KeyRound className="w-4 h-4" />
              {isLoading ? 'Проверка...' : 'Войти в систему'}
            </button>

            {/* Telegram Bot Helper Hint */}
            <div className="mt-4 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-slate-300 leading-relaxed space-y-1">
              <div className="font-semibold text-cyan-400 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                Забыли пароль или нет данных?
              </div>
              <p>
                В диалоге с ботом <strong>@Lerman_logic_bot</strong> нажмите кнопку <strong>«🔑 Войти»</strong> или <strong>«📱 Прислать номер»</strong> — бот автоматически пришлет ваш логин и пароль для вставки сюда!
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

      </div>
    </div>
  );
}
