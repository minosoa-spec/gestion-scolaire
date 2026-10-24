import { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((options) => {
    const opts = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      setState({
        title: opts.title || 'Confirmation',
        message: opts.message,
        confirmLabel: opts.confirmLabel || 'Confirmer',
        cancelLabel: opts.cancelLabel || 'Annuler',
        danger: opts.danger !== false,
        resolve,
      });
    });
  }, []);

  const handle = (result) => {
    if (state) state.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3500,
          }}
          onClick={() => handle(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 26,
              maxWidth: 380,
              width: '90%',
              boxShadow: '0 24px 56px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: state.danger ? '#fef2f2' : '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={20} color={state.danger ? '#dc2626' : '#2563eb'} />
              </div>
              <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>{state.title}</h3>
            </div>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '0 0 22px' }}>{state.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => handle(false)}
                style={{
                  padding: '9px 16px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={() => handle(true)}
                style={{
                  padding: '9px 16px',
                  background: state.danger
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm doit être utilisé à l\'intérieur de ConfirmProvider');
  return ctx;
}