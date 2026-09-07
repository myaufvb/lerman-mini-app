import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, CornerDownLeft, Sparkles, Shield, RefreshCw } from 'lucide-react';

const PRESET_COMMANDS = ['status', 'ping', 'scan', 'encrypt', 'audit', 'help', 'clear'];

export function InteractiveTerminal() {
  const [history, setHistory] = useState([
    {
      type: 'system',
      text: '═══════════════════════════════════════════════════════════════════════'
    },
    {
      type: 'system',
      text: '🛡️  LERMAN CYBER SECURITY PROTOCOL v4.2 [DEFCON-1 ENFORCED]'
    },
    {
      type: 'system',
      text: 'Type a command below or click a quick action chip to interact.'
    },
    {
      type: 'system',
      text: '═══════════════════════════════════════════════════════════════════════'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmd) => {
    const rawCmd = cmd.trim();
    if (!rawCmd) return;
    const lower = rawCmd.toLowerCase();

    // Echo input
    const newHistory = [...history, { type: 'input', text: `sentinel@rks:~$ ${rawCmd}` }];

    if (lower === 'clear') {
      setHistory([]);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      let responses = [];

      switch (lower) {
        case 'status':
          responses = [
            { type: 'output', text: '⚡ SYSTEM INTEGRITY: 100% OPTIMAL' },
            { type: 'output', text: '• Core Uptime: 99.998% (42 days without incident)' },
            { type: 'output', text: '• Sentinel Nodes: 12 Active across Frankfurt, Helsinki, Moscow, SG' },
            { type: 'output', text: '• Latency jitter: < 1.4ms | Zero dropped packets' },
            { type: 'output', text: '• Vault Encryption: AES-256-GCM + Argon2id Enabled' }
          ];
          break;

        case 'ping':
          responses = [
            { type: 'output', text: 'PING rks-edge.lerman.network (185.192.34.12): 56 data bytes' },
            { type: 'output', text: '64 bytes from 185.192.34.12: icmp_seq=1 ttl=58 time=21.4 ms' },
            { type: 'output', text: '64 bytes from 185.192.34.12: icmp_seq=2 ttl=58 time=19.8 ms' },
            { type: 'output', text: '64 bytes from 185.192.34.12: icmp_seq=3 ttl=58 time=20.2 ms' },
            { type: 'success', text: '--- rks-edge ping statistics: 0% packet loss, min/avg/max = 19.8/20.4/21.4 ms' }
          ];
          break;

        case 'scan':
          responses = [
            { type: 'output', text: '🔍 Initiating Deep Surface Vulnerability Scan...' },
            { type: 'output', text: '[PORT 443/TCP]  OPEN   TLS 1.3 Strict HSTS (0 weak ciphers)' },
            { type: 'output', text: '[PORT 80/TCP]   CLOSED 301 Permanent Redirect to HTTPS' },
            { type: 'output', text: '[PORT 22/TCP]   FILTERED Protected via WireGuard Mesh VPN' },
            { type: 'output', text: '[WAF SHIELD]    ONLINE Cloudflare Enterprise + Custom Rate Limiter' },
            { type: 'success', text: '✅ AUDIT RESULT: ZERO VULNERABILITIES DETECTED' }
          ];
          break;

        case 'encrypt':
          const mockSalt = Math.random().toString(36).substring(2, 10);
          const mockHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          responses = [
            { type: 'output', text: '🔐 Deriving 256-bit AES master key via PBKDF2...' },
            { type: 'output', text: `• Salt: 0x${mockSalt.toUpperCase()} | Iterations: 100,000` },
            { type: 'output', text: `• Ciphertext: e7b1c4${mockHash}a92` },
            { type: 'output', text: '• GCM Auth Tag: 128-bit verified' },
            { type: 'success', text: '🔒 Data secured in zero-knowledge enclave.' }
          ];
          break;

        case 'audit':
          responses = [
            { type: 'output', text: '📋 Generating Compliance & Security Audit Report...' },
            { type: 'output', text: '• OWASP Top 10: 10/10 Passed' },
            { type: 'output', text: '• End-to-End Key Revocation: Compliant' },
            { type: 'output', text: '• One-Time Burn-on-Read Memory Purge: Verified' },
            { type: 'success', text: '⭐ Security Rating: A+ (Bank-grade standards)' }
          ];
          break;

        case 'help':
          responses = [
            { type: 'output', text: 'Available commands:' },
            { type: 'output', text: '  status   - View global uptime & cluster telemetry' },
            { type: 'output', text: '  ping     - Run sub-millisecond edge latency test' },
            { type: 'output', text: '  scan     - Trigger automated port & vulnerability scan' },
            { type: 'output', text: '  encrypt  - Simulate AES-256-GCM hardware encryption' },
            { type: 'output', text: '  audit    - Check OWASP & cryptographic security standards' },
            { type: 'output', text: '  clear    - Clear console terminal history' }
          ];
          break;

        default:
          responses = [
            { type: 'error', text: `bash: command not found: ${rawCmd}. Type "help" for a list of commands.` }
          ];
          break;
      }

      setHistory([...newHistory, ...responses]);
      setIsProcessing(false);
    }, 280);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;
    executeCommand(inputVal);
    setInputVal('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#070d1a]/95 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,254,0.15)] backdrop-blur-xl">
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            sentinel-rks-terminal ~ bash (interactive)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE LINK
          </span>
        </div>
      </div>

      {/* Quick Action Command Chips */}
      <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Быстрый запуск:</span>
        {PRESET_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => executeCommand(cmd)}
            disabled={isProcessing}
            className="interactive-cursor px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-slate-700/80 hover:border-cyan-500/40 transition-all duration-150 whitespace-nowrap disabled:opacity-50"
          >
            ${cmd}
          </button>
        ))}
      </div>

      {/* Output Console Log Area */}
      <div className="p-4 sm:p-5 h-72 sm:h-80 overflow-y-auto font-mono text-xs sm:text-[13px] leading-relaxed space-y-1.5 text-slate-300 select-text">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={
              line.type === 'input'
                ? 'text-cyan-400 font-bold'
                : line.type === 'success'
                ? 'text-emerald-400 font-semibold'
                : line.type === 'error'
                ? 'text-rose-400'
                : line.type === 'system'
                ? 'text-slate-500'
                : 'text-slate-300'
            }
          >
            {line.text}
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Выполнение команды...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Interactive Command Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-3"
      >
        <span className="text-cyan-400 font-mono font-bold text-xs sm:text-sm pl-1 select-none whitespace-nowrap">
          sentinel@rks:~$
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Введите команду (например: status, scan, ping)..."
          className="flex-1 bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isProcessing}
          className="interactive-cursor px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
