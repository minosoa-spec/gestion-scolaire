import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Lock, Eye, EyeOff, BookOpen, Pencil, Ruler } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.detail || 'Identifiants incorrects';
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
        background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 45%, #134e4a 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientMove 14s ease infinite',
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
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
        @keyframes fieldIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(6deg); }
        }
        @keyframes floatIconReverse {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(14px) rotate(-6deg); }
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 8px 20px rgba(45, 212, 191, 0.35); }
          50% { box-shadow: 0 8px 28px rgba(45, 212, 191, 0.55); }
        }
        .bg-icon {
          position: absolute;
          color: rgba(255, 255, 255, 0.06);
          pointer-events: none;
        }
        .field-group {
          opacity: 0;
          animation: fieldIn 0.5s ease forwards;
        }
        .login-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
        }
        .login-input:focus {
          border-color: #2dd4bf !important;
          box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.15);
          transform: translateY(-1px);
        }
        .login-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 148, 136, 0.4);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .login-link {
          color: #2dd4bf;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.15s ease;
        }
        .login-link:hover {
          color: #5eead4;
          text-decoration: underline;
        }
        .eye-toggle {
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .eye-toggle:hover {
          color: #0f172a;
          transform: scale(1.08);
        }
        .spinner {
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Icônes flottantes en fond, thème "école" */}
      <GraduationCap className="bg-icon" size={90} style={{ top: '8%', left: '10%', animation: 'floatIcon 7s ease-in-out infinite' }} />
      <BookOpen className="bg-icon" size={70} style={{ bottom: '12%', left: '15%', animation: 'floatIconReverse 8s ease-in-out infinite' }} />
      <Pencil className="bg-icon" size={60} style={{ top: '15%', right: '12%', animation: 'floatIconReverse 6.5s ease-in-out infinite' }} />
      <Ruler className="bg-icon" size={64} style={{ bottom: '10%', right: '10%', animation: 'floatIcon 9s ease-in-out infinite' }} />

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: '44px 38px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          animation: 'cardIn 0.5s ease',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0d9488, #0ea5e9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            animation: 'logoPulse 2.5s ease-in-out infinite',
          }}
        >
          <GraduationCap size={28} color="#fff" />
        </div>

       <div style={{ textAlign: 'center' }}>
  <h2 style={{ margin: 0, fontSize: 24, color: '#0f172a' }}>
    Gestion Scolaire
  </h2>
</div>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6, marginBottom: 28, textAlign: 'center' }}>
          Connectez-vous à votre espace
        </p>

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

        <div className="field-group" style={{ marginBottom: 16, animationDelay: '0.1s' }}>
          <label style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
            Nom d'utilisateur
          </label>
          <div style={{ position: 'relative', marginTop: 6 }}>
            <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="login-input"
              type="text"
              placeholder="ex : jdupont"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div className="field-group" style={{ marginBottom: 14, animationDelay: '0.2s' }}>
          <label style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
            Mot de passe
          </label>
          <div style={{ position: 'relative', marginTop: 6 }}>
            <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="login-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 38px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                display: 'flex', alignItems: 'center', padding: 4,
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="field-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, animationDelay: '0.3s' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: '#0d9488', cursor: 'pointer' }}
            />
            Se souvenir de moi
          </label>
          <Link to="/mot-de-passe-oublie" className="login-link" style={{ fontSize: 13 }}>
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          className="login-btn field-group"
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 13,
            background: loading
              ? '#5eead4'
              : 'linear-gradient(135deg, #0d9488, #0ea5e9)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            animationDelay: '0.4s',
          }}
        >
          {loading && (
            <span className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
          )}
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <p className="field-group" style={{ textAlign: 'center', marginTop: 20, marginBottom: 0, fontSize: 13, color: '#64748b', animationDelay: '0.5s' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" className="login-link">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;