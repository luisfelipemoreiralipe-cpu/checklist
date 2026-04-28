import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import './Login.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    companyName: '',
    slug: '',
    adminName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from company name
    if (name === 'companyName') {
      const generatedSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.signup(formData);
      toast.success('Estabelecimento criado com sucesso! Faça login agora.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Erro ao cadastrar estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 500 }}>
        <div className="login-logo">
          <h1>CheckOps</h1>
          <p>Crie sua conta e profissionalize sua operação</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Nome da Empresa</label>
              <input
                name="companyName"
                className="form-input"
                placeholder="Ex: Restaurante Central"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Slug (URL)</label>
              <input
                name="slug"
                className="form-input"
                placeholder="restaurante-central"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Seu Nome Completo</label>
            <input
              name="adminName"
              className="form-input"
              placeholder="Como quer ser chamado?"
              value={formData.adminName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>E-mail Profissional</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha de Acesso</label>
            <input
              name="password"
              type="password"
              className="form-input"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderTopColor: 'white' }} /> : 'Criar minha conta'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 'var(--font-sm)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Já possui uma conta? </span>
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Entrar agora</Link>
        </div>
      </div>
    </div>
  );
}
