import { Link } from 'react-router-dom';
import './Landing.css';

const features = [
  {
    icon: '✅',
    title: 'Checklists Digitais',
    desc: 'Substitua papéis e planilhas por checklists digitais organizados por turno, setor e frequência.',
  },
  {
    icon: '📊',
    title: 'Dashboard em Tempo Real',
    desc: 'Acompanhe a conformidade da operação ao vivo. Identifique falhas antes que virem problema.',
  },
  {
    icon: '🏆',
    title: 'Gamificação da Equipe',
    desc: 'Ranking de performance motiva a equipe. Quem mais cumpre os padrões, mais pontos acumula.',
  },
  {
    icon: '🚨',
    title: 'Alertas Automáticos',
    desc: 'Itens críticos falhados geram alertas instantâneos para o gerente. Nenhuma falha passa despercebida.',
  },
  {
    icon: '📱',
    title: 'Funciona no Celular',
    desc: 'Interface responsiva. Sua equipe usa no celular ou tablet na cozinha, estoque ou salão.',
  },
  {
    icon: '👥',
    title: 'Multi-usuário com Perfis',
    desc: 'Perfis de Colaborador, Gerente e Admin. Cada um vê exatamente o que precisa.',
  },
  {
    icon: '📋',
    title: 'Histórico Completo',
    desc: 'Acesse o histórico de todas as execuções. Prove conformidade para auditorias e inspeções.',
  },
  {
    icon: '⚙️',
    title: 'Regras Inteligentes',
    desc: 'Configure regras: se temperatura estiver abaixo do limite, o sistema já gera o alerta automaticamente.',
  },
  {
    icon: '🔒',
    title: 'Dados Seguros',
    desc: 'Cada empresa tem seu ambiente isolado. Seus dados são seus e só você acessa.',
  },
];

const testimonials = [
  {
    stars: '★★★★★',
    text: 'Antes do CheckOps, nossa equipe esquecia itens toda semana. Hoje temos 97% de conformidade e o gerente não precisa mais ficar cobrando todo mundo.',
    name: 'Carlos Mendes',
    role: 'Proprietário — Bistrô do Chef',
    initials: 'CM',
  },
  {
    stars: '★★★★★',
    text: 'A gamificação foi a surpresa positiva. Minha equipe virou uma competição saudável de quem tem mais pontos. A operação nunca foi tão organizada.',
    name: 'Ana Lima',
    role: 'Gerente — Hamburgueria Central',
    initials: 'AL',
  },
  {
    stars: '★★★★★',
    text: 'Na última visita da vigilância sanitária, mostrei o histórico digital de 3 meses. Aprovamos sem nenhuma pendência. Valeu cada centavo.',
    name: 'Roberto Silva',
    role: 'Administrador — Rede Sabor & Cia',
    initials: 'RS',
  },
];

const pricingFeatures = [
  'Usuários ilimitados na sua equipe',
  'Checklists ilimitados',
  'Dashboard e relatórios completos',
  'Gamificação e ranking de performance',
  'Alertas automáticos para gerentes',
  'Histórico de até 12 meses',
  'Acesso no celular e tablet',
  'Suporte por WhatsApp',
];

export default function Landing() {
  return (
    <div className="lp">

      {/* ── NAV ──────────────────────────────────── */}
      <nav className="lp-nav">
        <a href="#" className="lp-nav-logo">Check<span>Ops</span></a>
        <ul className="lp-nav-links">
          <li><a href="#como-funciona">Como funciona</a></li>
          <li><a href="#funcionalidades">Funcionalidades</a></li>
          <li><a href="#preco">Preços</a></li>
        </ul>
        <div className="lp-nav-cta">
          <Link to="/login" className="lp-btn-outline">Entrar</Link>
          <Link to="/signup" className="lp-btn-primary">Começar grátis →</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-glow" />

        <div className="lp-hero-badge">
          🚀 Mais de 120 restaurantes já usam
        </div>

        <h1>
          Chega de operação<br />
          <span>bagunçada e checklists no papel</span>
        </h1>

        <p>
          O CheckOps digitaliza os processos do seu restaurante, motiva sua equipe
          e garante que nenhuma falha passe despercebida — tudo por menos de R$1 por dia.
        </p>

        <div className="lp-hero-actions">
          <Link to="/signup" className="lp-btn-primary large">
            Criar minha conta grátis →
          </Link>
          <a href="#como-funciona" className="lp-btn-outline" style={{ padding: '16px 28px' }}>
            Ver como funciona
          </a>
        </div>

        <div className="lp-hero-proof">
          <span>✅ <strong>Sem cartão</strong> de crédito</span>
          <div className="lp-hero-proof-divider" />
          <span>✅ Configurado em <strong>5 minutos</strong></span>
          <div className="lp-hero-proof-divider" />
          <span>✅ Cancele <strong>quando quiser</strong></span>
        </div>
      </section>

      {/* ── PROBLEMA ─────────────────────────────── */}
      <section className="lp-problem">
        <div className="lp-problem-inner">
          <div className="lp-section-header">
            <span className="lp-section-label">O problema</span>
            <h2 className="lp-section-title">
              Reconhece essa realidade?
            </h2>
            <p className="lp-section-sub">
              A maioria dos restaurantes ainda depende de papéis, memória e "achismos" para
              garantir a qualidade. O resultado é sempre o mesmo.
            </p>
          </div>

          <div className="lp-problem-grid">
            <div className="lp-problem-card">
              <div className="lp-problem-icon">😤</div>
              <h3>Equipe esquece etapas críticas</h3>
              <p>Sem um processo definido, cada funcionário faz do seu jeito. A qualidade fica inconsistente e os problemas aparecem na hora errada.</p>
            </div>
            <div className="lp-problem-card">
              <div className="lp-problem-icon">📋</div>
              <h3>Checklists de papel somem</h3>
              <p>Folhas molhadas, amassadas ou simplesmente "preenchidas" sem ninguém ter feito nada. Sem rastreabilidade, sem prova, sem controle.</p>
            </div>
            <div className="lp-problem-card">
              <div className="lp-problem-icon">😰</div>
              <h3>Vigilância sanitária de surpresa</h3>
              <p>Quando o fiscal chega, você não tem como provar que a equipe seguiu os protocolos. Multas e fechamentos custam muito mais que um sistema.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────── */}
      <section id="como-funciona">
        <div className="lp-section">
          <div className="lp-section-header">
            <span className="lp-section-label">Como funciona</span>
            <h2 className="lp-section-title">Simples de usar,<br />poderoso no resultado</h2>
            <p className="lp-section-sub">
              Do cadastro ao primeiro checklist respondido em menos de 10 minutos.
            </p>
          </div>

          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-number">1</div>
              <h3>Crie sua conta</h3>
              <p>Cadastre sua empresa e sua conta de administrador em menos de 2 minutos. Nenhum dado de cartão necessário.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step-number">2</div>
              <h3>Monte seus checklists</h3>
              <p>Crie checklists personalizados para abertura, fechamento, limpeza e segurança alimentar. Defina pesos e itens críticos.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step-number">3</div>
              <h3>Equipe executa, você controla</h3>
              <p>A equipe responde pelo celular. Você acompanha em tempo real, recebe alertas de falhas e vê o ranking de desempenho.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section id="funcionalidades" className="lp-features-bg">
        <div className="lp-section">
          <div className="lp-section-header">
            <span className="lp-section-label">Funcionalidades</span>
            <h2 className="lp-section-title">Tudo que sua operação precisa,<br />em um só lugar</h2>
            <p className="lp-section-sub">
              Não é um checklist genérico. É uma plataforma completa de gestão operacional para restaurantes.
            </p>
          </div>

          <div className="lp-features-grid">
            {features.map((f) => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ──────────────────────────── */}
      <section>
        <div className="lp-section">
          <div className="lp-section-header">
            <span className="lp-section-label">Depoimentos</span>
            <h2 className="lp-section-title">Quem já usa, não volta<br />para o papel</h2>
          </div>

          <div className="lp-testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="lp-testimonial">
                <div className="lp-testimonial-stars">{t.stars}</div>
                <p>"{t.text}"</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="lp-testimonial-name">{t.name}</div>
                    <div className="lp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇO ────────────────────────────────── */}
      <section id="preco" className="lp-pricing-bg">
        <div className="lp-section" style={{ textAlign: 'center' }}>
          <span className="lp-section-label">Preço</span>
          <h2 className="lp-section-title">Simples, justo e sem surpresa</h2>
          <p className="lp-section-sub" style={{ margin: '0 auto' }}>
            Um único plano com tudo incluso. Sem planos caros, sem funcionalidades escondidas.
          </p>

          <div className="lp-pricing-card">
            <div className="lp-pricing-badge">🔥 Mais popular</div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Plano Operacional</h3>

            <div className="lp-pricing-price">
              <span className="lp-pricing-currency">R$</span>
              <span className="lp-pricing-amount">29</span>
              <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>,90</span>
              <span className="lp-pricing-period">/mês</span>
            </div>

            <p className="lp-pricing-desc">
              Menos de R$1 por dia para ter a operação do seu restaurante sob controle total.
            </p>

            <ul className="lp-pricing-features">
              {pricingFeatures.map((f) => (
                <li key={f}>
                  <span>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link to="/signup" className="lp-btn-primary large" style={{ width: '100%', justifyContent: 'center' }}>
              Começar agora →
            </Link>

            <p className="lp-pricing-guarantee">
              🔒 7 dias de teste grátis. Cancele quando quiser, sem multas.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────── */}
      <section className="lp-cta-section">
        <h2>
          Pronto para parar de<br />
          <span style={{ color: '#60a5fa' }}>apagar incêndios?</span>
        </h2>
        <p>
          Junte-se a mais de 120 restaurantes que já trocaram o papel pelo digital.<br />
          Comece hoje. Configure em 5 minutos.
        </p>
        <Link to="/signup" className="lp-btn-primary large">
          Criar minha conta grátis →
        </Link>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-copy">
          © 2026 CheckOps. Todos os direitos reservados.
        </div>
        <div className="lp-footer-links">
          <a href="#">Termos de uso</a>
          <a href="#">Privacidade</a>
          <a href="/login">Entrar</a>
          <a href="/signup">Começar grátis</a>
        </div>
      </footer>
    </div>
  );
}
