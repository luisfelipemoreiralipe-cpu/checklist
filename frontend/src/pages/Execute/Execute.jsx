import { useState, useEffect } from 'react';
import { checklistApi, executionApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { HiOutlinePlay, HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheck } from 'react-icons/hi';
import './Execute.css';

const categoryLabels = {
  KITCHEN: '🍳 Cozinha', STORAGE: '📦 Estoque', CLEANING: '🧹 Limpeza',
  SAFETY: '🛡️ Segurança', SERVICE: '🍽️ Serviço', OPENING: '🌅 Abertura',
  CLOSING: '🌙 Fechamento', GENERAL: '📋 Geral',
};

const shiftLabels = { MORNING: '🌅 Manhã', AFTERNOON: '☀️ Tarde', NIGHT: '🌙 Noite' };

export default function Execute() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('select'); // select | shift | executing | complete
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [shift, setShift] = useState(null);
  const [execution, setExecution] = useState(null);
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState({});
  const [result, setResult] = useState(null);
  const toast = useToast();

  useEffect(() => { loadChecklists(); }, []);

  const loadChecklists = async () => {
    try {
      const { data } = await checklistApi.list({ active: 'true', limit: 50 });
      setChecklists(data.data || []);
    } catch { toast.error('Erro ao carregar checklists'); }
    finally { setLoading(false); }
  };

  const selectChecklist = async (cl) => {
    try {
      const { data } = await checklistApi.getById(cl.id);
      setSelectedChecklist(data.data);
      setItems((data.data.items || []).sort((a, b) => a.order - b.order));
      setStep('shift');
    } catch { toast.error('Erro ao carregar checklist'); }
  };

  const startExecution = async () => {
    try {
      const { data } = await executionApi.start({
        checklistId: selectedChecklist.id,
        shift: shift || undefined,
      });
      setExecution(data.data);
      setStep('executing');
      setCurrentIndex(0);
      setAnswers({});
      setComments({});
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Erro ao iniciar');
    }
  };

  const answerCurrent = async (value) => {
    const item = items[currentIndex];
    const newAnswers = { ...answers, [item.id]: value };
    setAnswers(newAnswers);

    try {
      await executionApi.answer(execution.id, {
        checklistItemId: item.id,
        value,
        comment: comments[item.id] || undefined,
      });
    } catch (err) {
      toast.error('Erro ao salvar resposta');
    }
  };

  const goNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const finishExecution = async () => {
    try {
      const { data } = await executionApi.finish(execution.id, {});
      setResult(data.data);
      setStep('complete');
      toast.success('Checklist finalizado! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Erro ao finalizar');
    }
  };

  const reset = () => {
    setStep('select');
    setSelectedChecklist(null);
    setExecution(null);
    setItems([]);
    setCurrentIndex(0);
    setAnswers({});
    setComments({});
    setResult(null);
    setShift(null);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Carregando...</span></div>;

  // Step 1: Select checklist
  if (step === 'select') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Executar Checklist</h1>
          <p>Escolha o checklist para iniciar</p>
        </div>
        <div className="execute-grid">
          {checklists.map(cl => (
            <div className="execute-card" key={cl.id} onClick={() => selectChecklist(cl)}>
              <h3>{cl.name}</h3>
              {cl.description && <p>{cl.description}</p>}
              <div className="execute-card-footer">
                <span className="badge badge-purple">{categoryLabels[cl.category]}</span>
              </div>
            </div>
          ))}
        </div>
        {checklists.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Nenhum checklist disponível</h3>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Select shift
  if (step === 'shift') {
    return (
      <div className="page">
        <div className="execution-flow">
          <button className="checklist-detail-back" onClick={reset} style={{ marginBottom: 24 }}>
            <HiOutlineArrowLeft /> Voltar
          </button>
          <div className="execution-header">
            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>{selectedChecklist.name}</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px' }}>Selecione o turno (opcional)</p>
          </div>
          <div className="shift-selector">
            {Object.entries(shiftLabels).map(([key, label]) => (
              <button key={key} className={`shift-btn ${shift === key ? 'active' : ''}`} onClick={() => setShift(shift === key ? null : key)}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button className="btn btn-primary btn-lg" onClick={startExecution}>
              <HiOutlinePlay /> Iniciar Checklist
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Executing
  if (step === 'executing') {
    const item = items[currentIndex];
    const progress = ((Object.keys(answers).length) / items.length) * 100;
    const currentAnswer = answers[item.id];
    const allAnswered = items.every(i => answers[i.id] !== undefined);

    return (
      <div className="page">
        <div className="execution-flow">
          <div className="execution-progress">
            <div className="execution-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="execution-progress-label">
            {Object.keys(answers).length} de {items.length} respondidos
          </div>

          <div className="question-card">
            <div className="question-number">Pergunta {currentIndex + 1} de {items.length}</div>
            <div className="question-title">{item.title}</div>
            {item.description && <div className="question-desc">{item.description}</div>}
            <div className="question-tags">
              {item.isCritical && <span className="badge badge-red">⚠️ Crítico</span>}
              {item.required && <span className="badge badge-yellow">Obrigatório</span>}
            </div>

            {/* Boolean */}
            {item.type === 'BOOLEAN' && (
              <div className="boolean-input">
                <button className={`boolean-btn ${currentAnswer === true ? 'selected-yes' : ''}`} onClick={() => answerCurrent(true)}>
                  ✅ Sim
                </button>
                <button className={`boolean-btn ${currentAnswer === false ? 'selected-no' : ''}`} onClick={() => answerCurrent(false)}>
                  ❌ Não
                </button>
              </div>
            )}

            {/* Number */}
            {item.type === 'NUMBER' && (
              <div className="number-input-exec">
                <input
                  type="number"
                  className="form-input"
                  value={currentAnswer ?? ''}
                  onChange={e => answerCurrent(Number(e.target.value))}
                  placeholder="0"
                  style={{ width: 140, textAlign: 'center', fontSize: 'var(--font-2xl)', fontWeight: 700 }}
                />
              </div>
            )}

            {/* Text */}
            {item.type === 'TEXT' && (
              <textarea
                className="form-textarea"
                value={currentAnswer ?? ''}
                onChange={e => answerCurrent(e.target.value)}
                placeholder="Digite sua resposta..."
                rows={3}
              />
            )}

            {/* Rating */}
            {item.type === 'RATING' && (
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`rating-star ${currentAnswer >= star ? 'active' : ''}`}
                    onClick={() => answerCurrent(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}

            {/* Photo (simplified) */}
            {item.type === 'PHOTO' && (
              <div style={{ textAlign: 'center' }}>
                <button className="btn btn-secondary" onClick={() => answerCurrent('photo_captured')}>
                  📷 Capturar Foto
                </button>
                {currentAnswer && <p style={{ color: 'var(--accent-success)', marginTop: 8, fontSize: 'var(--font-sm)' }}>✅ Foto registrada</p>}
              </div>
            )}

            {/* Comment */}
            <div className="comment-section">
              <label>Comentário (opcional)</label>
              <input
                className="form-input"
                value={comments[item.id] || ''}
                onChange={e => setComments({ ...comments, [item.id]: e.target.value })}
                placeholder="Adicione uma observação..."
              />
            </div>
          </div>

          <div className="execution-nav">
            <button className="btn btn-secondary" onClick={goPrev} disabled={currentIndex === 0}>
              <HiOutlineArrowLeft /> Anterior
            </button>

            {currentIndex < items.length - 1 ? (
              <button className="btn btn-primary" onClick={goNext}>
                Próximo <HiOutlineArrowRight />
              </button>
            ) : (
              <button className="btn btn-success btn-lg" onClick={finishExecution} disabled={!allAnswered}>
                <HiOutlineCheck /> Finalizar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Complete
  if (step === 'complete') {
    const score = result?.compliance ?? 0;
    const color = score >= 80 ? 'var(--accent-success)' : score >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)';

    return (
      <div className="page">
        <div className="execution-flow execution-complete">
          <div className="check-icon">🎉</div>
          <h2>Checklist Concluído!</h2>
          <p className="score-label">{selectedChecklist.name}</p>
          <div className="score-display" style={{ color }}>{score.toFixed(1)}%</div>
          <p className="score-label">Conformidade</p>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={reset}>
              <HiOutlinePlay /> Novo Checklist
            </button>
          </div>
        </div>
      </div>
    );
  }
}
