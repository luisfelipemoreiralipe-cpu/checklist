import { useState, useEffect } from 'react';
import { executionApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { HiOutlineClock, HiOutlineEye } from 'react-icons/hi';

const statusLabels = {
  COMPLETED: 'Concluído', IN_PROGRESS: 'Em Andamento', PENDING: 'Pendente', CANCELLED: 'Cancelado',
};
const statusBadge = {
  COMPLETED: 'badge-green', IN_PROGRESS: 'badge-cyan', PENDING: 'badge-yellow', CANCELLED: 'badge-red',
};

export default function History() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const toast = useToast();

  useEffect(() => { loadExecutions(); }, []);

  const loadExecutions = async () => {
    try {
      const { data } = await executionApi.list({ limit: 50 });
      setExecutions(data.data || []);
    } catch { toast.error('Erro ao carregar histórico'); }
    finally { setLoading(false); }
  };

  const loadDetail = async (id) => {
    try {
      const { data } = await executionApi.getById(id);
      setDetail(data.data);
    } catch { toast.error('Erro ao carregar detalhes'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Carregando...</span></div>;

  if (detail) {
    const score = detail.compliance || 0;
    const color = score >= 80 ? 'var(--accent-success)' : score >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)';

    return (
      <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
        <button className="checklist-detail-back" onClick={() => setDetail(null)} style={{ marginBottom: 24, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-family)', display: 'flex', alignItems: 'center', gap: 8 }}>
          ← Voltar
        </button>
        <div className="page-header">
          <h1>{detail.checklist?.name || 'Execução'}</h1>
          <p>{detail.user?.name} — {new Date(detail.createdAt).toLocaleString('pt-BR')}</p>
        </div>

        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="kpi-card">
            <div className="kpi-value" style={{ color }}>{score.toFixed(1)}%</div>
            <div className="kpi-label">Conformidade</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">{detail.totalScore}/{detail.maxScore}</div>
            <div className="kpi-label">Pontuação</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value"><span className={`badge ${statusBadge[detail.status]}`}>{statusLabels[detail.status]}</span></div>
            <div className="kpi-label">Status</div>
          </div>
        </div>

        {detail.answers && detail.answers.length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Respostas</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Resposta</th>
                    <th>Comentário</th>
                    <th>Impacto</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.answers.map(ans => (
                    <tr key={ans.id}>
                      <td>{ans.checklistItem?.title || '—'}</td>
                      <td>
                        {typeof ans.value === 'boolean' ? (ans.value ? '✅ Sim' : '❌ Não') :
                         typeof ans.value === 'number' ? ans.value :
                         String(ans.value)}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{ans.comment || '—'}</td>
                      <td>
                        <span className={`badge ${ans.scoreImpact > 0 ? 'badge-green' : ans.scoreImpact < 0 ? 'badge-red' : 'badge-gray'}`}>
                          {ans.scoreImpact > 0 ? '+' : ''}{ans.scoreImpact}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Histórico</h1>
        <p>Todas as execuções de checklists</p>
      </div>

      {executions.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Checklist</th>
                <th>Executor</th>
                <th>Status</th>
                <th>Conformidade</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {executions.map(exec => {
                const score = exec.compliance || 0;
                const color = score >= 80 ? 'var(--accent-success)' : score >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)';
                return (
                  <tr key={exec.id}>
                    <td style={{ fontWeight: 600 }}>{exec.checklist?.name || '—'}</td>
                    <td>{exec.user?.name || '—'}</td>
                    <td><span className={`badge ${statusBadge[exec.status]}`}>{statusLabels[exec.status]}</span></td>
                    <td style={{ fontWeight: 700, color }}>{score.toFixed(1)}%</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(exec.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => loadDetail(exec.id)}>
                        <HiOutlineEye /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><HiOutlineClock /></div>
          <h3>Nenhuma execução registrada</h3>
          <p>As execuções aparecerão aqui</p>
        </div>
      )}
    </div>
  );
}
