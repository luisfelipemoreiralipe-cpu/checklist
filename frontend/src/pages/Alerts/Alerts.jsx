import { useState, useEffect } from 'react';
import { alertApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { HiOutlineBell, HiOutlineCheck } from 'react-icons/hi';

const severityBadge = {
  CRITICAL: 'badge-red', HIGH: 'badge-yellow', MEDIUM: 'badge-cyan', LOW: 'badge-gray',
};
const severityLabels = {
  CRITICAL: '🔴 Crítico', HIGH: '🟠 Alto', MEDIUM: '🔵 Médio', LOW: '⚪ Baixo',
};
const typeLabels = {
  CRITICAL_ITEM_FAILED: 'Item Crítico Falhou',
  THRESHOLD_EXCEEDED: 'Limite Excedido',
  PHOTO_REQUIRED: 'Foto Necessária',
  COMPLIANCE_LOW: 'Conformidade Baixa',
  EXECUTION_ABANDONED: 'Execução Abandonada',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    try {
      const { data } = await alertApi.list();
      setAlerts(data.data || []);
    } catch { toast.error('Erro ao carregar alertas'); }
    finally { setLoading(false); }
  };

  const resolveAlert = async (id) => {
    try {
      await alertApi.resolve(id);
      toast.success('Alerta resolvido!');
      loadAlerts();
    } catch { toast.error('Erro ao resolver alerta'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Carregando...</span></div>;

  const openAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Alertas</h1>
        <p>{openAlerts.length} alertas abertos</p>
      </div>

      {openAlerts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {openAlerts.map(alert => (
            <div className="card" key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="kpi-icon red" style={{ flexShrink: 0 }}>
                <HiOutlineBell />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{alert.message}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`badge ${severityBadge[alert.severity]}`}>{severityLabels[alert.severity]}</span>
                  <span className="badge badge-gray">{typeLabels[alert.type] || alert.type}</span>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    {new Date(alert.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
              <button className="btn btn-success btn-sm" onClick={() => resolveAlert(alert.id)}>
                <HiOutlineCheck /> Resolver
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginBottom: 32 }}>
          <div className="empty-icon">✅</div>
          <h3>Nenhum alerta aberto</h3>
          <p>Tudo operando normalmente</p>
        </div>
      )}

      {resolvedAlerts.length > 0 && (
        <>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 'var(--font-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Resolvidos ({resolvedAlerts.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.6 }}>
            {resolvedAlerts.slice(0, 10).map(alert => (
              <div className="card" key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
                <span style={{ color: 'var(--accent-success)' }}>✅</span>
                <span style={{ flex: 1, fontSize: 'var(--font-sm)' }}>{alert.message}</span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                  {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleDateString('pt-BR') : '—'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
