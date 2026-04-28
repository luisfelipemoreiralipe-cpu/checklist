import { useState, useEffect } from 'react';
import { gamificationApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { HiOutlineStar, HiOutlineTrendingUp } from 'react-icons/hi';

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [myScore, setMyScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [rankRes, scoreRes] = await Promise.all([
        gamificationApi.ranking(20),
        gamificationApi.myScore(),
      ]);
      setRanking(rankRes.data.data || []);
      setMyScore(scoreRes.data.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Carregando...</span></div>;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ranking</h1>
        <p>Gamificação e pontuação da equipe</p>
      </div>

      {/* My Score */}
      {myScore && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 32 }}>
          <div className="kpi-card">
            <div className="kpi-icon purple"><HiOutlineStar /></div>
            <div className="kpi-value">{myScore.score || 0}</div>
            <div className="kpi-label">Minha Pontuação</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon cyan"><HiOutlineTrendingUp /></div>
            <div className="kpi-value">Nível {myScore.level || 1}</div>
            <div className="kpi-label">Meu Nível</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green"><span style={{ fontSize: 20 }}>👤</span></div>
            <div className="kpi-value" style={{ fontSize: 'var(--font-xl)' }}>{user?.name}</div>
            <div className="kpi-label">Jogador</div>
          </div>
        </div>
      )}

      {/* Ranking Table */}
      {ranking.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Jogador</th>
                <th>Pontuação</th>
                <th>Nível</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, i) => (
                <tr key={entry.userId || i} style={entry.userId === user?.id ? { background: 'rgba(99, 102, 241, 0.06)' } : {}}>
                  <td style={{ fontSize: i < 3 ? '20px' : 'var(--font-sm)', fontWeight: 700 }}>
                    {i < 3 ? medals[i] : i + 1}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {entry.user?.name || `Usuário ${i + 1}`}
                    {entry.userId === user?.id && <span className="badge badge-purple" style={{ marginLeft: 8 }}>Você</span>}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-primary-hover)' }}>{entry.score || 0}</td>
                  <td><span className="badge badge-cyan">Nível {entry.level || 1}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>Ranking em breve</h3>
          <p>Complete checklists para acumular pontos</p>
        </div>
      )}
    </div>
  );
}
