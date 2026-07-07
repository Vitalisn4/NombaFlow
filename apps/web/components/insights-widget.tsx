'use client';

import { useState } from 'react';

interface InsightsWidgetProps {
  merchantId: string;
  context?: Record<string, unknown>;
}

export function InsightsWidget({ merchantId, context }: InsightsWidgetProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestions = [
    'Why did my revenue drop?',
    'How is my churn rate?',
    'What are my upcoming collections?',
  ];

  const askQuestion = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await fetch('/api/insights/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId, question: q, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError('Could not get insight. Please try again.');
        return;
      }
      setAnswer(data.answer);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e0] p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-[#1a1a18] rounded-lg flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#1a1a18]">AI Revenue Insights</h3>
          <p className="text-xs text-[#888]">Powered by Claude</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => { setQuestion(s); askQuestion(s); }}
            className="text-xs px-3 py-1.5 rounded-full border border-[#e5e5e0] text-[#555] hover:border-[#1a1a18] hover:text-[#1a1a18] transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askQuestion(question)}
          placeholder="Ask about your revenue..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#e5e5e0] text-sm outline-none focus:border-[#1a1a18] transition-colors bg-[#fafafa]"
        />
        <button
          onClick={() => askQuestion(question)}
          disabled={loading || !question.trim()}
          className="px-4 py-2.5 bg-[#1a1a18] text-white rounded-xl text-sm font-medium hover:bg-[#2a2a28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : 'Ask'}
        </button>
      </div>

      {answer && (
        <div className="mt-4 p-4 bg-[#f5f5f3] rounded-xl">
          <p className="text-sm text-[#1a1a18] leading-relaxed">{answer}</p>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
