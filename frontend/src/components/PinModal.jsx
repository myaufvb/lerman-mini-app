import React, { useState } from 'react';
import { Lock, Delete, X } from 'lucide-react';

export function PinModal({ isOpen, onClose, onVerifySuccess, onHaptic }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length >= 6) return;
    onHaptic?.impact('light');
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    // If reached 4 digits, attempt verification
    if (newPin.length === 4) {
      checkPin(newPin);
    }
  };

  const handleDelete = () => {
    onHaptic?.impact('light');
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    onHaptic?.impact('medium');
    setPin('');
    setError(false);
  };

  const checkPin = async (code) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/settings/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code })
      });
      const data = await res.json();
      if (data.valid) {
        onHaptic?.notification('success');
        onVerifySuccess();
        setPin('');
        onClose();
      } else {
        throw new Error('Wrong PIN');
      }
    } catch (err) {
      onHaptic?.notification('error');
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xs glass-panel-glow rounded-3xl p-6 flex flex-col items-center animate-scale-in">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-3">
          <Lock className="w-7 h-7 text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Master PIN
        </h3>
        <p className="text-xs text-slate-400 text-center mb-6">
          Введите 4-значный код для доступа к защищенному сейфу паролей
        </p>

        {/* PIN indicator dots */}
        <div className={`flex gap-3 mb-8 transition-transform ${error ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                pin.length > index
                  ? error
                    ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-500/50'
                    : 'bg-cyan-400 scale-110 shadow-lg shadow-cyan-400/50'
                  : 'bg-slate-700 border border-slate-600'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-rose-400 mb-4 font-semibold">
            Неверный PIN! Попробуйте снова.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              disabled={isSubmitting}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 active:bg-cyan-500/20 active:scale-95 text-xl font-bold text-slate-100 border border-white/5 transition-all flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={isSubmitting}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs uppercase font-bold text-slate-400 flex items-center justify-center"
          >
            Сброс
          </button>
          <button
            onClick={() => handleDigit('0')}
            disabled={isSubmitting}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 active:bg-cyan-500/20 active:scale-95 text-xl font-bold text-slate-100 border border-white/5 transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
