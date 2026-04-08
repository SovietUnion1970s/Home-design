import React, { useState, useRef, useEffect } from 'react';
import { queryAIStyleAssistant } from '../utils/aiStyleAssistant';
import { analyzeFengShui } from '../utils/fengShuiChecker';
import type { FengShuiReport } from '../utils/fengShuiChecker';
import { useDesignStore } from '../store/designStore';

type AIPanelTab = 'style' | 'fengshui';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestion?: any;
  tips?: string[];
}

const QUICK_PROMPTS = [
  'Phong cách tối giản Nhật Bản',
  'Scandinavian hiện đại',
  'Industrial loft',
  'Địa Trung Hải ấm áp',
  'Boho chill',
];

// ─── Style Chat ───────────────────────────────────────────────
const StyleChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', role: 'assistant',
      content: 'Xin chào! 👋 Tôi là trợ lý AI thiết kế nội thất. Hãy nhập phong cách bạn muốn — ví dụ: "Phong cách tối giản Nhật Bản" hoặc "Nhà nhỏ tiết kiệm diện tích".',
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const { setSceneMaterial } = useDesignStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const response = await queryAIStyleAssistant(text);
    
    // Auto-apply materials if suggestion found
    if (response.suggestion?.materials) {
      setSceneMaterial(response.suggestion.materials as any);
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
      suggestion: response.suggestion,
      tips: response.tips,
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex', gap: 8,
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, var(--purple-dark), var(--purple))'
                : 'linear-gradient(135deg, #0d9488, var(--teal))',
            }}>
              {msg.role === 'user' ? 'U' : '🤖'}
            </div>
            <div style={{ maxWidth: '78%' }}>
              <div style={{
                padding: '8px 12px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? 'var(--purple-dim)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${msg.role === 'user' ? 'var(--border-purple)' : 'var(--border)'}`,
                fontSize: 12, lineHeight: 1.6, color: 'var(--text-1)',
              }}>
                {msg.content}
              </div>
              {/* Colour palette */}
              {msg.suggestion?.palette && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 4 }}>
                  {msg.suggestion.palette.map((c: string, i: number) => (
                    <div key={i} title={c} style={{
                      width: 20, height: 20, borderRadius: 4, background: c,
                      border: '1px solid rgba(255,255,255,0.15)',
                      cursor: 'pointer', flexShrink: 0,
                    }} />
                  ))}
                  <span style={{ fontSize: 10, color: 'var(--text-3)', alignSelf: 'center', marginLeft: 2 }}>Bảng màu</span>
                </div>
              )}
              {/* Tips */}
              {msg.tips && msg.tips.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  {msg.tips.map((tip: string, i: number) => (
                    <div key={i} style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 5, marginBottom: 3 }}>
                      <span style={{ color: 'var(--teal)', flexShrink: 0 }}>✦</span> {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d9488, var(--teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
            }}>🤖</div>
            <div style={{ padding: '8px 14px', borderRadius: '14px 14px 14px 4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
              <span className="spin" style={{ display: 'inline-block', fontSize: 14 }}>⟳</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>Đang suy nghĩ...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => sendMessage(p)} style={{
            padding: '3px 8px', borderRadius: 99, fontSize: 10, cursor: 'pointer',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            color: 'var(--text-3)', transition: 'all 0.12s',
          }}
          onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--border-purple)'; (e.target as any).style.color = '#d8b4fe'; }}
          onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--text-3)'; }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <input
          className="input"
          placeholder="Phong cách, màu sắc, phong thủy..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          style={{ flex: 1, fontSize: 12, padding: '7px 10px' }}
        />
        <button
          className="btn btn-primary" onClick={() => sendMessage(input)}
          disabled={!input.trim() || isThinking}
          style={{ padding: '7px 12px', fontSize: 14, flexShrink: 0 }}
        >↑</button>
      </div>
    </div>
  );
};

// ─── Feng Shui Panel ──────────────────────────────────────────
const FengShuiPanel: React.FC = () => {
  const { walls } = useDesignStore();
  const [report, setReport] = useState<FengShuiReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 600));
    setReport(analyzeFengShui(walls));
    setIsAnalyzing(false);
  };

  const scoreColor = (s: number) =>
    s >= 80 ? 'var(--emerald)' : s >= 60 ? 'var(--amber)' : 'var(--rose)';

  return (
    <div style={{ padding: 14, overflowY: 'auto', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>🧭</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>AI Phong Thủy Checker</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 14 }}>
          Phân tích bố cục mặt bằng theo các nguyên tắc phong thủy cơ bản.
        </div>
        <button
          className="btn btn-primary"
          onClick={analyze}
          disabled={isAnalyzing || walls.length === 0}
          style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '9px' }}
        >
          {isAnalyzing ? <><span className="spin">↻</span> Đang phân tích...</> : '🔍 Phân tích phong thủy'}
        </button>
      </div>

      {report && (
        <>
          {/* Score Circle */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              width: 80, height: 80, borderRadius: '50%',
              border: `3px solid ${scoreColor(report.score)}`,
              boxShadow: `0 0 20px ${scoreColor(report.score)}44`,
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: scoreColor(report.score), lineHeight: 1 }}>{report.score}</div>
              <div style={{ fontSize: 9, color: 'var(--text-3)' }}>/ 100</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{report.overallMessage}</div>
          </div>

          {/* Issues */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {report.issues.map((issue, i) => (
              <div key={i} style={{
                padding: '10px 12px', borderRadius: 10,
                background: issue.severity === 'warning' ? 'rgba(244,63,94,0.06)' :
                            issue.severity === 'good' ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)',
                border: `1px solid ${issue.severity === 'warning' ? 'rgba(244,63,94,0.2)' :
                                      issue.severity === 'good' ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{issue.icon}</span>
                  <div>
                    <div style={{
                      fontSize: 12, fontWeight: 600, marginBottom: 3,
                      color: issue.severity === 'warning' ? '#fb7185' :
                             issue.severity === 'good' ? '#34d399' : 'var(--text-1)',
                    }}>{issue.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>{issue.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!report && walls.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-4)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✏️</div>
          <div style={{ fontSize: 12 }}>Vẽ tường trước rồi phân tích</div>
        </div>
      )}
    </div>
  );
};

// ─── Main AI Panel ────────────────────────────────────────────
const AIPanel: React.FC = () => {
  const [tab, setTab] = useState<AIPanelTab>('style');

  return (
    <div style={{
      position: 'absolute', right: 16, bottom: 16, top: 60,
      width: 300, zIndex: 10,
      background: 'rgba(4,4,13,0.95)', backdropFilter: 'blur(24px)',
      border: '1px solid var(--border-2)', borderRadius: 20,
      boxShadow: 'var(--shadow-lg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ fontSize: 16 }}>🤖</div>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>AI Design Assistant</div>
        <div className="badge badge-teal" style={{ fontSize: 9 }}>Beta</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'style', label: '✨ Phong cách' },
          { id: 'fengshui', label: '🧭 Phong thủy' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as AIPanelTab)} style={{
            flex: 1, padding: '9px 4px', fontSize: 11, fontWeight: 500,
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${tab === t.id ? 'var(--purple)' : 'transparent'}`,
            color: tab === t.id ? '#d8b4fe' : 'var(--text-3)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'style' ? <StyleChat /> : <FengShuiPanel />}
      </div>
    </div>
  );
};

export default AIPanel;
