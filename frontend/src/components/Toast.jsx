import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback((type, message, duration) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    timers.current[id] = setTimeout(() => remove(id), duration);
  }, [remove]);

  const toast = {
    success: (message, duration = 3500) => push('success', message, duration),
    error: (message, duration = 5500) => push('error', message, duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 380,
        }}
      >
        <style>{`
          @keyframes toast-in {
            from { opacity: 0; transform: translateX(24px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
              padding: '13px 14px',
              borderLeft: `4px solid ${t.type === 'success' ? '#10b981' : '#dc2626'}`,
              animation: 'toast-in 0.2s ease',
            }}
          >
            {t.type === 'success' ? (
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
            ) : (
              <XCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
            )}
            <div style={{ fontSize: 13, color: '#1e293b', flex: 1, lineHeight: 1.45, whiteSpace: 'pre-line' }}>
              {t.message}
            </div>
            <button
              onClick={() => remove(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé à l\'intérieur de ToastProvider');
  return ctx;
}