import { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { HiOutlineViewGrid, HiOutlineCheckCircle, HiOutlineChartBar, HiOutlineBell, HiOutlineTrendingUp, HiOutlineClock } from 'react-icons/hi';
import './Dashboard.css';

const statusColors = {
  COMPLETED: 'green',
  IN_PROGRESS: 'cyan',
  PENDING: 'yellow',
  CANCELLED: 'red',
};

const statusLabels = {
  COMPLETED: 'Concluído',
  IN_PROGRESS: 'Em Andamento',
  PENDING: 'Pendente',
  CANCELLED: 'Cancelado',
};

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, complianceRes] = await Promise.all([
        dashboardApi.overview(),
        dashboardApi.complianceHistory(14),
      ]);
      setOverview(overviewRes.data.data);
      setCompliance(complianceRes.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <span>Carregando dashboard...</span>
      </div>
    );
  }

  const summary = overview?.summary || {};
  const recent = overview?.recentExecutions || [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral da performance operacional</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon purple"><HiOutlineViewGrid /></div>
          <div className="kpi-value">{summary.totalExecutions || 0}</div>
          <div className="kpi-label">Total de Execuções</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green"><HiOutlineCheckCircle /></div>
          <div className="kpi-value">{summary.completedExecutions || 0}</div>
          <div className="kpi-label">Concluídas</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon cyan"><HiOutlineChartBar /></div>
          <div className="kpi-value">{summary.avgCompliance || '0%'}</div>
          <div className="kpi-label">Conformidade Média</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon yellow"><HiOutlineTrendingUp /></div>
          <div className="kpi-value">{summary.completionRate || '0%'}</div>
          <div className="kpi-label">Taxa de Conclusão</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red"><HiOutlineBell /></div>
          <div className="kpi-value">{summary.openAlerts || 0}</div>
          <div className="kpi-label">Alertas Abertos</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Compliance chart */}
        <div className="dashboard-chart-card">
          <h3><HiOutlineChartBar /> Conformidade (14 dias)</h3>
          {compliance.length > 0 ? (
            <div className="chart-bars">
              {compliance.map((item, i) => {
                const val = parseFloat(item.avgCompliance) || 0;
                const date = new Date(item.date);
                return (
                  <div className="chart-bar-wrapper" key={i}>
                    <div className="chart-bar-value">{val.toFixed(0)}%</div>
                    <div className="chart-bar" style={{ height: `${Math.max(val * 1.4, 4)}px` }} />
                    <div className="chart-bar-label">{date.getDate()}/{date.getMonth() + 1}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>Sem dados de conformidade ainda</p>
            </div>
          )}
        </div>

        {/* Recent executions */}
        <div className="dashboard-chart-card">
          <h3><HiOutlineClock /> Últimas Execuções</h3>
          {recent.length > 0 ? (
            <div className="recent-list">
              {recent.map(exec => (
                <div className="recent-item" key={exec.id}>
                  <div className={`recent-item-icon kpi-icon ${statusColors[exec.status] || 'gray'}`}>
                    <HiOutlineCheckCircle />
                  </div>
                  <div className="recent-item-info">
                    <div className="recent-item-title">{exec.checklist?.name || 'Checklist'}</div>
                    <div className="recent-item-meta">
                      <span>{exec.user?.name}</span>
                      <span>•</span>
                      <span>{new Date(exec.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <span className={`badge badge-${statusColors[exec.status] || 'gray'}`}>
                    {statusLabels[exec.status] || exec.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Nenhuma execução registrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
