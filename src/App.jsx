import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Target, Calendar, Edit3, Plus, X, Check,
  AlertCircle, ChevronRight, Clock, Award, MessageSquare,
  Shield, Eye, Search, BarChart3, UserCheck, GraduationCap,
  Activity, LogOut, Lock, Trash2, UserPlus, Settings,
} from 'lucide-react';
import { getSession, loginWithPin, logout, createUser } from './lib/auth.js';
import {
  subscribeSkills, subscribeAgents, subscribeTimeline, subscribeUsers,
  toggleAgentSkill, updateSkillTarget, createAgent, updateAgent, deleteAgent,
  addTimelineEvent, deleteTimelineEvent, deleteUser,
} from './lib/data.js';

// ============ POWER BRAND ============
const BRAND = {
  orange: '#f96700',
  grey: '#252525',
  black: '#000000',
  white: '#ffffff',
  yellow: '#ffe100',
  red: '#ff3927',
};

// ============ HELPERS ============
const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('da-DK', { day: '2-digit', month: 'short', year: 'numeric' });
};

const timelineIcon = (type) => {
  switch(type) {
    case 'onboarding': return UserCheck;
    case 'skill': return Award;
    case 'training': return GraduationCap;
    case 'comment': return MessageSquare;
    default: return Activity;
  }
};

const timelineColor = (type) => {
  switch(type) {
    case 'onboarding': return BRAND.yellow;
    case 'skill': return BRAND.orange;
    case 'training': return BRAND.red;
    case 'comment': return BRAND.grey;
    default: return BRAND.grey;
  }
};

// ============ ROOT ============
export default function App() {
  const [session, setSession] = useState(getSession());

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }
  return <Dashboard session={session} onLogout={() => { logout(); setSession(null); }} />;
}

// ============ LOGIN ============
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await loginWithPin(username, pin);
      onLogin(session);
    } catch (err) {
      setError(err.message || 'Login fejlede');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: BRAND.black, color: BRAND.white,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Archivo', Arial, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;900&display=swap');
        .display-font { font-family: 'Archivo Black', Arial, sans-serif; letter-spacing: -0.02em; text-transform: uppercase; }
      `}</style>
      <div style={{
        width: '400px', background: BRAND.grey, padding: '40px',
        border: `2px solid ${BRAND.orange}`, maxWidth: '90%',
      }}>
        <div style={{ background: BRAND.orange, padding: '6px 12px', fontWeight: 900, fontSize: '12px', display: 'inline-block' }} className="display-font">
          POWER
        </div>
        <h1 className="display-font" style={{ fontSize: '32px', margin: '20px 0 4px', lineHeight: 1 }}>
          Control <span style={{ color: BRAND.orange }}>Tower</span>
        </h1>
        <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Learning Operations · Login
        </p>

        <form onSubmit={handleLogin} style={{ marginTop: '30px' }}>
          <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
            Username
          </label>
          <input
            type="text" value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="fx. mjensen"
            autoFocus required
            style={{
              width: '100%', padding: '10px 12px', background: BRAND.black,
              border: `1px solid #444`, color: BRAND.white, fontSize: '14px',
              fontFamily: 'inherit', marginBottom: '16px',
            }}
          />

          <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
            6-cifret PIN
          </label>
          <input
            type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••" maxLength={6} pattern="\d{6}" required inputMode="numeric"
            style={{
              width: '100%', padding: '10px 12px', background: BRAND.black,
              border: `1px solid #444`, color: BRAND.white, fontSize: '20px',
              fontFamily: 'monospace', letterSpacing: '0.5em', textAlign: 'center',
            }}
          />

          {error && (
            <div style={{
              background: BRAND.red, color: BRAND.white, padding: '10px 12px',
              marginTop: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit" disabled={loading || pin.length !== 6}
            style={{
              width: '100%', padding: '12px', marginTop: '20px',
              background: loading || pin.length !== 6 ? '#555' : BRAND.orange,
              color: BRAND.black, border: 'none', cursor: loading ? 'wait' : 'pointer',
              fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '13px',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Logger ind...' : 'Log ind'}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '12px', background: BRAND.black, fontSize: '11px', color: '#999', borderLeft: `3px solid ${BRAND.yellow}` }}>
          <Lock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Kontakt din admin hvis du ikke har en PIN endnu.
        </div>
      </div>
    </div>
  );
}

// ============ DASHBOARD ============
function Dashboard({ session, onLogout }) {
  const [skills, setSkills] = useState([]);
  const [agents, setAgents] = useState([]);
  const [view, setView] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState(null); // { type: 'comment'|'agent'|'user', ... }
  const [loading, setLoading] = useState(true);

  const isAdmin = session.role === 'admin';

  useEffect(() => {
    const unsubSkills = subscribeSkills(setSkills);
    const unsubAgents = subscribeAgents((list) => {
      setAgents(list);
      setLoading(false);
    });
    return () => { unsubSkills(); unsubAgents(); };
  }, []);

  const skillStats = useMemo(() => {
    return skills.map(skill => {
      const agentsWithSkill = agents.filter(a => (a.skills || []).includes(skill.id));
      const actualPct = agents.length > 0 ? (agentsWithSkill.length / agents.length) * 100 : 0;
      const gap = skill.targetVolumePct - actualPct;
      return {
        ...skill,
        agentCount: agentsWithSkill.length,
        actualPct,
        gap,
        agents: agentsWithSkill,
      };
    });
  }, [skills, agents]);

  const filteredAgents = useMemo(() => {
    return agents.filter(a => {
      if (marketFilter !== 'ALL' && a.market !== marketFilter) return false;
      if (searchTerm && !a.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [agents, marketFilter, searchTerm]);

  const handleToggleSkill = async (agentId, skillId) => {
    if (!isAdmin) return;
    const agent = agents.find(a => a.id === agentId);
    const skill = skills.find(s => s.id === skillId);
    if (!agent || !skill) return;
    const currentlyHas = (agent.skills || []).includes(skillId);
    await toggleAgentSkill(agentId, skillId, skill.name, !currentlyHas, session.displayName);
  };

  if (loading) {
    return (
      <div style={{ background: BRAND.black, color: BRAND.white, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Loading</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: BRAND.black, color: BRAND.white,
      fontFamily: "'Archivo', Arial, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;900&display=swap');
        * { box-sizing: border-box; }
        .display-font { font-family: 'Archivo Black', Arial, sans-serif; letter-spacing: -0.02em; text-transform: uppercase; }
        .scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
        .scrollbar::-webkit-scrollbar-thumb { background: ${BRAND.orange}; }
        .hover-lift { transition: all 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); }
      `}</style>

      <header style={{
        borderBottom: `3px solid ${BRAND.orange}`,
        background: `linear-gradient(90deg, ${BRAND.black} 0%, ${BRAND.grey} 100%)`,
        padding: '20px 32px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: BRAND.orange, padding: '8px 14px', fontWeight: 900, fontSize: '14px' }} className="display-font">
              POWER
            </div>
            <div>
              <h1 className="display-font" style={{ margin: 0, fontSize: '28px', letterSpacing: '-0.03em' }}>
                Control <span style={{ color: BRAND.orange }}>Tower</span>
              </h1>
              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>
                Learning Operations · Customer Service
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{session.displayName}</div>
              <div style={{ fontSize: '10px', color: isAdmin ? BRAND.orange : '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                {isAdmin ? <><Shield size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Admin</> : <><Eye size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Reader</>}
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'transparent', border: `1px solid #555`, color: BRAND.white,
                padding: '8px 12px', cursor: 'pointer', fontSize: '11px',
                textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <LogOut size={12} /> Log ud
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginTop: '20px', borderBottom: `1px solid ${BRAND.grey}`, overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'agent', label: 'Agent View', icon: Users },
            { id: 'skill', label: 'Skill View', icon: Target },
            { id: 'matrix', label: 'Skill Matrix', icon: Activity },
            ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Settings }] : []),
          ].map(tab => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setView(tab.id); setSelectedAgent(null); setSelectedSkill(null); }}
                style={{
                  background: 'transparent', color: active ? BRAND.orange : '#999',
                  border: 'none', borderBottom: `3px solid ${active ? BRAND.orange : 'transparent'}`,
                  padding: '12px 18px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-1px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
        {view === 'overview' && <OverviewView agents={agents} skillStats={skillStats} setView={setView} setSelectedAgent={setSelectedAgent} />}
        {view === 'agent' && !selectedAgent && (
          <AgentListView
            agents={filteredAgents} skills={skills} setSelectedAgent={setSelectedAgent}
            marketFilter={marketFilter} setMarketFilter={setMarketFilter}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            isAdmin={isAdmin} onAddAgent={() => setModal({ type: 'agent' })}
          />
        )}
        {view === 'agent' && selectedAgent && (
          <AgentDetailView
            agentId={selectedAgent} agents={agents} skills={skills} isAdmin={isAdmin}
            session={session}
            onBack={() => setSelectedAgent(null)}
            onToggleSkill={handleToggleSkill}
            onAddComment={() => setModal({ type: 'comment', agentId: selectedAgent })}
            onDeleteAgent={async () => {
              if (confirm('Slet denne agent og hele historikken?')) {
                await deleteAgent(selectedAgent);
                setSelectedAgent(null);
              }
            }}
          />
        )}
        {view === 'skill' && !selectedSkill && (
          <SkillListView skillStats={skillStats} setSelectedSkill={setSelectedSkill} />
        )}
        {view === 'skill' && selectedSkill && (
          <SkillDetailView
            skill={skillStats.find(s => s.id === selectedSkill)}
            agents={agents} isAdmin={isAdmin}
            onBack={() => setSelectedSkill(null)}
            onUpdateTarget={updateSkillTarget}
            onToggleSkill={handleToggleSkill}
          />
        )}
        {view === 'matrix' && (
          <MatrixView
            skillStats={skillStats} agents={agents} isAdmin={isAdmin}
            onUpdateTarget={updateSkillTarget}
            onToggleSkill={handleToggleSkill}
          />
        )}
        {view === 'admin' && isAdmin && <AdminView session={session} />}
      </main>

      {modal?.type === 'comment' && (
        <CommentModal
          agentId={modal.agentId} session={session}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'agent' && (
        <NewAgentModal session={session} onClose={() => setModal(null)} />
      )}

      <footer style={{
        borderTop: `1px solid ${BRAND.grey}`, padding: '20px 32px', marginTop: '60px',
        fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
      }}>
        <span>POWER · Control Tower v1.0 · Learning Operations</span>
        <span>{isAdmin ? 'Admin session' : 'Read-only session'}</span>
      </footer>
    </div>
  );
}

// ============ OVERVIEW ============
function OverviewView({ agents, skillStats, setView, setSelectedAgent }) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'Active').length;
  const onboardingAgents = agents.filter(a => a.status === 'Onboarding').length;
  const criticalSkills = skillStats.filter(s => s.gap > 10).length;
  const avgSkillsPerAgent = agents.length ? (agents.reduce((sum, a) => sum + (a.skills || []).length, 0) / agents.length).toFixed(1) : 0;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
          Mission Control
        </div>
        <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
          What's going on <span style={{ color: BRAND.orange }}>everywhere</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <KPICard label="Total Agents" value={totalAgents} icon={Users} accent={BRAND.orange} />
        <KPICard label="Active" value={activeAgents} icon={Activity} accent={BRAND.yellow} />
        <KPICard label="In Onboarding" value={onboardingAgents} icon={GraduationCap} accent={BRAND.orange} />
        <KPICard label="Avg. Skills/Agent" value={avgSkillsPerAgent} icon={Award} accent={BRAND.yellow} />
        <KPICard label="Critical Skill Gaps" value={criticalSkills} icon={AlertCircle} accent={BRAND.red} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="display-font" style={{ margin: 0, fontSize: '18px' }}>Skill Coverage</h3>
            <button onClick={() => setView('matrix')} style={{ background: 'transparent', border: 'none', color: BRAND.orange, cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View matrix <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {skillStats.map(s => <SkillGapBar key={s.id} skill={s} />)}
          </div>
        </div>

        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="display-font" style={{ margin: 0, fontSize: '18px' }}>Agents in Training</h3>
            <button onClick={() => setView('agent')} style={{ background: 'transparent', border: 'none', color: BRAND.orange, cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agents.filter(a => a.status === 'Onboarding').map(a => (
              <div
                key={a.id}
                onClick={() => { setView('agent'); setSelectedAgent(a.id); }}
                className="hover-lift"
                style={{
                  padding: '12px', background: BRAND.black, cursor: 'pointer',
                  borderLeft: `3px solid ${BRAND.yellow}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{a.name}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>{a.market} · Started {formatDate(a.startDate)}</div>
                </div>
                <div style={{ fontSize: '11px', color: BRAND.yellow, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                  {(a.skills || []).length} skills
                </div>
              </div>
            ))}
            {agents.filter(a => a.status === 'Onboarding').length === 0 && (
              <div style={{ color: '#666', fontSize: '13px', fontStyle: 'italic' }}>Ingen agenter i onboarding lige nu</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon: Icon, accent }) {
  return (
    <div className="hover-lift" style={{ background: BRAND.grey, padding: '20px', border: `1px solid #333`, borderTop: `3px solid ${accent}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
          <div className="display-font" style={{ fontSize: '36px', marginTop: '4px', lineHeight: 1, color: accent }}>{value}</div>
        </div>
        <Icon size={20} color={accent} />
      </div>
    </div>
  );
}

function SkillGapBar({ skill }) {
  const target = skill.targetVolumePct;
  const actual = skill.actualPct;
  const max = Math.max(target, actual, 100);
  const status = skill.gap > 10 ? 'critical' : skill.gap > 0 ? 'warning' : 'ok';
  const statusColor = status === 'critical' ? BRAND.red : status === 'warning' ? BRAND.yellow : BRAND.orange;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
        <span style={{ fontWeight: 700 }}>{skill.name}</span>
        <span style={{ color: '#999' }}>
          <span style={{ color: BRAND.white }}>{actual.toFixed(0)}%</span> of <span style={{ color: statusColor }}>{target}%</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: '8px', background: '#1a1a1a' }}>
        <div style={{ position: 'absolute', left: `${(target / max) * 100}%`, top: -2, bottom: -2, width: '2px', background: statusColor, zIndex: 2 }} />
        <div style={{ height: '100%', width: `${(actual / max) * 100}%`, background: BRAND.orange }} />
      </div>
    </div>
  );
}

// ============ AGENT LIST ============
function AgentListView({ agents, skills, setSelectedAgent, marketFilter, setMarketFilter, searchTerm, setSearchTerm, isAdmin, onAddAgent }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            All Agents · {agents.length} results
          </div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
            Agent <span style={{ color: BRAND.orange }}>profiles</span>
          </h2>
        </div>
        {isAdmin && (
          <button onClick={onAddAgent} style={{
            background: BRAND.orange, color: BRAND.black, border: 'none',
            padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <UserPlus size={14} /> Ny agent
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            placeholder="Søg agent..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px', background: BRAND.grey,
              border: `1px solid #333`, color: BRAND.white, fontFamily: 'inherit', fontSize: '13px',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['ALL', 'DK', 'NO', 'SE', 'FI'].map(m => (
            <button key={m} onClick={() => setMarketFilter(m)} style={{
              background: marketFilter === m ? BRAND.orange : BRAND.grey,
              color: marketFilter === m ? BRAND.black : BRAND.white,
              border: `1px solid ${marketFilter === m ? BRAND.orange : '#333'}`,
              padding: '10px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase',
            }}>{m}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {agents.map(a => <AgentCard key={a.id} agent={a} skills={skills} onClick={() => setSelectedAgent(a.id)} />)}
      </div>
      {agents.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
          Ingen agenter matchede filtreringen.
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent, skills, onClick }) {
  const agentSkills = skills.filter(s => (agent.skills || []).includes(s.id));
  const initials = agent.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div onClick={onClick} className="hover-lift" style={{
      background: BRAND.grey, border: `1px solid #333`, padding: '20px',
      cursor: 'pointer', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '16px', right: '16px',
        fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
        padding: '3px 8px',
        background: agent.status === 'Onboarding' ? BRAND.yellow : BRAND.orange,
        color: BRAND.black,
      }}>{agent.status}</div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px', background: BRAND.orange, color: BRAND.black,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '18px',
        }} className="display-font">{initials}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>{agent.name}</div>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {agent.market} · {formatDate(agent.startDate)}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
        Skills · {agentSkills.length}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {agentSkills.map(s => (
          <span key={s.id} style={{
            fontSize: '10px', padding: '3px 8px', background: BRAND.black, color: BRAND.orange,
            border: `1px solid ${BRAND.orange}`, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700,
          }}>{s.name}</span>
        ))}
        {agentSkills.length === 0 && (
          <span style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>Ingen skills endnu</span>
        )}
      </div>
    </div>
  );
}

// ============ AGENT DETAIL ============
function AgentDetailView({ agentId, agents, skills, isAdmin, session, onBack, onToggleSkill, onAddComment, onDeleteAgent }) {
  const [timeline, setTimeline] = useState([]);
  const agent = agents.find(a => a.id === agentId);

  useEffect(() => {
    if (!agentId) return;
    return subscribeTimeline(agentId, setTimeline);
  }, [agentId]);

  if (!agent) return null;
  const initials = agent.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange,
          padding: '6px 14px', cursor: 'pointer',
          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
        }}>← Tilbage til agenter</button>
        {isAdmin && (
          <button onClick={onDeleteAgent} style={{
            background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red,
            padding: '6px 14px', cursor: 'pointer',
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Trash2 size={12} /> Slet agent
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{
          width: '80px', height: '80px', background: BRAND.orange, color: BRAND.black,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
        }} className="display-font">{initials}</div>
        <div>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            {agent.market} · {agent.status}
          </div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '4px 0 0', lineHeight: 1 }}>{agent.name}</h2>
          <div style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
            Startet {formatDate(agent.startDate)} · {(agent.skills || []).length} skills · {timeline.length} events
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="display-font" style={{ margin: 0, fontSize: '18px' }}>Assigned Skills</h3>
            {isAdmin && (
              <div style={{ fontSize: '10px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Edit3 size={12} /> Klik for at toggle
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {skills.map(s => {
              const assigned = (agent.skills || []).includes(s.id);
              return (
                <div key={s.id} onClick={() => isAdmin && onToggleSkill(agent.id, s.id)}
                  className={isAdmin ? 'hover-lift' : ''}
                  style={{
                    padding: '12px 14px',
                    background: assigned ? BRAND.black : '#1a1a1a',
                    borderLeft: `4px solid ${assigned ? BRAND.orange : '#333'}`,
                    cursor: isAdmin ? 'pointer' : 'default',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    opacity: assigned ? 1 : 0.6,
                  }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{s.description}</div>
                  </div>
                  {assigned ? <Check size={18} color={BRAND.orange} /> : <Plus size={18} color="#555" />}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="display-font" style={{ margin: 0, fontSize: '18px' }}>Development Timeline</h3>
            {isAdmin && (
              <button onClick={onAddComment} style={{
                background: BRAND.orange, color: BRAND.black, border: 'none',
                padding: '6px 12px', cursor: 'pointer',
                fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <Plus size={12} /> Add note
              </button>
            )}
          </div>
          <div className="scrollbar" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
            <div style={{ position: 'relative', paddingLeft: '28px' }}>
              <div style={{ position: 'absolute', left: '10px', top: 0, bottom: 0, width: '2px', background: `linear-gradient(to bottom, ${BRAND.orange}, transparent)` }} />
              {timeline.map((event) => {
                const Icon = timelineIcon(event.type);
                const color = timelineColor(event.type);
                return (
                  <div key={event.id} style={{ position: 'relative', marginBottom: '20px' }}>
                    <div style={{
                      position: 'absolute', left: '-28px', top: '2px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${BRAND.black}`,
                    }}>
                      <Icon size={11} color={BRAND.black} />
                    </div>
                    <div style={{ background: BRAND.black, padding: '12px 14px', borderLeft: `3px solid ${color}`, position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{event.title}</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                            {formatDate(event.date)}
                          </div>
                          {isAdmin && (
                            <button onClick={() => deleteTimelineEvent(agent.id, event.id)} style={{
                              background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '2px',
                            }}>
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      {event.note && (
                        <div style={{ fontSize: '12px', color: '#bbb', marginTop: '6px', fontStyle: 'italic' }}>
                          "{event.note}"
                        </div>
                      )}
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color, marginTop: '6px', fontWeight: 700 }}>
                        {event.type}
                      </div>
                    </div>
                  </div>
                );
              })}
              {timeline.length === 0 && (
                <div style={{ color: '#666', fontStyle: 'italic', fontSize: '13px' }}>Ingen events endnu</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ SKILL LIST ============
function SkillListView({ skillStats, setSelectedSkill }) {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
          All Skills · {skillStats.length} paths
        </div>
        <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
          Skill <span style={{ color: BRAND.orange }}>paths</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {skillStats.map(s => {
          const status = s.gap > 10 ? 'critical' : s.gap > 0 ? 'warning' : 'ok';
          const statusColor = status === 'critical' ? BRAND.red : status === 'warning' ? BRAND.yellow : BRAND.orange;
          const statusLabel = status === 'critical' ? 'Under-covered' : status === 'warning' ? 'Below target' : 'On target';
          return (
            <div key={s.id} onClick={() => setSelectedSkill(s.id)} className="hover-lift" style={{
              background: BRAND.grey, border: `1px solid #333`, padding: '20px',
              cursor: 'pointer', borderTop: `3px solid ${statusColor}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>{s.name}</h3>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, padding: '3px 8px', background: statusColor, color: BRAND.black }}>{statusLabel}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>{s.description}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target</div>
                  <div className="display-font" style={{ fontSize: '24px', color: statusColor }}>{s.targetVolumePct}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actual</div>
                  <div className="display-font" style={{ fontSize: '24px', color: BRAND.white }}>{s.actualPct.toFixed(0)}%</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={12} /> {s.agentCount} agents certified
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ SKILL DETAIL ============
function SkillDetailView({ skill, agents, isAdmin, onBack, onUpdateTarget, onToggleSkill }) {
  const [editTarget, setEditTarget] = useState(false);
  const [targetValue, setTargetValue] = useState(skill?.targetVolumePct || 0);

  if (!skill) return null;
  const agentsWith = agents.filter(a => (a.skills || []).includes(skill.id));
  const agentsWithout = agents.filter(a => !(a.skills || []).includes(skill.id));

  const saveTarget = async () => {
    await onUpdateTarget(skill.id, parseInt(targetValue) || 0);
    setEditTarget(false);
  };

  return (
    <div>
      <button onClick={onBack} style={{
        background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange,
        padding: '6px 14px', cursor: 'pointer', marginBottom: '20px',
        fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
      }}>← Tilbage til skills</button>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Skill Path</div>
        <h2 className="display-font" style={{ fontSize: '48px', margin: '4px 0 0', lineHeight: 1 }}>{skill.name}</h2>
        <div style={{ fontSize: '14px', color: '#bbb', marginTop: '8px' }}>{skill.description}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: BRAND.grey, padding: '20px', border: `1px solid #333`, borderTop: `3px solid ${BRAND.orange}` }}>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Volume %</div>
          {editTarget && isAdmin ? (
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
              <input type="number" min="0" max="100" value={targetValue} onChange={(e) => setTargetValue(e.target.value)}
                style={{ width: '80px', padding: '6px 8px', background: BRAND.black, border: `1px solid ${BRAND.orange}`, color: BRAND.white, fontSize: '20px', fontFamily: 'inherit', fontWeight: 700 }} />
              <button onClick={saveTarget} style={{ background: BRAND.orange, border: 'none', color: BRAND.black, padding: '6px 10px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Save</button>
              <button onClick={() => setEditTarget(false)} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '6px 10px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <div className="display-font" style={{ fontSize: '40px', color: BRAND.orange, lineHeight: 1 }}>{skill.targetVolumePct}%</div>
              {isAdmin && (
                <button onClick={() => { setTargetValue(skill.targetVolumePct); setEditTarget(true); }} style={{
                  background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange,
                  padding: '4px 8px', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}><Edit3 size={10} /> Edit</button>
              )}
            </div>
          )}
        </div>
        <div style={{ background: BRAND.grey, padding: '20px', border: `1px solid #333`, borderTop: `3px solid ${BRAND.yellow}` }}>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actual Coverage</div>
          <div className="display-font" style={{ fontSize: '40px', color: BRAND.yellow, lineHeight: 1, marginTop: '4px' }}>{skill.actualPct.toFixed(0)}%</div>
        </div>
        <div style={{ background: BRAND.grey, padding: '20px', border: `1px solid #333`, borderTop: `3px solid ${skill.gap > 0 ? BRAND.red : BRAND.orange}` }}>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gap</div>
          <div className="display-font" style={{ fontSize: '40px', color: skill.gap > 0 ? BRAND.red : BRAND.orange, lineHeight: 1, marginTop: '4px' }}>
            {skill.gap > 0 ? '-' : '+'}{Math.abs(skill.gap).toFixed(0)}%
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '18px' }}>
            Certified · <span style={{ color: BRAND.orange }}>{agentsWith.length}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {agentsWith.map(a => (
              <div key={a.id} style={{ padding: '10px 12px', background: BRAND.black, borderLeft: `3px solid ${BRAND.orange}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{a.name}</div>
                  <div style={{ fontSize: '10px', color: '#999' }}>{a.market} · {a.status}</div>
                </div>
                {isAdmin && (
                  <button onClick={() => onToggleSkill(a.id, skill.id)} style={{
                    background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red,
                    padding: '4px 8px', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
                  }}>Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '18px' }}>
            Not yet · <span style={{ color: BRAND.yellow }}>{agentsWithout.length}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {agentsWithout.map(a => (
              <div key={a.id} style={{ padding: '10px 12px', background: BRAND.black, borderLeft: `3px solid #444`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.75 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{a.name}</div>
                  <div style={{ fontSize: '10px', color: '#999' }}>{a.market} · {a.status}</div>
                </div>
                {isAdmin && (
                  <button onClick={() => onToggleSkill(a.id, skill.id)} style={{
                    background: BRAND.orange, border: 'none', color: BRAND.black,
                    padding: '4px 8px', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
                  }}>+ Assign</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MATRIX ============
function MatrixView({ skillStats, agents, isAdmin, onUpdateTarget, onToggleSkill }) {
  const [editingSkill, setEditingSkill] = useState(null);
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
          Skill Matrix
        </div>
        <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
          Volume targets vs. <span style={{ color: BRAND.orange }}>actual coverage</span>
        </h2>
        <div style={{ fontSize: '13px', color: '#bbb', marginTop: '8px', maxWidth: '700px' }}>
          Each skill has a target share of total volume. The matrix shows which agents are certified on which skills.
        </div>
      </div>

      <div style={{ background: BRAND.grey, padding: '20px', border: `1px solid #333`, marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 700 }}>
          Volume distribution targets
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${skillStats.length}, 1fr)`, gap: '8px', minWidth: '800px', overflowX: 'auto' }}>
          {skillStats.map(s => (
            <div key={s.id} style={{
              padding: '10px', background: BRAND.black, textAlign: 'center',
              borderTop: `3px solid ${s.gap > 10 ? BRAND.red : s.gap > 0 ? BRAND.yellow : BRAND.orange}`,
            }}>
              <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{s.name}</div>
              {editingSkill === s.id && isAdmin ? (
                <input type="number" min="0" max="100" defaultValue={s.targetVolumePct}
                  onKeyDown={(e) => { if (e.key === 'Enter') { onUpdateTarget(s.id, parseInt(e.target.value) || 0); setEditingSkill(null); } }}
                  onBlur={(e) => { onUpdateTarget(s.id, parseInt(e.target.value) || 0); setEditingSkill(null); }}
                  autoFocus
                  style={{ width: '50px', background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, textAlign: 'center', fontSize: '18px', fontWeight: 700, fontFamily: 'inherit', padding: '2px' }}
                />
              ) : (
                <div onClick={() => isAdmin && setEditingSkill(s.id)} style={{ cursor: isAdmin ? 'pointer' : 'default' }} className="display-font">
                  <div style={{ fontSize: '22px', color: BRAND.orange, lineHeight: 1 }}>{s.targetVolumePct}%</div>
                  <div style={{ fontSize: '10px', color: '#999', fontFamily: 'inherit', marginTop: '2px', textTransform: 'none', letterSpacing: 0 }}>
                    actual {s.actualPct.toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <div style={{ fontSize: '10px', color: BRAND.orange, marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            <Edit3 size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Klik et target for at redigere · Enter for at gemme
          </div>
        )}
      </div>

      <div className="scrollbar" style={{ overflowX: 'auto', background: BRAND.grey, border: `1px solid #333` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: BRAND.black }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', borderBottom: `2px solid ${BRAND.orange}`, position: 'sticky', left: 0, background: BRAND.black }}>Agent</th>
              <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', borderBottom: `2px solid ${BRAND.orange}` }}>Market</th>
              {skillStats.map(s => (
                <th key={s.id} style={{ padding: '14px 8px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: BRAND.orange, borderBottom: `2px solid ${BRAND.orange}` }}>{s.name}</th>
              ))}
              <th style={{ padding: '14px 10px', textAlign: 'center', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', borderBottom: `2px solid ${BRAND.orange}` }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a, idx) => {
              const isOnboarding = a.status === 'Onboarding';
              return (
                <tr key={a.id} style={{ background: idx % 2 === 0 ? '#1f1f1f' : BRAND.grey }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px', borderBottom: `1px solid #333`, position: 'sticky', left: 0, background: idx % 2 === 0 ? '#1f1f1f' : BRAND.grey }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {a.name}
                      {isOnboarding && <span style={{ fontSize: '9px', padding: '2px 6px', background: BRAND.yellow, color: BRAND.black, textTransform: 'uppercase', fontWeight: 700 }}>NEW</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '11px', color: '#999', borderBottom: `1px solid #333` }}>{a.market}</td>
                  {skillStats.map(s => {
                    const has = (a.skills || []).includes(s.id);
                    return (
                      <td key={s.id} onClick={() => isAdmin && onToggleSkill(a.id, s.id)} style={{
                        padding: '12px 8px', textAlign: 'center', borderBottom: `1px solid #333`,
                        cursor: isAdmin ? 'pointer' : 'default', background: has ? BRAND.orange : 'transparent', transition: 'background 0.15s',
                      }}>
                        {has ? <Check size={14} color={BRAND.black} style={{ display: 'block', margin: '0 auto' }} strokeWidth={3} /> : <span style={{ color: '#444', fontSize: '14px' }}>·</span>}
                      </td>
                    );
                  })}
                  <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 900, color: BRAND.orange, fontSize: '14px', borderBottom: `1px solid #333` }}>
                    {(a.skills || []).length}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: BRAND.black, borderTop: `2px solid ${BRAND.orange}` }}>
              <td style={{ padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: BRAND.orange, fontWeight: 700, position: 'sticky', left: 0, background: BRAND.black }}>Coverage</td>
              <td />
              {skillStats.map(s => (
                <td key={s.id} style={{ padding: '14px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: s.gap > 10 ? BRAND.red : s.gap > 0 ? BRAND.yellow : BRAND.orange }}>
                  {s.actualPct.toFixed(0)}%
                </td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ ADMIN (user management) ============
function AdminView({ session }) {
  const [users, setUsers] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ username: '', displayName: '', pin: '', role: 'reader' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => subscribeUsers(setUsers), []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await createUser(form);
      setSuccess(`Bruger "${form.displayName}" oprettet med rolle ${form.role}`);
      setForm({ username: '', displayName: '', pin: '', role: 'reader' });
      setShowNew(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId, displayName) => {
    if (userId === session.uid) {
      alert('Du kan ikke slette dig selv');
      return;
    }
    if (confirm(`Slet bruger "${displayName}"?`)) {
      await deleteUser(userId);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Admin</div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
            User <span style={{ color: BRAND.orange }}>management</span>
          </h2>
        </div>
        <button onClick={() => setShowNew(!showNew)} style={{
          background: BRAND.orange, color: BRAND.black, border: 'none',
          padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <UserPlus size={14} /> Ny bruger
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333`, marginBottom: '24px' }}>
          <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '18px' }}>Opret bruger</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Username</label>
              <input required value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}
                placeholder="mjensen" style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Vist navn</label>
              <input required value={form.displayName} onChange={(e) => setForm({...form, displayName: e.target.value})}
                placeholder="Mette Jensen" style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>6-cifret PIN</label>
              <input required value={form.pin} onChange={(e) => setForm({...form, pin: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                placeholder="123456" style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'monospace', letterSpacing: '0.3em' }} />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Rolle</label>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}
                style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
                <option value="reader">Reader</option>
                <option value="admin">Admin (Trainer)</option>
              </select>
            </div>
          </div>
          {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>
              Opret
            </button>
            <button type="button" onClick={() => setShowNew(false)} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '10px 20px', cursor: 'pointer', fontSize: '12px' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {success && <div style={{ background: BRAND.orange, color: BRAND.black, padding: '12px 16px', fontSize: '13px', marginBottom: '16px', fontWeight: 700 }}>{success}</div>}

      <div style={{ background: BRAND.grey, border: `1px solid #333` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: BRAND.black }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>Navn</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>Username</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>Rolle</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: `1px solid #333` }}>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{u.displayName}</td>
                <td style={{ padding: '12px 16px', color: '#999', fontFamily: 'monospace' }}>{u.username}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '10px', padding: '3px 8px', background: u.role === 'admin' ? BRAND.orange : '#444', color: u.role === 'admin' ? BRAND.black : BRAND.white, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{u.role}</span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(u.id, u.displayName)} style={{ background: 'transparent', border: `1px solid #555`, color: '#999', padding: '4px 10px', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                    <Trash2 size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> Slet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: BRAND.grey, border: `1px solid #333`, borderLeft: `4px solid ${BRAND.yellow}` }}>
        <div style={{ fontSize: '11px', color: BRAND.yellow, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>
          Note om PIN-sikkerhed
        </div>
        <div style={{ fontSize: '12px', color: '#bbb', lineHeight: 1.5 }}>
          PIN-koder er hashed med SHA-256 før de gemmes. De kan ikke læses fra databasen. Hvis en bruger glemmer sin PIN, kan du slette brugeren og oprette dem igen med en ny PIN.
        </div>
      </div>
    </div>
  );
}

// ============ MODALS ============
function CommentModal({ agentId, session, onClose }) {
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('comment');

  const save = async () => {
    if (!text.trim()) return;
    const titles = {
      comment: 'Development note',
      training: 'Training scheduled',
      onboarding: 'Onboarding milestone',
    };
    await addTimelineEvent(agentId, {
      type, title: titles[type] || 'Note', note: text, date,
    });
    onClose();
  };

  return (
    <ModalShell onClose={onClose}>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>Tilføj note</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
        <div>
          <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="comment">Comment / Note</option>
            <option value="training">Training event</option>
            <option value="onboarding">Onboarding milestone</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Dato</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
        </div>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Skriv note om udvikling, observationer, næste skridt..."
        style={{ width: '100%', minHeight: '120px', marginTop: '12px', padding: '12px', background: BRAND.black, color: BRAND.white, border: `1px solid ${BRAND.orange}`, fontFamily: 'inherit', fontSize: '14px', resize: 'vertical' }} />
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Gem note</button>
      </div>
    </ModalShell>
  );
}

function NewAgentModal({ session, onClose }) {
  const [form, setForm] = useState({ name: '', market: 'DK', startDate: new Date().toISOString().split('T')[0], status: 'Onboarding' });

  const save = async () => {
    if (!form.name.trim()) return;
    await createAgent({ ...form, actorName: session.displayName });
    onClose();
  };

  return (
    <ModalShell onClose={onClose}>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>Ny agent</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <div>
          <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Navn</label>
          <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="Fornavn Efternavn"
            style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Marked</label>
            <select value={form.market} onChange={(e) => setForm({...form, market: e.target.value})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
              {['DK', 'NO', 'SE', 'FI'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Startdato</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Status</label>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
              <option value="Onboarding">Onboarding</option>
              <option value="Active">Active</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Opret agent</button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.grey, padding: '32px', maxWidth: '500px', width: '90%', border: `2px solid ${BRAND.orange}`, maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
