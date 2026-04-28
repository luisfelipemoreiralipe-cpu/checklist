import { useState, useEffect } from 'react';
import { checklistApi, itemApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowLeft, HiOutlineClipboardList } from 'react-icons/hi';
import './Checklists.css';

const categoryLabels = {
  KITCHEN: '🍳 Cozinha', STORAGE: '📦 Estoque', CLEANING: '🧹 Limpeza',
  SAFETY: '🛡️ Segurança', SERVICE: '🍽️ Serviço', OPENING: '🌅 Abertura',
  CLOSING: '🌙 Fechamento', GENERAL: '📋 Geral',
};

const frequencyLabels = {
  DAILY: 'Diário', WEEKLY: 'Semanal', MONTHLY: 'Mensal', SHIFT: 'Por Turno', ON_DEMAND: 'Sob Demanda',
};

const typeLabels = {
  BOOLEAN: 'Sim/Não', NUMBER: 'Número', TEXT: 'Texto', PHOTO: 'Foto', RATING: 'Avaliação',
};

export default function Checklists() {
  const [checklists, setChecklists] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'GENERAL', frequency: 'DAILY' });
  const [itemForm, setItemForm] = useState({ title: '', description: '', type: 'BOOLEAN', required: true, weight: 1, isCritical: false, order: 0 });
  const toast = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => { loadChecklists(); }, []);

  const loadChecklists = async () => {
    try {
      const { data } = await checklistApi.list({ limit: 50 });
      setChecklists(data.data || []);
    } catch { toast.error('Erro ao carregar checklists'); }
    finally { setLoading(false); }
  };

  const loadDetail = async (id) => {
    try {
      const { data } = await checklistApi.getById(id);
      setSelected(data.data);
    } catch { toast.error('Erro ao carregar checklist'); }
  };

  const openCreate = () => {
    setEditingChecklist(null);
    setForm({ name: '', description: '', category: 'GENERAL', frequency: 'DAILY' });
    setShowModal(true);
  };

  const openEdit = (cl, e) => {
    e?.stopPropagation();
    setEditingChecklist(cl);
    setForm({ name: cl.name, description: cl.description || '', category: cl.category, frequency: cl.frequency });
    setShowModal(true);
  };

  const saveChecklist = async () => {
    try {
      if (editingChecklist) {
        await checklistApi.update(editingChecklist.id, form);
        toast.success('Checklist atualizado!');
      } else {
        await checklistApi.create(form);
        toast.success('Checklist criado!');
      }
      setShowModal(false);
      loadChecklists();
      if (selected) loadDetail(selected.id);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Erro ao salvar');
    }
  };

  const deleteChecklist = async (id, e) => {
    e?.stopPropagation();
    if (!confirm('Desativar este checklist?')) return;
    try {
      await checklistApi.remove(id);
      toast.success('Checklist desativado');
      loadChecklists();
      if (selected?.id === id) setSelected(null);
    } catch { toast.error('Erro ao remover'); }
  };

  const openAddItem = () => {
    setItemForm({ title: '', description: '', type: 'BOOLEAN', required: true, weight: 1, isCritical: false, order: (selected?.items?.length || 0) + 1 });
    setShowItemModal(true);
  };

  const saveItem = async () => {
    try {
      await checklistApi.addItem(selected.id, itemForm);
      toast.success('Item adicionado!');
      setShowItemModal(false);
      loadDetail(selected.id);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Erro ao adicionar item');
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Remover item?')) return;
    try {
      await itemApi.remove(itemId);
      toast.success('Item removido');
      loadDetail(selected.id);
    } catch { toast.error('Erro ao remover item'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Carregando...</span></div>;

  // Detail view
  if (selected) {
    return (
      <div className="page checklist-detail">
        <button className="checklist-detail-back" onClick={() => setSelected(null)}>
          <HiOutlineArrowLeft /> Voltar para lista
        </button>
        <div className="checklist-detail-header">
          <div>
            <h1 className="page-header" style={{ margin: 0 }}>
              <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: 'var(--font-2xl)', fontWeight: 800 }}>
                {selected.name}
              </span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{selected.description || 'Sem descrição'}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <span className="badge badge-purple">{categoryLabels[selected.category]}</span>
              <span className="badge badge-cyan">{frequencyLabels[selected.frequency]}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={(e) => openEdit(selected, e)}><HiOutlinePencil /> Editar</button>
            <button className="btn btn-primary btn-sm" onClick={openAddItem}><HiOutlinePlus /> Item</button>
          </div>
        </div>

        <div className="items-list">
          {(selected.items || []).sort((a, b) => a.order - b.order).map(item => (
            <div className="item-card" key={item.id}>
              <div className="item-order">{item.order}</div>
              <div className="item-info">
                <div className="item-title">
                  {item.isCritical && <span className="critical-dot" title="Item crítico" />}
                  {item.title}
                </div>
                {item.description && <div className="item-desc">{item.description}</div>}
              </div>
              <div className="item-badges">
                <span className="badge badge-purple">{typeLabels[item.type]}</span>
                {item.required && <span className="badge badge-yellow">Obrigatório</span>}
                <span className="badge badge-gray">Peso {item.weight}</span>
              </div>
              <div className="item-actions">
                <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item.id)}>
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
          ))}
          {(!selected.items || selected.items.length === 0) && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>Nenhum item cadastrado</h3>
              <p>Adicione itens ao checklist</p>
            </div>
          )}
        </div>

        {/* Add Item Modal */}
        {showItemModal && (
          <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Adicionar Item</h2>
                <button className="modal-close" onClick={() => setShowItemModal(false)}>✕</button>
              </div>
              <div className="form-group">
                <label>Título</label>
                <input className="form-input" value={itemForm.title} onChange={e => setItemForm({...itemForm, title: e.target.value})} placeholder="Ex: Temperatura da geladeira" />
              </div>
              <div className="form-group">
                <label>Descrição (opcional)</label>
                <input className="form-input" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Tipo</label>
                  <select className="form-select" value={itemForm.type} onChange={e => setItemForm({...itemForm, type: e.target.value})}>
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Peso (1-10)</label>
                  <input type="number" className="form-input" min="1" max="10" value={itemForm.weight} onChange={e => setItemForm({...itemForm, weight: Number(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-sm)' }}>
                  <input type="checkbox" checked={itemForm.required} onChange={e => setItemForm({...itemForm, required: e.target.checked})} /> Obrigatório
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-sm)' }}>
                  <input type="checkbox" checked={itemForm.isCritical} onChange={e => setItemForm({...itemForm, isCritical: e.target.checked})} /> Item Crítico
                </label>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowItemModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={saveItem} disabled={!itemForm.title}>Adicionar</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Checklist Modal (reused) */}
        {showModal && renderChecklistModal()}
      </div>
    );
  }

  function renderChecklistModal() {
    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{editingChecklist ? 'Editar Checklist' : 'Novo Checklist'}</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
          </div>
          <div className="form-group">
            <label>Nome</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Checklist de Abertura" />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descreva o propósito..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Categoria</label>
              <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Frequência</label>
              <select className="form-select" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}>
                {Object.entries(frequencyLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveChecklist} disabled={!form.name}>
              {editingChecklist ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="page">
      <div className="page-header">
        <h1>Checklists</h1>
        <p>Gerencie seus templates de checklist</p>
      </div>

      <div className="checklists-toolbar">
        <div className="checklists-filters">
          {/* Future: filters */}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Novo Checklist
        </button>
      </div>

      <div className="checklist-cards">
        {checklists.map(cl => (
          <div className="checklist-card" key={cl.id} onClick={() => loadDetail(cl.id)}>
            <div className="checklist-card-header">
              <h3>{cl.name}</h3>
            </div>
            {cl.description && <div className="checklist-card-desc">{cl.description}</div>}
            <div className="checklist-card-meta">
              <span className="badge badge-purple">{categoryLabels[cl.category]}</span>
              <span className="badge badge-cyan">{frequencyLabels[cl.frequency]}</span>
              {!cl.active && <span className="badge badge-red">Inativo</span>}
            </div>
            <div className="checklist-card-footer">
              <span className="checklist-card-items">
                <HiOutlineClipboardList style={{ verticalAlign: 'middle' }} /> {cl._count?.items || cl.items?.length || '—'} itens
              </span>
              <div className="checklist-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={(e) => openEdit(cl, e)}><HiOutlinePencil /></button>
                {isAdmin && <button className="btn btn-danger btn-sm" onClick={(e) => deleteChecklist(cl.id, e)}><HiOutlineTrash /></button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {checklists.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Nenhum checklist cadastrado</h3>
          <p>Crie seu primeiro template de checklist</p>
        </div>
      )}

      {showModal && renderChecklistModal()}
    </div>
  );
}
