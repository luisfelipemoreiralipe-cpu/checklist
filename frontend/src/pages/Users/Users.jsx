import { useState } from 'react';
import { authApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { HiOutlineUserAdd, HiOutlineUsers } from 'react-icons/hi';

const roleLabels = { ADMIN: 'Administrador', MANAGER: 'Gerente', STAFF: 'Colaborador' };
const roleBadge = { ADMIN: 'badge-red', MANAGER: 'badge-purple', STAFF: 'badge-cyan' };

export default function Users() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const createUser = async () => {
    setSubmitting(true);
    try {
      await authApi.register(form);
      toast.success(`Usuário ${form.name} criado!`);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'STAFF' });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Erro ao criar usuário');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Usuários</h1>
        <p>Gerenciar usuários do sistema</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlineUserAdd /> Novo Usuário
        </button>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}><HiOutlineUsers /></div>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Gerenciamento de Usuários</h3>
        <p style={{ color: 'var(--text-muted)' }}>Use o botão acima para cadastrar novos colaboradores</p>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Usuário</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Nome</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome completo" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@exemplo.com" />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="form-group">
              <label>Papel</label>
              <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={createUser} disabled={!form.name || !form.email || !form.password || submitting}>
                {submitting ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
