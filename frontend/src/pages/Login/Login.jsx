import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const demoAccounts = [
  { label: 'Admin', email: 'admin@restaurante.com' },
  { label: 'Gerente', email: 'gerente@restaurante.com' },
  { label: 'Staff', email: 'joao@restaurante.com' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const dest = user.role === 'STAFF' ? '/executar' : '/dashboard';
      navigate(dest);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword('senha123456');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>CheckOps</h1>
          <p>Performance Operacional para Restaurantes</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Entrar'}
          </button>
        </form>

        <div className="login-demo">
          <p>Contas de demonstração</p>
          <div className="login-demo-accounts">
            {demoAccounts.map(acc => (
              <button key={acc.email} className="login-demo-btn" onClick={() => fillDemo(acc)}>
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 'var(--font-sm)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Ainda não tem conta? </span>
          <Link to="/signup" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Começar agora</Link>
        </div>
      </div>
    </div>
  );
}
