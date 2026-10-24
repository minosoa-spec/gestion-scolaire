import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

function MotDePasseOublie() {
  const [form, setForm] = useState({ username: '', message: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
    await axios.post(`${API_URL}auth/mot-de-passe-oublie/`, form);
      setSucces(true);
    } catch (err) {
      const data = err.response?.data;
      let message = 'Erreur lors de la demande.';
      if (data) {
        const premiereErreur = Object.values(data)[0];
        message = Array.isArray(premiereErreur) ? premiereErreur[0] : String(premiereErreur);
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        background: 'linear-gradient(135deg, #1e293b 0%, #3b0764 45%, #1e293b 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientMove 12s ease infinite',
        padding: 20,
      }}
    >
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .fp-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
        }
        .fp-input:focus {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.15);
          transform: translateY(-1px);
        }
        .fp-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
        }
        .fp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
        }
        .fp-link {
          color: #818cf8;
          text-decoration: none;
          font-weight: 600;
        }
        .fp-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: '44px 38px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
          animation: 'cardIn 0.5s ease',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            margin: '0 auto 18px',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
          }}
        >
          🔑
        </div>

        <h2 style={{ margin: 0, fontSize: 24, color: '#0f172a', textAlign: 'center' }}>
          Mot de passe oublié
        </h2>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6, marginBottom: 28, textAlign: 'center' }}>
          Un administrateur traitera votre demande et vous communiquera un nouveau mot de passe.
        </p>

        {succes ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                background: '#ecfdf5',
                color: '#059669',
                fontSize: 14,
                padding: '16px 18px',
                borderRadius: 10,
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              ✅ Votre demande a bien été envoyée.<br />
              Contactez un administrateur si besoin pour accélérer le traitement.
            </div>
            <Link to="/login" className="fp-link">Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: 13,
                  padding: '10px 14px',
                  borderRadius: 8,
                  marginBottom: 18,
                  animation: 'shake 0.4s ease',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>Nom d'utilisateur</label>
              <input
                className="fp-input"
                type="text"
                name="username"
                placeholder="ex : jdupont"
                value={form.username}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '11px 14px', marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>Message (optionnel)</label>
              <textarea
                className="fp-input"
                name="message"
                placeholder="ex : numéro pour me contacter, précision..."
                value={form.message}
                onChange={handleChange}
                rows={3}
                style={{ width: '100%', padding: '11px 14px', marginTop: 6, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <button
              className="fp-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 13,
                background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 20, marginBottom: 0, fontSize: 13, color: '#64748b' }}>
              <Link to="/login" className="fp-link">Retour à la connexion</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default MotDePasseOublie;