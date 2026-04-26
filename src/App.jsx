import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Target, Calendar, Edit3, Plus, X, Check,
  AlertCircle, ChevronRight, Clock, Award, MessageSquare,
  Shield, Eye, Search, BarChart3, UserCheck, GraduationCap,
  Activity, LogOut, Lock, Trash2, UserPlus, Settings, User,
  Filter, Users2, Briefcase, CheckSquare, Square, UserCog,
  Megaphone, MinusCircle, Unlink, BookOpen, Zap,
} from 'lucide-react';
import { getSession, loginWithPin, logout, createUser } from './lib/auth.js';
import {
  subscribeSkills, subscribeAgents, subscribeTimeline, subscribeUsers,
  subscribeTeams, subscribeTrainers, subscribeRecruiters, subscribeRecruitments,
  toggleAgentSkill, updateSkillTarget, createSkill, updateSkill, deleteSkill,
  createAgent, updateAgent, deleteAgent, changeAgentTeam, changeAgentTrainer,
  createTeam, updateTeam, deleteTeam,
  createTrainer, updateTrainer, deleteTrainer,
  createRecruiter, updateRecruiter, deleteRecruiter,
  subscribeCourseTypes, createCourseType, updateCourseType, deleteCourseType,
  subscribeCourses, createCourse, updateCourse, deleteCourse,
  enrollAgentsOnCourse, unenrollAgentFromCourse, setCourseStatus,
  subscribeUpskills, createUpskill, updateUpskill, deleteUpskill,
  addAgentsToUpskill, removeAgentFromUpskill, setUpskillStatus,
  subscribeTimeLogs, addTimeLog, deleteTimeLog,
  createRecruitment, updateRecruitment, deleteRecruitment,
  convertCandidateToAgent,
  addCandidateSlots, removeCandidateSlot,
  revertCandidateSlotDeleteAgent, unlinkCandidateSlot,
  addTimelineEvent, deleteTimelineEvent, deleteUser,
  bulkDeleteAgents, bulkAssignTeam, bulkAssignTrainer,
} from './lib/data.js';

const BRAND = {
  orange: '#f96700', grey: '#252525', black: '#000000',
  white: '#ffffff', yellow: '#ffe100', red: '#ff3927',
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const daysSince = (dateStr) => {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
};
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
const recruitmentStatusColor = (status) => {
  switch (status) {
    case 'Initiated': return BRAND.yellow;
    case 'Live': return BRAND.orange;
    case 'Completed': return '#4ade80';
    default: return '#666';
  }
};

const courseStatusColor = (status) => {
  switch (status) {
    case 'Planned': return BRAND.yellow;
    case 'In progress': return BRAND.orange;
    case 'Completed': return '#4ade80';
    case 'Cancelled': return '#666';
    default: return '#666';
  }
};

export default function App() {
  const [session, setSession] = useState(getSession());
  if (!session) return <LoginScreen onLogin={setSession} />;
  return <Dashboard session={session} onLogout={() => { logout(); setSession(null); }} />;
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { const session = await loginWithPin(username, pin); onLogin(session); }
    catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: BRAND.black, color: BRAND.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Archivo', Arial, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;900&display=swap');
        .display-font { font-family: 'Archivo Black', Arial, sans-serif; letter-spacing: -0.02em; text-transform: uppercase; }
      `}</style>
      <div style={{ width: '400px', background: BRAND.grey, padding: '40px', border: `2px solid ${BRAND.orange}`, maxWidth: '90%' }}>
        <div style={{ background: BRAND.orange, padding: '6px 12px', fontWeight: 900, fontSize: '12px', display: 'inline-block' }} className="display-font">POWER</div>
        <h1 className="display-font" style={{ fontSize: '32px', margin: '20px 0 4px', lineHeight: 1 }}>
          Control <span style={{ color: BRAND.orange }}>Tower</span>
        </h1>
        <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Learning Unit · Login</p>
        <form onSubmit={handleLogin} style={{ marginTop: '30px' }}>
          <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. mjensen" autoFocus required
            style={{ width: '100%', padding: '10px 12px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontSize: '14px', fontFamily: 'inherit', marginBottom: '16px' }} />
          <label style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>6-digit PIN</label>
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" maxLength={6} pattern="\d{6}" required inputMode="numeric"
            style={{ width: '100%', padding: '10px 12px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontSize: '20px', fontFamily: 'monospace', letterSpacing: '0.5em', textAlign: 'center' }} />
          {error && (
            <div style={{ background: BRAND.red, color: BRAND.white, padding: '10px 12px', marginTop: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <button type="submit" disabled={loading || pin.length !== 6}
            style={{ width: '100%', padding: '12px', marginTop: '20px', background: loading || pin.length !== 6 ? '#555' : BRAND.orange, color: BRAND.black, border: 'none', cursor: loading ? 'wait' : 'pointer', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '13px', fontFamily: 'inherit' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ session, onLogout }) {
  const [skills, setSkills] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [recruitments, setRecruitments] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [upskills, setUpskills] = useState([]);
  const [view, setView] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedRecruitment, setSelectedRecruitment] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUpskill, setSelectedUpskill] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = session.role === 'admin';

  useEffect(() => {
    const unsubSkills = subscribeSkills(setSkills);
    const unsubTeams = subscribeTeams(setTeams);
    const unsubTrainers = subscribeTrainers(setTrainers);
    const unsubRecruiters = subscribeRecruiters(setRecruiters);
    const unsubRecruitments = subscribeRecruitments(setRecruitments);
    const unsubCourseTypes = subscribeCourseTypes(setCourseTypes);
    const unsubCourses = subscribeCourses(setCourses);
    const unsubUpskills = subscribeUpskills(setUpskills);
    const unsubAgents = subscribeAgents((list) => { setAgents(list); setLoading(false); });
    return () => { unsubSkills(); unsubAgents(); unsubTeams(); unsubTrainers(); unsubRecruiters(); unsubRecruitments(); unsubCourseTypes(); unsubCourses(); unsubUpskills(); };
  }, []);

  const skillStats = useMemo(() => {
    return skills.map(skill => {
      const agentsWithSkill = agents.filter(a => (a.skills || []).includes(skill.id));
      const actualPct = agents.length > 0 ? (agentsWithSkill.length / agents.length) * 100 : 0;
      return { ...skill, agentCount: agentsWithSkill.length, actualPct, gap: skill.targetVolumePct - actualPct, agents: agentsWithSkill };
    });
  }, [skills, agents]);

  const handleToggleSkill = async (agentId, skillId) => {
    if (!isAdmin) return;
    const agent = agents.find(a => a.id === agentId);
    const skill = skills.find(s => s.id === skillId);
    if (!agent || !skill) return;
    const currentlyHas = (agent.skills || []).includes(skillId);
    await toggleAgentSkill(agentId, skillId, skill.name, !currentlyHas, session.displayName);
  };

  if (loading) {
    return <div style={{ background: BRAND.black, color: BRAND.white, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '12px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Loading</div>
    </div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: BRAND.black, color: BRAND.white, fontFamily: "'Archivo', Arial, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700;900&display=swap');
        * { box-sizing: border-box; }
        .display-font { font-family: 'Archivo Black', Arial, sans-serif; letter-spacing: -0.02em; text-transform: uppercase; }
        .scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
        .scrollbar::-webkit-scrollbar-thumb { background: ${BRAND.orange}; }
        .hover-lift { transition: all 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); }
        tr.agent-row:hover { background: #2a2a2a !important; }
        tr.agent-row.selected { background: rgba(249, 103, 0, 0.15) !important; }
      `}</style>

      <header style={{ borderBottom: `3px solid ${BRAND.orange}`, background: `linear-gradient(90deg, ${BRAND.black} 0%, ${BRAND.grey} 100%)`, padding: '20px 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: BRAND.orange, padding: '8px 14px', fontWeight: 900, fontSize: '14px' }} className="display-font">POWER</div>
            <div>
              <h1 className="display-font" style={{ margin: 0, fontSize: '28px', letterSpacing: '-0.03em' }}>
                Control <span style={{ color: BRAND.orange }}>Tower</span>
              </h1>
              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>
                Learning Unit · Nordic Customer Service
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
            <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '8px 12px', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2px', marginTop: '20px', borderBottom: `1px solid ${BRAND.grey}`, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'agent', label: 'Agent View', icon: Users },
            { id: 'skill', label: 'Skill View', icon: Target },
            { id: 'matrix', label: 'Skill Matrix', icon: Activity },
            ...(isAdmin ? [{ id: 'recruitment', label: 'Recruitments', icon: Megaphone }] : []),
            ...(isAdmin ? [{ id: 'course', label: 'Courses', icon: BookOpen }] : []),
            ...(isAdmin ? [{ id: 'upskill', label: 'Upskills', icon: Zap }] : []),
            ...(isAdmin ? [{ id: 'controltower', label: 'Control Tower', icon: Activity }] : []),
            ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Settings }] : []),
          ].map(tab => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button key={tab.id} onClick={() => { setView(tab.id); setSelectedAgent(null); setSelectedSkill(null); setSelectedRecruitment(null); setSelectedCourse(null); setSelectedUpskill(null); }}
                style={{ background: 'transparent', color: active ? BRAND.orange : '#999', border: 'none', borderBottom: `3px solid ${active ? BRAND.orange : 'transparent'}`, padding: '12px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '-1px' }}>
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
        {view === 'overview' && <OverviewView agents={agents} skillStats={skillStats} setView={setView} setSelectedAgent={setSelectedAgent} />}
        {view === 'agent' && !selectedAgent && (
          <AgentListView agents={agents} skills={skills} teams={teams} trainers={trainers}
            recruitments={recruitments}
            setSelectedAgent={setSelectedAgent} isAdmin={isAdmin} session={session}
            onAddAgent={() => setModal({ type: 'agent' })} />
        )}
        {view === 'agent' && selectedAgent && (
          <AgentDetailView agentId={selectedAgent} agents={agents} skills={skills} teams={teams} trainers={trainers}
            recruitments={recruitments} courses={courses} upskills={upskills}
            isAdmin={isAdmin} session={session}
            onBack={() => setSelectedAgent(null)}
            onToggleSkill={handleToggleSkill}
            onAddComment={() => setModal({ type: 'comment', agentId: selectedAgent })}
            onJumpToRecruitment={(recruitmentId) => {
              setSelectedAgent(null);
              setView('recruitment');
              setSelectedRecruitment(recruitmentId);
            }}
            onJumpToCourse={(courseId) => {
              setSelectedAgent(null);
              setView('course');
              setSelectedCourse(courseId);
            }}
            onJumpToUpskill={(upskillId) => {
              setSelectedAgent(null);
              setView('upskill');
              setSelectedUpskill(upskillId);
            }}
            onDeleteAgent={async () => {
              const agent = agents.find(a => a.id === selectedAgent);
              const linkedRec = agent?.recruitmentId ? recruitments.find(r => r.id === agent.recruitmentId) : null;
              const msg = linkedRec
                ? `Delete this agent and all history?\n\nThe slot in recruitment "${linkedRec.name}" will be freed up.`
                : 'Delete this agent and all history?';
              if (confirm(msg)) {
                await deleteAgent(selectedAgent);
                setSelectedAgent(null);
              }
            }} />
        )}
        {view === 'skill' && !selectedSkill && (
          <SkillListView skillStats={skillStats} setSelectedSkill={setSelectedSkill} isAdmin={isAdmin} onManageSkills={() => setModal({ type: 'manageSkills' })} />
        )}
        {view === 'skill' && selectedSkill && (
          <SkillDetailView skill={skillStats.find(s => s.id === selectedSkill)} agents={agents} isAdmin={isAdmin}
            onBack={() => setSelectedSkill(null)} onUpdateTarget={updateSkillTarget} onToggleSkill={handleToggleSkill} />
        )}
        {view === 'matrix' && (
          <MatrixView skillStats={skillStats} agents={agents} isAdmin={isAdmin} onUpdateTarget={updateSkillTarget} onToggleSkill={handleToggleSkill} />
        )}
        {view === 'recruitment' && isAdmin && !selectedRecruitment && (
          <RecruitmentListView recruitments={recruitments} trainers={trainers} recruiters={recruiters}
            setSelectedRecruitment={setSelectedRecruitment}
            onNewRecruitment={() => setModal({ type: 'newRecruitment' })} />
        )}
        {view === 'recruitment' && isAdmin && selectedRecruitment && (
          <RecruitmentDetailView recruitmentId={selectedRecruitment} recruitments={recruitments}
            trainers={trainers} recruiters={recruiters} agents={agents}
            courses={courses} courseTypes={courseTypes} session={session}
            onBack={() => setSelectedRecruitment(null)}
            onConvertSlot={(slot) => setModal({ type: 'convertCandidate', slot, recruitmentId: selectedRecruitment })}
            onAddSlots={() => setModal({ type: 'addSlots', recruitmentId: selectedRecruitment })}
            onRemoveSlot={(slot) => setModal({ type: 'removeSlot', slot, recruitmentId: selectedRecruitment })}
            onRevertSlot={(slot) => setModal({ type: 'revertSlot', slot, recruitmentId: selectedRecruitment })}
            onCreateOnboardingCourse={(preset) => setModal({ type: 'newCourse', preset })}
            onJumpToCourse={(courseId) => {
              setSelectedRecruitment(null);
              setView('course');
              setSelectedCourse(courseId);
            }} />
        )}
        {view === 'course' && isAdmin && !selectedCourse && (
          <CourseListView courses={courses} courseTypes={courseTypes} trainers={trainers}
            setSelectedCourse={setSelectedCourse}
            onNewCourse={() => setModal({ type: 'newCourse' })} />
        )}
        {view === 'course' && isAdmin && selectedCourse && (
          <CourseDetailView courseId={selectedCourse} courses={courses} courseTypes={courseTypes}
            trainers={trainers} agents={agents} skills={skills} session={session}
            onBack={() => setSelectedCourse(null)}
            onEnroll={() => setModal({ type: 'enrollAgents', courseId: selectedCourse })}
            onEdit={() => setModal({ type: 'editCourse', courseId: selectedCourse })}
            onDelete={async () => {
              const c = courses.find(x => x.id === selectedCourse);
              if (!c) return;
              if (confirm(`Delete course "${c.name}"?\n\nThis will not affect enrolled agents — they keep any skills already awarded.`)) {
                await deleteCourse(selectedCourse);
                setSelectedCourse(null);
              }
            }}
            onLogTime={() => {
              const c = courses.find(x => x.id === selectedCourse);
              setModal({ type: 'logTime', parentType: 'course', parentId: selectedCourse, parentLabel: c?.name || 'course' });
            }}
            onJumpToAgent={(agentId) => {
              setSelectedCourse(null);
              setView('agent');
              setSelectedAgent(agentId);
            }} />
        )}
        {view === 'upskill' && isAdmin && !selectedUpskill && (
          <UpskillListView upskills={upskills} skills={skills} trainers={trainers}
            setSelectedUpskill={setSelectedUpskill}
            onNewUpskill={() => setModal({ type: 'newUpskill' })} />
        )}
        {view === 'upskill' && isAdmin && selectedUpskill && (
          <UpskillDetailView upskillId={selectedUpskill} upskills={upskills}
            skills={skills} trainers={trainers} agents={agents} session={session}
            onBack={() => setSelectedUpskill(null)}
            onAddAgents={() => setModal({ type: 'addUpskillAgents', upskillId: selectedUpskill })}
            onEdit={() => setModal({ type: 'editUpskill', upskillId: selectedUpskill })}
            onDelete={async () => {
              const u = upskills.find(x => x.id === selectedUpskill);
              if (!u) return;
              const skill = skills.find(s => s.id === u.skillId);
              const label = u.name || (skill ? skill.name : 'this upskill');
              if (confirm(`Delete upskill "${label}"?\n\nAgents keep any skills already awarded.`)) {
                await deleteUpskill(selectedUpskill);
                setSelectedUpskill(null);
              }
            }}
            onLogTime={() => {
              const u = upskills.find(x => x.id === selectedUpskill);
              const skill = skills.find(s => s.id === u?.skillId);
              const label = u?.name || skill?.name || 'upskill';
              setModal({ type: 'logTime', parentType: 'upskill', parentId: selectedUpskill, parentLabel: label });
            }}
            onJumpToAgent={(agentId) => {
              setSelectedUpskill(null);
              setView('agent');
              setSelectedAgent(agentId);
            }} />
        )}
        {view === 'controltower' && isAdmin && (
          <ControlTowerView trainers={trainers} courses={courses} upskills={upskills}
            skills={skills} agents={agents}
            onJumpToCourse={(id) => { setView('course'); setSelectedCourse(id); }}
            onJumpToUpskill={(id) => { setView('upskill'); setSelectedUpskill(id); }} />
        )}
        {view === 'admin' && isAdmin && (
          <AdminView session={session} skills={skills} teams={teams} trainers={trainers} recruiters={recruiters} courseTypes={courseTypes}
            onManageTeams={() => setModal({ type: 'manageTeams' })}
            onManageTrainers={() => setModal({ type: 'manageTrainers' })}
            onManageRecruiters={() => setModal({ type: 'manageRecruiters' })}
            onManageCourseTypes={() => setModal({ type: 'manageCourseTypes' })} />
        )}
      </main>

      {modal?.type === 'comment' && <CommentModal agentId={modal.agentId} session={session} onClose={() => setModal(null)} />}
      {modal?.type === 'agent' && <NewAgentModal session={session} teams={teams} trainers={trainers} onClose={() => setModal(null)} />}
      {modal?.type === 'manageSkills' && <ManageSkillsModal skills={skills} skillStats={skillStats} onClose={() => setModal(null)} />}
      {modal?.type === 'manageTeams' && <ManageTeamsModal teams={teams} agents={agents} onClose={() => setModal(null)} />}
      {modal?.type === 'manageTrainers' && <ManageTrainersModal trainers={trainers} skills={skills} onClose={() => setModal(null)} />}
      {modal?.type === 'manageRecruiters' && <ManageRecruitersModal recruiters={recruiters} onClose={() => setModal(null)} />}
      {modal?.type === 'manageCourseTypes' && <ManageCourseTypesModal courseTypes={courseTypes} skills={skills} onClose={() => setModal(null)} />}
      {modal?.type === 'newCourse' && <NewCourseModal courseTypes={courseTypes} trainers={trainers} skills={skills} onClose={() => setModal(null)} preset={modal.preset} />}
      {modal?.type === 'enrollAgents' && (
        <EnrollAgentsModal courseId={modal.courseId} courses={courses} agents={agents} session={session}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'editCourse' && (
        <EditCourseModal courseId={modal.courseId} courses={courses} courseTypes={courseTypes}
          trainers={trainers} skills={skills} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'newUpskill' && (
        <NewUpskillModal skills={skills} trainers={trainers} agents={agents} session={session}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'addUpskillAgents' && (
        <AddUpskillAgentsModal upskillId={modal.upskillId} upskills={upskills}
          agents={agents} skills={skills} session={session}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'editUpskill' && (
        <EditUpskillModal upskillId={modal.upskillId} upskills={upskills}
          skills={skills} trainers={trainers} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'logTime' && (
        <TimeLogModal parentType={modal.parentType} parentId={modal.parentId}
          parentLabel={modal.parentLabel} session={session}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'newRecruitment' && <NewRecruitmentModal recruiters={recruiters} trainers={trainers} onClose={() => setModal(null)} />}
      {modal?.type === 'convertCandidate' && (
        <ConvertCandidateModal slot={modal.slot} recruitmentId={modal.recruitmentId}
          recruitments={recruitments} recruiters={recruiters} session={session}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'addSlots' && (
        <AddSlotsModal recruitmentId={modal.recruitmentId} recruitments={recruitments}
          onClose={() => setModal(null)} />
      )}
      {modal?.type === 'removeSlot' && (
        <RemoveSlotModal slot={modal.slot} recruitmentId={modal.recruitmentId}
          recruitments={recruitments} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'revertSlot' && (
        <RevertSlotModal slot={modal.slot} recruitmentId={modal.recruitmentId}
          recruitments={recruitments} agents={agents} session={session}
          onClose={() => setModal(null)} />
      )}

      <footer style={{ borderTop: `1px solid ${BRAND.grey}`, padding: '20px 32px', marginTop: '60px', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <span>POWER · Control Tower v3.0.1 · Learning Unit · Nordic Customer Service</span>
        <span>{isAdmin ? 'Admin session' : 'Read-only session'}</span>
      </footer>
    </div>
  );
}

// ============ NEW: Convert Candidate Modal ============
function ConvertCandidateModal({ slot, recruitmentId, recruitments, recruiters, session, onClose }) {
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const rec = recruitments.find(r => r.id === recruitmentId);

  if (!rec) return null;

  // Find recruiters for this recruitment for display
  const assignedRecruiters = recruiters.filter(r => (rec.recruiterIds || []).includes(r.id));

  const save = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setError(''); setProcessing(true);
    try {
      // Pass full recruiters list — convertCandidateToAgent will filter internally
      await convertCandidateToAgent(recruitmentId, slot.slotNumber, name, recruiters, session.displayName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to convert');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()}>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>Convert candidate</h3>
      <div style={{ marginTop: '12px', color: '#bbb', fontSize: '13px' }}>
        Converting <strong style={{ color: BRAND.orange }}>Slot #{slot.slotNumber}</strong> from "{rec.name}" into a real agent.
      </div>

      <div style={{ marginTop: '16px' }}>
        <FormLabel>Agent name *</FormLabel>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
          placeholder="First Last"
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) save(); }}
          style={{ width: '100%', padding: '10px', background: BRAND.black, border: `1px solid ${BRAND.orange}`, color: BRAND.white, fontFamily: 'inherit', fontSize: '14px' }} />
      </div>

      <div style={{ marginTop: '16px', padding: '12px', background: BRAND.black, borderLeft: `3px solid ${BRAND.orange}`, fontSize: '11px', color: '#bbb', lineHeight: 1.6 }}>
        <strong style={{ color: BRAND.orange }}>The new agent will be created with:</strong><br />
        · Market: <strong>{rec.market}</strong><br />
        · Status: <strong>Onboarding</strong><br />
        · Start date: <strong>{rec.classStartDate ? formatDate(rec.classStartDate) : 'today'}</strong><br />
        · Linked to recruitment: <strong>{rec.name}</strong><br />
        {assignedRecruiters.length > 0 && (
          <>· Recruited by: <strong>{assignedRecruiters.map(r => r.name).join(', ')}</strong></>
        )}
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '12px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing || !name.trim()}
          style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: (processing || !name.trim()) ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', opacity: !name.trim() ? 0.5 : 1 }}>
          {processing ? 'Creating...' : 'Create agent'}
        </button>
      </div>
    </ModalShell>
  );
}

// ============ ROUND 3b-1 MODALS ============

function AddSlotsModal({ recruitmentId, recruitments, onClose }) {
  const [count, setCount] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const rec = recruitments.find(r => r.id === recruitmentId);

  if (!rec) return null;

  const save = async () => {
    const n = parseInt(count);
    if (!n || n < 1) { setError('Enter a positive number'); return; }
    if (n > 100) { setError('Max 100 slots at a time'); return; }
    setError(''); setProcessing(true);
    try {
      await addCandidateSlots(recruitmentId, n);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add slots');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()}>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>Add candidate slots</h3>
      <div style={{ marginTop: '12px', color: '#bbb', fontSize: '13px' }}>
        Add empty slots to <strong style={{ color: BRAND.orange }}>{rec.name}</strong>. New slots will be numbered after the existing ones.
      </div>

      <div style={{ marginTop: '16px' }}>
        <FormLabel>Number of slots to add *</FormLabel>
        <input autoFocus type="number" min="1" max="100" value={count}
          onChange={(e) => setCount(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          style={{ width: '100%', padding: '10px', background: BRAND.black, border: `1px solid ${BRAND.orange}`, color: BRAND.white, fontFamily: 'inherit', fontSize: '14px' }} />
      </div>

      <div style={{ marginTop: '16px', padding: '12px', background: BRAND.black, borderLeft: `3px solid ${BRAND.orange}`, fontSize: '11px', color: '#bbb', lineHeight: 1.6 }}>
        Currently: <strong>{rec.candidates?.length || 0}</strong> slots
        {rec.status === 'Completed' && <><br />⚠ Status will reset from <strong>Completed</strong> to <strong>Live</strong>.</>}
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '12px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing}
          style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>
          {processing ? 'Adding...' : 'Add slots'}
        </button>
      </div>
    </ModalShell>
  );
}

function RemoveSlotModal({ slot, recruitmentId, recruitments, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const rec = recruitments.find(r => r.id === recruitmentId);

  if (!rec || !slot) return null;

  const remove = async () => {
    setError(''); setProcessing(true);
    try {
      await removeCandidateSlot(recruitmentId, slot.slotNumber);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to remove slot');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()}>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>Remove slot</h3>
      <div style={{ marginTop: '12px', color: '#bbb', fontSize: '13px' }}>
        Remove <strong style={{ color: BRAND.orange }}>Slot #{slot.slotNumber}</strong> from "{rec.name}"?
      </div>

      <div style={{ marginTop: '16px', padding: '12px', background: BRAND.black, borderLeft: `3px solid #555`, fontSize: '11px', color: '#bbb', lineHeight: 1.6 }}>
        This permanently removes the empty slot. The recruitment's target count will go from <strong>{rec.candidates?.length || 0}</strong> to <strong>{(rec.candidates?.length || 0) - 1}</strong>.
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '12px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={remove} disabled={processing}
          style={{ background: BRAND.red, color: BRAND.white, border: 'none', padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>
          {processing ? 'Removing...' : 'Remove slot'}
        </button>
      </div>
    </ModalShell>
  );
}

function RevertSlotModal({ slot, recruitmentId, recruitments, agents, session, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const rec = recruitments.find(r => r.id === recruitmentId);
  const linkedAgent = slot?.agentId ? agents.find(a => a.id === slot.agentId) : null;

  if (!rec || !slot) return null;

  const agentDisplayName = linkedAgent?.name || slot.hiredName || 'Unknown agent';

  const doUnlink = async () => {
    setError(''); setProcessing(true);
    try {
      await unlinkCandidateSlot(recruitmentId, slot.slotNumber, session.displayName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to unlink');
      setProcessing(false);
    }
  };

  const doDelete = async () => {
    if (!confirm(`Delete agent "${agentDisplayName}" and all their history?\n\nThis cannot be undone.`)) return;
    setError(''); setProcessing(true);
    try {
      await revertCandidateSlotDeleteAgent(recruitmentId, slot.slotNumber, session.displayName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()} wide>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>Manage hired slot</h3>
      <div style={{ marginTop: '12px', color: '#bbb', fontSize: '13px' }}>
        <strong style={{ color: BRAND.orange }}>Slot #{slot.slotNumber}</strong> in "{rec.name}" is hired by{' '}
        <strong style={{ color: BRAND.white }}>{agentDisplayName}</strong>.
        {!linkedAgent && <span style={{ color: BRAND.yellow }}> (Agent profile not found — may already be deleted.)</span>}
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: BRAND.black, border: `1px solid #333`, borderLeft: `3px solid ${BRAND.yellow}`, padding: '14px' }}>
          <div className="display-font" style={{ fontSize: '14px', color: BRAND.yellow }}>Unlink only</div>
          <div style={{ fontSize: '11px', color: '#bbb', marginTop: '6px', lineHeight: 1.5 }}>
            Free the slot but <strong>keep the agent</strong>. The agent stays in the system; their link to this recruitment is removed.
          </div>
          <button onClick={doUnlink} disabled={processing || !linkedAgent}
            style={{ background: BRAND.yellow, color: BRAND.black, border: 'none', padding: '8px 12px', cursor: (processing || !linkedAgent) ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: !linkedAgent ? 0.5 : 1 }}>
            <Unlink size={12} /> Unlink
          </button>
        </div>

        <div style={{ background: BRAND.black, border: `1px solid #333`, borderLeft: `3px solid ${BRAND.red}`, padding: '14px' }}>
          <div className="display-font" style={{ fontSize: '14px', color: BRAND.red }}>Delete agent</div>
          <div style={{ fontSize: '11px', color: '#bbb', marginTop: '6px', lineHeight: 1.5 }}>
            Free the slot <strong>and delete the agent</strong> with all history. Use this if the hire was a mistake.
          </div>
          <button onClick={doDelete} disabled={processing}
            style={{ background: BRAND.red, color: BRAND.white, border: 'none', padding: '8px 12px', cursor: processing ? 'wait' : 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginTop: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Trash2 size={12} /> Delete agent
          </button>
        </div>
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '14px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
      </div>
    </ModalShell>
  );
}

// ============ CONTROL TOWER VIEW (C6) ============
// Trainer-axis overview: who is teaching what, now and upcoming.

/**
 * Subscribes to timeLogs subcollections for a list of (parentType, parentId) pairs
 * and returns a map of "type:id" -> total hours. Designed for ControlTowerView
 * where we need aggregated per-trainer hours across many active tasks.
 */
function useAggregatedTimeLogs(taskRefs) {
  const [hoursByTask, setHoursByTask] = useState({});

  // Stable key for the effect: which tasks are we subscribing to?
  const refsKey = taskRefs.map(r => `${r.type}:${r.id}`).sort().join('|');

  useEffect(() => {
    // Reset before re-subscribing so old totals don't linger
    setHoursByTask({});
    if (taskRefs.length === 0) return;

    const unsubs = taskRefs.map(({ type, id }) => {
      return subscribeTimeLogs(type, id, (logs) => {
        const total = logs.reduce((sum, l) => sum + (l.hours || 0), 0);
        setHoursByTask(prev => ({ ...prev, [`${type}:${id}`]: total }));
      });
    });
    return () => unsubs.forEach(fn => fn && fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refsKey]);

  return hoursByTask;
}

function ControlTowerView({ trainers, courses, upskills, skills, agents, onJumpToCourse, onJumpToUpskill }) {
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // default to "active": Planned + In progress
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Helper: is a task "active" by our default definition?
  const isActiveStatus = (s) => s === 'Planned' || s === 'In progress';

  // Filter tasks based on the chosen status filter
  const matchesStatusFilter = (task) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return isActiveStatus(task.status);
    return task.status === statusFilter;
  };

  const matchesMarketFilter = (task) => {
    return marketFilter === 'ALL' || task.market === marketFilter;
  };

  const filteredCourses = useMemo(() => {
    if (typeFilter === 'upskill') return [];
    return courses.filter(c => matchesStatusFilter(c) && matchesMarketFilter(c));
  }, [courses, statusFilter, marketFilter, typeFilter]);

  const filteredUpskills = useMemo(() => {
    if (typeFilter === 'course') return [];
    return upskills.filter(u => matchesStatusFilter(u) && matchesMarketFilter(u));
  }, [upskills, statusFilter, marketFilter, typeFilter]);

  // Group tasks per trainer
  const tasksByTrainer = useMemo(() => {
    const map = new Map();
    for (const t of trainers) map.set(t.id, { trainer: t, courses: [], upskills: [] });
    for (const c of filteredCourses) {
      if (c.trainerId && map.has(c.trainerId)) map.get(c.trainerId).courses.push(c);
    }
    for (const u of filteredUpskills) {
      if (u.trainerId && map.has(u.trainerId)) map.get(u.trainerId).upskills.push(u);
    }
    return map;
  }, [trainers, filteredCourses, filteredUpskills]);

  // Sort: trainers with tasks first (most tasks first), then unassigned trainers
  const sortedTrainers = useMemo(() => {
    return [...trainers]
      .filter(t => marketFilter === 'ALL' || t.market === marketFilter)
      .sort((a, b) => {
        const aData = tasksByTrainer.get(a.id);
        const bData = tasksByTrainer.get(b.id);
        const aCount = (aData?.courses.length || 0) + (aData?.upskills.length || 0);
        const bCount = (bData?.courses.length || 0) + (bData?.upskills.length || 0);
        if (aCount !== bCount) return bCount - aCount;
        return a.name.localeCompare(b.name);
      });
  }, [trainers, tasksByTrainer, marketFilter]);

  // Tasks without a trainer
  const unassignedCourses = filteredCourses.filter(c => !c.trainerId);
  const unassignedUpskills = filteredUpskills.filter(u => !u.trainerId);
  const hasUnassigned = unassignedCourses.length > 0 || unassignedUpskills.length > 0;

  const totalTasks = filteredCourses.length + filteredUpskills.length;

  // C7: aggregate time logs across all currently filtered tasks
  const taskRefs = useMemo(() => {
    return [
      ...filteredCourses.map(c => ({ type: 'course', id: c.id })),
      ...filteredUpskills.map(u => ({ type: 'upskill', id: u.id })),
    ];
  }, [filteredCourses, filteredUpskills]);
  const hoursByTask = useAggregatedTimeLogs(taskRefs);

  // Total hours per trainer (sum of hours on all their currently-filtered tasks)
  const hoursPerTrainer = useMemo(() => {
    const map = {};
    for (const c of filteredCourses) {
      if (c.trainerId) map[c.trainerId] = (map[c.trainerId] || 0) + (hoursByTask[`course:${c.id}`] || 0);
    }
    for (const u of filteredUpskills) {
      if (u.trainerId) map[u.trainerId] = (map[u.trainerId] || 0) + (hoursByTask[`upskill:${u.id}`] || 0);
    }
    return map;
  }, [filteredCourses, filteredUpskills, hoursByTask]);

  const totalHoursLogged = Object.values(hoursByTask).reduce((sum, h) => sum + h, 0);

  // Tasks-per-market for the donut chart (counts, not hours)
  const tasksByMarket = useMemo(() => {
    const map = { DK: 0, NO: 0, SE: 0, FI: 0 };
    for (const c of filteredCourses) if (map[c.market] !== undefined) map[c.market]++;
    for (const u of filteredUpskills) if (map[u.market] !== undefined) map[u.market]++;
    return map;
  }, [filteredCourses, filteredUpskills]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
          Control Tower · {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
        </div>
        <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
          <span style={{ color: BRAND.orange }}>Learning Unit</span> · Nordic Customer Service
        </h2>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          What each trainer is currently working on. Click a card to jump to its detail view.
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <CTKPICard label="Trainers" value={trainers.filter(t => marketFilter === 'ALL' || t.market === marketFilter).length} icon={Briefcase} />
        <CTKPICard label="Active tasks" value={totalTasks} icon={Activity} />
        <CTKPICard label="Hours logged" value={`${totalHoursLogged.toFixed(1)}h`} icon={Clock} />
      </div>

      {/* Charts row: bar chart + donut */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <CTHoursPerTrainerChart trainers={trainers} hoursPerTrainer={hoursPerTrainer} marketFilter={marketFilter} />
        <CTMarketDonut tasksByMarket={tasksByMarket} />
      </div>

      <div style={{ background: BRAND.grey, padding: '16px', border: `1px solid #333`, marginBottom: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <FilterLabel>Market</FilterLabel>
          <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option><option value="DK">DK</option><option value="NO">NO</option><option value="SE">SE</option><option value="FI">FI</option>
          </select>
        </div>
        <div>
          <FilterLabel>Type</FilterLabel>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option>
            <option value="course">Courses only</option>
            <option value="upskill">Upskills only</option>
          </select>
        </div>
        <div>
          <FilterLabel>Status</FilterLabel>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ACTIVE">Active (Planned + In progress)</option>
            <option value="Planned">Planned</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="ALL">All</option>
          </select>
        </div>
      </div>

      {sortedTrainers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666', fontStyle: 'italic', background: BRAND.grey, border: `1px solid #333` }}>
          No trainers in {marketFilter === 'ALL' ? 'any market' : marketFilter}. Add trainers in Admin first.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sortedTrainers.map(trainer => {
            const data = tasksByTrainer.get(trainer.id) || { courses: [], upskills: [] };
            const total = data.courses.length + data.upskills.length;
            const isIdle = total === 0;
            return (
              <div key={trainer.id} style={{
                background: BRAND.grey,
                border: `1px solid #333`,
                borderLeft: `3px solid ${isIdle ? '#444' : BRAND.orange}`,
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: total > 0 ? '14px' : 0, gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{ width: '40px', height: '40px', background: isIdle ? '#222' : BRAND.orange, color: isIdle ? '#888' : BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }} className="display-font">
                      {trainer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="display-font" style={{ fontSize: '18px', fontWeight: 700 }}>{trainer.name}</div>
                      <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{trainer.market}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {!isIdle && (hoursPerTrainer[trainer.id] || 0) > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700 }}>
                        <Clock size={12} color={BRAND.orange} />
                        <span style={{ color: BRAND.orange }}>{(hoursPerTrainer[trainer.id] || 0).toFixed(1)}h</span>
                        <span style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '2px' }}>logged</span>
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: isIdle ? '#666' : BRAND.orange, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {isIdle ? 'No active tasks' : `${data.courses.length} course${data.courses.length === 1 ? '' : 's'} · ${data.upskills.length} upskill${data.upskills.length === 1 ? '' : 's'}`}
                    </div>
                  </div>
                </div>

                {total > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                    {data.courses.map(c => (
                      <CTTaskCard key={`c_${c.id}`} type="course" task={c} skills={skills}
                        agentCount={(c.enrolledAgentIds || []).length}
                        onClick={() => onJumpToCourse(c.id)} />
                    ))}
                    {data.upskills.map(u => (
                      <CTTaskCard key={`u_${u.id}`} type="upskill" task={u} skills={skills}
                        agentCount={(u.agentIds || []).length}
                        label={upskillLabel(u, skills)}
                        onClick={() => onJumpToUpskill(u.id)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasUnassigned && (
        <div style={{ marginTop: '24px' }}>
          <h3 className="display-font" style={{ margin: '0 0 12px', fontSize: '20px', color: BRAND.yellow }}>
            ⚠ Unassigned tasks ({unassignedCourses.length + unassignedUpskills.length})
          </h3>
          <div style={{ background: BRAND.grey, border: `1px solid #333`, borderLeft: `3px solid ${BRAND.yellow}`, padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', color: '#bbb', marginBottom: '12px' }}>
              These tasks have no trainer assigned. Open them and assign one.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
              {unassignedCourses.map(c => (
                <CTTaskCard key={`uc_${c.id}`} type="course" task={c} skills={skills}
                  agentCount={(c.enrolledAgentIds || []).length}
                  onClick={() => onJumpToCourse(c.id)} />
              ))}
              {unassignedUpskills.map(u => (
                <CTTaskCard key={`uu_${u.id}`} type="upskill" task={u} skills={skills}
                  agentCount={(u.agentIds || []).length}
                  label={upskillLabel(u, skills)}
                  onClick={() => onJumpToUpskill(u.id)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CTKPICard({ label, value, icon: Icon }) {
  return (
    <div style={{ background: BRAND.grey, border: `1px solid #333`, borderTop: `2px solid ${BRAND.orange}`, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        {Icon && <Icon size={14} color={BRAND.orange} />}
        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</div>
      </div>
      <div className="display-font" style={{ fontSize: '28px', lineHeight: 1, color: BRAND.white }}>
        {value}
      </div>
    </div>
  );
}

function CTHoursPerTrainerChart({ trainers, hoursPerTrainer, marketFilter }) {
  // Show only trainers with at least some hours, sorted descending. Cap to 10 to keep it readable.
  const data = useMemo(() => {
    return trainers
      .filter(t => marketFilter === 'ALL' || t.market === marketFilter)
      .map(t => ({ id: t.id, name: t.name, market: t.market, hours: hoursPerTrainer[t.id] || 0 }))
      .filter(t => t.hours > 0)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10);
  }, [trainers, hoursPerTrainer, marketFilter]);

  const maxHours = data.length > 0 ? data[0].hours : 0;

  return (
    <div style={{ background: BRAND.grey, border: `1px solid #333`, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
        <h3 className="display-font" style={{ margin: 0, fontSize: '16px' }}>Hours per trainer</h3>
        <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          on currently filtered tasks
        </span>
      </div>
      {data.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#666', fontStyle: 'italic', fontSize: '12px' }}>
          No hours logged on currently visible tasks.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map(d => {
            const pct = maxHours > 0 ? (d.hours / maxHours) * 100 : 0;
            return (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }} title={`${d.name} (${d.market})`}>
                  {d.name}
                </div>
                <div style={{ height: '14px', background: BRAND.black, position: 'relative' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: BRAND.orange, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ textAlign: 'right', fontFeatureSettings: '"tnum"', color: BRAND.orange, fontWeight: 700 }}>
                  {d.hours.toFixed(1)}h
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CTMarketDonut({ tasksByMarket }) {
  const total = Object.values(tasksByMarket).reduce((s, n) => s + n, 0);
  // Brand-aligned hues for markets
  const colors = { DK: BRAND.orange, NO: BRAND.yellow, SE: '#4ade80', FI: '#7dd3fc' };
  const entries = Object.entries(tasksByMarket).filter(([, n]) => n > 0);

  // SVG donut math
  const size = 140;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = entries.map(([market, count]) => {
    const fraction = count / total;
    const length = fraction * circumference;
    const seg = {
      market,
      count,
      color: colors[market] || '#666',
      length,
      offset,
    };
    offset += length;
    return seg;
  });

  return (
    <div style={{ background: BRAND.grey, border: `1px solid #333`, padding: '16px 20px' }}>
      <h3 className="display-font" style={{ margin: '0 0 14px', fontSize: '16px' }}>Tasks by market</h3>
      {total === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#666', fontStyle: 'italic', fontSize: '12px' }}>
          No tasks to display.
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={BRAND.black} strokeWidth={stroke} />
            {segments.map(seg => (
              <circle key={seg.market}
                cx={size/2} cy={size/2} r={radius}
                fill="none" stroke={seg.color} strokeWidth={stroke}
                strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                strokeDashoffset={-seg.offset}
                transform={`rotate(-90 ${size/2} ${size/2})`} />
            ))}
            <text x={size/2} y={size/2 - 4} textAnchor="middle" fill={BRAND.white} fontSize="22" fontWeight="900" fontFamily="Archivo Black, Arial, sans-serif">{total}</text>
            <text x={size/2} y={size/2 + 14} textAnchor="middle" fill="#999" fontSize="9" textTransform="uppercase" letterSpacing="0.1em">tasks</text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
            {entries.map(([market, count]) => (
              <div key={market} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <div style={{ width: '12px', height: '12px', background: colors[market] || '#666', flexShrink: 0 }} />
                <div style={{ fontWeight: 700, flex: 1 }}>{market}</div>
                <div style={{ color: '#bbb' }}>{count} ({((count/total)*100).toFixed(0)}%)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CTTaskCard({ type, task, skills, agentCount, label, onClick }) {
  const Icon = type === 'course' ? BookOpen : Zap;
  const displayName = label || task.name;
  const skill = type === 'upskill' ? skills.find(s => s.id === task.skillId) : null;
  const dateLine = task.startDate
    ? (type === 'course' && task.endDate
        ? `${formatDate(task.startDate)} → ${formatDate(task.endDate)}`
        : `From ${formatDate(task.startDate)}`)
    : (type === 'upskill' && task.deadline
        ? `Due ${formatDate(task.deadline)}`
        : null);

  return (
    <div onClick={onClick} className="hover-lift"
      style={{ background: BRAND.black, border: `1px solid #333`, borderLeft: `3px solid ${courseStatusColor(task.status)}`, padding: '10px 12px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <Icon size={11} color={BRAND.orange} style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
          {displayName}
        </span>
        <span style={{ fontSize: '8px', padding: '2px 6px', background: courseStatusColor(task.status), color: BRAND.black, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {task.status}
        </span>
      </div>
      <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {type === 'course' ? 'Course' : 'Upskill'} · {task.market}
        {skill && <> · {skill.name}</>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '10px', color: '#bbb' }}>
        <span>
          <Users size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px', color: BRAND.orange }} />
          <strong style={{ color: BRAND.orange }}>{agentCount}</strong> agent{agentCount === 1 ? '' : 's'}
        </span>
        {dateLine && <span style={{ color: '#999' }}>{dateLine}</span>}
      </div>
    </div>
  );
}

function OverviewView({ agents, skillStats, setView, setSelectedAgent }) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'Active').length;
  const onboardingAgents = agents.filter(a => a.status === 'Onboarding').length;
  const criticalSkills = skillStats.filter(s => s.gap > 10).length;
  const avgSkillsPerAgent = agents.length ? (agents.reduce((sum, a) => sum + (a.skills || []).length, 0) / agents.length).toFixed(1) : 0;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Mission Control</div>
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
          <h3 className="display-font" style={{ margin: '0 0 20px', fontSize: '18px' }}>Skill Coverage</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {skillStats.map(s => <SkillGapBar key={s.id} skill={s} />)}
          </div>
        </div>
        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <h3 className="display-font" style={{ margin: '0 0 20px', fontSize: '18px' }}>Agents in Training</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agents.filter(a => a.status === 'Onboarding').map(a => (
              <div key={a.id} onClick={() => { setView('agent'); setSelectedAgent(a.id); }} className="hover-lift"
                style={{ padding: '12px', background: BRAND.black, cursor: 'pointer', borderLeft: `3px solid ${BRAND.yellow}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <div style={{ color: '#666', fontSize: '13px', fontStyle: 'italic' }}>No agents currently in onboarding</div>
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

function AgentListView({ agents, skills, teams, trainers, recruitments, setSelectedAgent, isAdmin, session, onAddAgent }) {
  const [search, setSearch] = useState('');
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trainerFilter, setTrainerFilter] = useState('ALL');
  const [recruitmentFilter, setRecruitmentFilter] = useState('ALL');
  const [skillHasFilter, setSkillHasFilter] = useState('ANY');
  const [startDateFilter, setStartDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [bulkModal, setBulkModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  const filtered = useMemo(() => {
    let list = agents.filter(a => {
      if (marketFilter !== 'ALL' && a.market !== marketFilter) return false;
      if (teamFilter !== 'ALL') {
        if (teamFilter === 'NONE' && a.teamId) return false;
        if (teamFilter !== 'NONE' && a.teamId !== teamFilter) return false;
      }
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (trainerFilter !== 'ALL') {
        if (trainerFilter === 'NONE' && a.trainerId) return false;
        if (trainerFilter !== 'NONE' && a.trainerId !== trainerFilter) return false;
      }
      if (recruitmentFilter !== 'ALL') {
        if (recruitmentFilter === 'NONE' && a.recruitmentId) return false;
        if (recruitmentFilter !== 'NONE' && a.recruitmentId !== recruitmentFilter) return false;
      }
      if (skillHasFilter !== 'ANY') {
        if (skillHasFilter.startsWith('MISSING:')) {
          const skillId = skillHasFilter.substring(8);
          if ((a.skills || []).includes(skillId)) return false;
        } else if (!(a.skills || []).includes(skillHasFilter)) return false;
      }
      if (startDateFilter !== 'ALL') {
        const days = daysSince(a.startDate);
        if (days === null || days > parseInt(startDateFilter)) return false;
      }
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    list.sort((a, b) => {
      let va, vb;
      if (sortBy === 'name') { va = a.name; vb = b.name; }
      else if (sortBy === 'startDate') { va = a.startDate || ''; vb = b.startDate || ''; }
      else if (sortBy === 'skillCount') { va = (a.skills || []).length; vb = (b.skills || []).length; }
      else if (sortBy === 'market') { va = a.market; vb = b.market; }
      else { va = a.name; vb = b.name; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [agents, search, marketFilter, teamFilter, statusFilter, trainerFilter, recruitmentFilter, skillHasFilter, startDateFilter, sortBy, sortDir]);

  const resetFilters = () => {
    setSearch(''); setMarketFilter('ALL'); setTeamFilter('ALL'); setStatusFilter('ALL');
    setTrainerFilter('ALL'); setRecruitmentFilter('ALL'); setSkillHasFilter('ANY'); setStartDateFilter('ALL');
  };
  const hasActiveFilters = search || marketFilter !== 'ALL' || teamFilter !== 'ALL' || statusFilter !== 'ALL' ||
    trainerFilter !== 'ALL' || recruitmentFilter !== 'ALL' || skillHasFilter !== 'ANY' || startDateFilter !== 'ALL';

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const toggleSelection = (agentId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId); else next.add(agentId);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(a => a.id)));
  };
  const clearSelection = () => setSelected(new Set());
  const selectedAgents = useMemo(() => agents.filter(a => selected.has(a.id)), [agents, selected]);
  const selectedMarkets = useMemo(() => [...new Set(selectedAgents.map(a => a.market))], [selectedAgents]);
  const sharedMarket = selectedMarkets.length === 1 ? selectedMarkets[0] : null;

  const handleBulkDelete = async () => {
    setProcessing(true);
    try { await bulkDeleteAgents([...selected]); setSelected(new Set()); setBulkModal(null); }
    catch (err) { alert(`Error: ${err.message}`); } finally { setProcessing(false); }
  };
  const handleBulkTeam = async (teamId) => {
    setProcessing(true);
    try {
      const team = teams.find(t => t.id === teamId);
      await bulkAssignTeam([...selected], teamId || null, team?.name, agents, teams, session.displayName);
      setSelected(new Set()); setBulkModal(null);
    } catch (err) { alert(`Error: ${err.message}`); } finally { setProcessing(false); }
  };
  const handleBulkTrainer = async (trainerId) => {
    setProcessing(true);
    try {
      const trainer = trainers.find(t => t.id === trainerId);
      await bulkAssignTrainer([...selected], trainerId || null, trainer?.name, agents, trainers, session.displayName);
      setSelected(new Set()); setBulkModal(null);
    } catch (err) { alert(`Error: ${err.message}`); } finally { setProcessing(false); }
  };

  const SortHeader = ({ col, children, align = 'left' }) => (
    <th onClick={() => toggleSort(col)} style={{ padding: '10px 12px', textAlign: align, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: sortBy === col ? BRAND.orange : '#999', borderBottom: `2px solid ${BRAND.orange}`, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
      {children} {sortBy === col && (sortDir === 'asc' ? '↑' : '↓')}
    </th>
  );

  const allFilteredSelected = filtered.length > 0 && filtered.every(a => selected.has(a.id));
  const someFilteredSelected = filtered.some(a => selected.has(a.id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            All Agents · {filtered.length} of {agents.length}
          </div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
            Agent <span style={{ color: BRAND.orange }}>profiles</span>
          </h2>
        </div>
        {isAdmin && (
          <button onClick={onAddAgent} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus size={14} /> New agent
          </button>
        )}
      </div>

      <div style={{ background: BRAND.grey, padding: '16px', border: `1px solid #333`, marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <FilterLabel>Search name</FilterLabel>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                style={{ width: '100%', padding: '8px 10px 8px 32px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', fontSize: '13px' }} />
            </div>
          </div>
          <div><FilterLabel>Market</FilterLabel>
            <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} style={filterSelectStyle}>
              <option value="ALL">All</option><option value="DK">DK</option><option value="NO">NO</option><option value="SE">SE</option><option value="FI">FI</option>
            </select>
          </div>
          <div><FilterLabel>Team</FilterLabel>
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} style={filterSelectStyle}>
              <option value="ALL">All teams</option><option value="NONE">No team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.market})</option>)}
            </select>
          </div>
          <div><FilterLabel>Status</FilterLabel>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={filterSelectStyle}>
              <option value="ALL">All</option><option value="Active">Active</option><option value="Onboarding">Onboarding</option>
            </select>
          </div>
          <div><FilterLabel>Skill</FilterLabel>
            <select value={skillHasFilter} onChange={(e) => setSkillHasFilter(e.target.value)} style={filterSelectStyle}>
              <option value="ANY">Any</option>
              <optgroup label="Has">{skills.map(s => <option key={s.id} value={s.id}>✓ {s.name}</option>)}</optgroup>
              <optgroup label="Missing">{skills.map(s => <option key={`m-${s.id}`} value={`MISSING:${s.id}`}>✗ {s.name}</option>)}</optgroup>
            </select>
          </div>
          <div><FilterLabel>Trainer</FilterLabel>
            <select value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)} style={filterSelectStyle}>
              <option value="ALL">All</option><option value="NONE">None</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><FilterLabel>Recruitment</FilterLabel>
            <select value={recruitmentFilter} onChange={(e) => setRecruitmentFilter(e.target.value)} style={filterSelectStyle}>
              <option value="ALL">All</option><option value="NONE">None</option>
              {(recruitments || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div><FilterLabel>Started</FilterLabel>
            <select value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} style={filterSelectStyle}>
              <option value="ALL">Any</option><option value="30">Last 30d</option><option value="90">Last 90d</option><option value="365">Last 12m</option>
            </select>
          </div>
          {hasActiveFilters && (
            <button onClick={resetFilters} style={{ background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red, padding: '8px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', height: '34px', alignSelf: 'flex-end' }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {isAdmin && selected.size > 0 && (
        <div style={{ background: BRAND.orange, color: BRAND.black, padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', position: 'sticky', top: '140px', zIndex: 50 }}>
          <div className="display-font" style={{ fontSize: '16px' }}>
            {selected.size} selected
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={() => setBulkModal('team')} style={{ background: BRAND.black, color: BRAND.white, border: 'none', padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users2 size={12} /> Assign team
          </button>
          <button onClick={() => setBulkModal('trainer')} style={{ background: BRAND.black, color: BRAND.white, border: 'none', padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={12} /> Assign trainer
          </button>
          <button onClick={() => setBulkModal('delete')} style={{ background: BRAND.red, color: BRAND.white, border: 'none', padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={clearSelection} style={{ background: 'transparent', color: BRAND.black, border: `1px solid ${BRAND.black}`, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>Clear</button>
        </div>
      )}

      <div className="scrollbar" style={{ background: BRAND.grey, border: `1px solid #333`, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: BRAND.black }}>
              {isAdmin && (
                <th style={{ padding: '10px 12px', width: '40px', borderBottom: `2px solid ${BRAND.orange}` }}>
                  <div onClick={toggleSelectAll} style={{ cursor: 'pointer', display: 'inline-flex' }}>
                    {allFilteredSelected ? <CheckSquare size={18} color={BRAND.orange} /> :
                     someFilteredSelected ? <Square size={18} color={BRAND.orange} style={{ fill: BRAND.orange, opacity: 0.3 }} /> :
                     <Square size={18} color="#666" />}
                  </div>
                </th>
              )}
              <SortHeader col="name">Name</SortHeader>
              <SortHeader col="market" align="center">Market</SortHeader>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', borderBottom: `2px solid ${BRAND.orange}` }}>Team</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', borderBottom: `2px solid ${BRAND.orange}` }}>Status</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', borderBottom: `2px solid ${BRAND.orange}` }}>Skills</th>
              <SortHeader col="skillCount" align="center">#</SortHeader>
              <SortHeader col="startDate">Started</SortHeader>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', borderBottom: `2px solid ${BRAND.orange}` }}>Trainer</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const team = teams.find(t => t.id === a.teamId);
              const trainer = trainers.find(t => t.id === a.trainerId);
              const agentSkills = skills.filter(s => (a.skills || []).includes(s.id));
              const isSelected = selected.has(a.id);
              return (
                <tr key={a.id} className={`agent-row ${isSelected ? 'selected' : ''}`}
                  style={{ cursor: 'pointer', borderTop: `1px solid #333` }}>
                  {isAdmin && (
                    <td style={{ padding: '10px 12px', width: '40px' }} onClick={(e) => { e.stopPropagation(); toggleSelection(a.id); }}>
                      <div style={{ cursor: 'pointer', display: 'inline-flex' }}>
                        {isSelected ? <CheckSquare size={18} color={BRAND.orange} /> : <Square size={18} color="#666" />}
                      </div>
                    </td>
                  )}
                  <td style={{ padding: '10px 12px', fontWeight: 700 }} onClick={() => setSelectedAgent(a.id)}>{a.name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#bbb' }} onClick={() => setSelectedAgent(a.id)}>{a.market}</td>
                  <td style={{ padding: '10px 12px', color: team ? BRAND.white : '#666', fontSize: '12px' }} onClick={() => setSelectedAgent(a.id)}>
                    {team ? team.name : <span style={{ fontStyle: 'italic' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 12px' }} onClick={() => setSelectedAgent(a.id)}>
                    <span style={{ fontSize: '10px', padding: '3px 8px', background: a.status === 'Onboarding' ? BRAND.yellow : BRAND.orange, color: BRAND.black, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{a.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }} onClick={() => setSelectedAgent(a.id)}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '280px' }}>
                      {agentSkills.slice(0, 4).map(s => (
                        <span key={s.id} style={{ fontSize: '9px', padding: '2px 6px', background: BRAND.black, color: BRAND.orange, border: `1px solid ${BRAND.orange}`, textTransform: 'uppercase', fontWeight: 700 }}>{s.name}</span>
                      ))}
                      {agentSkills.length > 4 && <span style={{ fontSize: '10px', color: '#999' }}>+{agentSkills.length - 4}</span>}
                      {agentSkills.length === 0 && <span style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>none</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: BRAND.orange, fontWeight: 700 }} onClick={() => setSelectedAgent(a.id)}>{agentSkills.length}</td>
                  <td style={{ padding: '10px 12px', color: '#bbb', fontSize: '12px', whiteSpace: 'nowrap' }} onClick={() => setSelectedAgent(a.id)}>{formatDate(a.startDate)}</td>
                  <td style={{ padding: '10px 12px', color: trainer ? '#bbb' : '#666', fontSize: '12px' }} onClick={() => setSelectedAgent(a.id)}>
                    {trainer ? trainer.name : <span style={{ fontStyle: 'italic' }}>—</span>}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={isAdmin ? 9 : 8} style={{ padding: '40px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                No agents match the current filters
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {bulkModal === 'delete' && (
        <ModalShell onClose={() => !processing && setBulkModal(null)}>
          <h3 className="display-font" style={{ margin: 0, fontSize: '22px', color: BRAND.red }}>Delete {selected.size} agent{selected.size === 1 ? '' : 's'}?</h3>
          <div style={{ marginTop: '16px', color: '#bbb', fontSize: '13px' }}>This will permanently delete the selected agents.</div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button onClick={() => setBulkModal(null)} disabled={processing} style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Cancel</button>
            <button onClick={handleBulkDelete} disabled={processing} style={{ background: BRAND.red, color: BRAND.white, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
              {processing ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </ModalShell>
      )}
      {bulkModal === 'team' && (
        <BulkAssignModal title="Assign team" itemName="team" options={teams} selectedAgents={selectedAgents} sharedMarket={sharedMarket}
          onClose={() => !processing && setBulkModal(null)} onAssign={handleBulkTeam} processing={processing} />
      )}
      {bulkModal === 'trainer' && (
        <BulkAssignModal title="Assign trainer" itemName="trainer" options={trainers} selectedAgents={selectedAgents} sharedMarket={sharedMarket}
          onClose={() => !processing && setBulkModal(null)} onAssign={handleBulkTrainer} processing={processing} />
      )}
    </div>
  );
}

function BulkAssignModal({ title, itemName, options, selectedAgents, sharedMarket, onClose, onAssign, processing }) {
  const [selectedId, setSelectedId] = useState('');
  const availableOptions = sharedMarket ? options.filter(o => o.market === sharedMarket) : [];
  return (
    <ModalShell onClose={onClose}>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>{title}</h3>
      {!sharedMarket && (
        <div style={{ marginTop: '16px', padding: '12px', background: BRAND.black, borderLeft: `3px solid ${BRAND.red}`, fontSize: '12px', color: '#bbb' }}>
          <strong style={{ color: BRAND.red }}>Market mismatch:</strong> Selected agents from multiple markets.
        </div>
      )}
      {sharedMarket && (
        <div style={{ marginTop: '16px' }}>
          <FormLabel>{itemName} (market: {sharedMarket})</FormLabel>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
            style={{ width: '100%', padding: '10px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', fontSize: '14px' }}>
            <option value="">— Remove {itemName} —</option>
            {availableOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing} style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Cancel</button>
        {sharedMarket && (
          <button onClick={() => onAssign(selectedId)} disabled={processing} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
            {processing ? 'Saving...' : (selectedId ? 'Assign' : 'Remove')}
          </button>
        )}
      </div>
    </ModalShell>
  );
}

const filterSelectStyle = {
  padding: '8px 10px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white,
  fontFamily: 'inherit', fontSize: '13px', cursor: 'pointer', minWidth: '140px',
};

function FilterLabel({ children }) {
  return <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }}>{children}</div>;
}

function AgentDetailView({ agentId, agents, skills, teams, trainers, recruitments, courses, upskills, isAdmin, session, onBack, onToggleSkill, onAddComment, onDeleteAgent, onJumpToRecruitment, onJumpToCourse, onJumpToUpskill }) {
  const [timeline, setTimeline] = useState([]);
  const [editTeam, setEditTeam] = useState(false);
  const [editTrainer, setEditTrainer] = useState(false);
  const agent = agents.find(a => a.id === agentId);

  useEffect(() => {
    if (!agentId) return;
    return subscribeTimeline(agentId, setTimeline);
  }, [agentId]);

  if (!agent) return null;
  const initials = agent.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const team = teams.find(t => t.id === agent.teamId);
  const trainer = trainers.find(t => t.id === agent.trainerId);
  const recruitment = agent.recruitmentId ? (recruitments || []).find(r => r.id === agent.recruitmentId) : null;
  const availableTeams = teams.filter(t => t.market === agent.market);
  const availableTrainers = trainers.filter(t => t.market === agent.market);

  const handleTeamChange = async (newTeamId) => {
    const newTeam = teams.find(t => t.id === newTeamId);
    await changeAgentTeam(agent.id, newTeamId, newTeam?.name, team?.name, session.displayName);
    setEditTeam(false);
  };
  const handleTrainerChange = async (newTrainerId) => {
    const newTrainer = trainers.find(t => t.id === newTrainerId);
    await changeAgentTrainer(agent.id, newTrainerId, newTrainer?.name, trainer?.name, session.displayName);
    setEditTrainer(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>← Back</button>
        {isAdmin && (
          <button onClick={onDeleteAgent} style={{ background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trash2 size={12} /> Delete agent
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', background: BRAND.orange, color: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }} className="display-font">{initials}</div>
        <div>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>{agent.market} · {agent.status}</div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '4px 0 0', lineHeight: 1 }}>{agent.name}</h2>
          <div style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
            Started {formatDate(agent.startDate)} · {(agent.skills || []).length} skills · {timeline.length} events
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <InfoPill icon={Users2} label="Team">
          {editTeam && isAdmin ? (
            <select autoFocus value={agent.teamId || ''} onChange={(e) => handleTeamChange(e.target.value || null)} onBlur={() => setEditTeam(false)}
              style={{ background: BRAND.black, color: BRAND.white, border: `1px solid ${BRAND.orange}`, padding: '4px 6px', fontFamily: 'inherit', fontSize: '13px' }}>
              <option value="">No team</option>
              {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : (
            <span onClick={() => isAdmin && setEditTeam(true)} style={{ color: team ? BRAND.white : '#666', cursor: isAdmin ? 'pointer' : 'default', fontWeight: 700 }}>
              {team ? team.name : <em>Not assigned</em>}
              {isAdmin && <Edit3 size={10} style={{ display: 'inline', marginLeft: '6px', color: BRAND.orange }} />}
            </span>
          )}
        </InfoPill>
        <InfoPill icon={Briefcase} label="Trainer">
          {editTrainer && isAdmin ? (
            <select autoFocus value={agent.trainerId || ''} onChange={(e) => handleTrainerChange(e.target.value || null)} onBlur={() => setEditTrainer(false)}
              style={{ background: BRAND.black, color: BRAND.white, border: `1px solid ${BRAND.orange}`, padding: '4px 6px', fontFamily: 'inherit', fontSize: '13px' }}>
              <option value="">No trainer</option>
              {availableTrainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : (
            <span onClick={() => isAdmin && setEditTrainer(true)} style={{ color: trainer ? BRAND.white : '#666', cursor: isAdmin ? 'pointer' : 'default', fontWeight: 700 }}>
              {trainer ? trainer.name : <em>Not assigned</em>}
              {isAdmin && <Edit3 size={10} style={{ display: 'inline', marginLeft: '6px', color: BRAND.orange }} />}
            </span>
          )}
        </InfoPill>
        {agent.recruitmentId && (
          <InfoPill icon={Megaphone} label="Recruited via">
            {recruitment ? (
              isAdmin && onJumpToRecruitment ? (
                <span onClick={() => onJumpToRecruitment(recruitment.id)}
                  title="Jump to recruitment"
                  style={{ color: BRAND.orange, cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {recruitment.name}
                  <ChevronRight size={12} />
                </span>
              ) : (
                <span style={{ color: BRAND.white, fontWeight: 700 }}>{recruitment.name}</span>
              )
            ) : (
              <span style={{ color: '#666', fontStyle: 'italic' }}>Recruitment removed</span>
            )}
          </InfoPill>
        )}
      </div>

      {/* C3 + C4: Courses and upskills the agent is involved in */}
      {(() => {
        const agentCourses = (courses || []).filter(c => (c.enrolledAgentIds || []).includes(agent.id));
        const agentUpskills = (upskills || []).filter(u => (u.agentIds || []).includes(agent.id));
        if (agentCourses.length === 0 && agentUpskills.length === 0) return null;

        return (
          <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333`, marginBottom: '24px' }}>
            <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '18px' }}>
              Training assignments ({agentCourses.length + agentUpskills.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
              {agentCourses.map(c => (
                <div key={`c_${c.id}`} onClick={() => onJumpToCourse && onJumpToCourse(c.id)} className="hover-lift"
                  style={{ background: BRAND.black, padding: '10px 12px', borderLeft: `3px solid ${courseStatusColor(c.status)}`, cursor: onJumpToCourse ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <BookOpen size={11} color={BRAND.orange} style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                      Course · <span style={{ color: courseStatusColor(c.status), fontWeight: 700 }}>{c.status}</span>
                      {c.startDate && <> · {formatDate(c.startDate)}</>}
                    </div>
                  </div>
                  <ChevronRight size={14} color="#666" />
                </div>
              ))}
              {agentUpskills.map(u => {
                const label = upskillLabel(u, skills);
                return (
                  <div key={`u_${u.id}`} onClick={() => onJumpToUpskill && onJumpToUpskill(u.id)} className="hover-lift"
                    style={{ background: BRAND.black, padding: '10px 12px', borderLeft: `3px solid ${courseStatusColor(u.status)}`, cursor: onJumpToUpskill ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <Zap size={11} color={BRAND.orange} style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                        Upskill · <span style={{ color: courseStatusColor(u.status), fontWeight: 700 }}>{u.status}</span>
                        {u.deadline && <> · due {formatDate(u.deadline)}</>}
                      </div>
                    </div>
                    <ChevronRight size={14} color="#666" />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <h3 className="display-font" style={{ margin: '0 0 20px', fontSize: '18px' }}>Assigned Skills</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {skills.map(s => {
              const assigned = (agent.skills || []).includes(s.id);
              return (
                <div key={s.id} onClick={() => isAdmin && onToggleSkill(agent.id, s.id)}
                  style={{ padding: '12px 14px', background: assigned ? BRAND.black : '#1a1a1a', borderLeft: `4px solid ${assigned ? BRAND.orange : '#333'}`, cursor: isAdmin ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: assigned ? 1 : 0.6 }}>
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
            <h3 className="display-font" style={{ margin: 0, fontSize: '18px' }}>Timeline</h3>
            {isAdmin && (
              <button onClick={onAddComment} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                    <div style={{ position: 'absolute', left: '-28px', top: '2px', width: '22px', height: '22px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${BRAND.black}` }}>
                      <Icon size={11} color={BRAND.black} />
                    </div>
                    <div style={{ background: BRAND.black, padding: '12px 14px', borderLeft: `3px solid ${color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{event.title}</div>
                        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>{formatDate(event.date)}</div>
                      </div>
                      {event.note && <div style={{ fontSize: '12px', color: '#bbb', marginTop: '6px', fontStyle: 'italic' }}>"{event.note}"</div>}
                      {event.createdBy && (
                        <div style={{ fontSize: '10px', color: '#888', marginTop: '6px' }}>
                          <User size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />by <span style={{ color: BRAND.orange, fontWeight: 700 }}>{event.createdBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {timeline.length === 0 && <div style={{ color: '#666', fontStyle: 'italic', fontSize: '13px' }}>No events yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: BRAND.grey, border: `1px solid #333`, borderLeft: `3px solid ${BRAND.orange}` }}>
      <Icon size={16} color={BRAND.orange} />
      <div>
        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: '13px', marginTop: '2px' }}>{children}</div>
      </div>
    </div>
  );
}

function RecruitmentListView({ recruitments, trainers, recruiters, setSelectedRecruitment, onNewRecruitment }) {
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return recruitments.filter(r => {
      if (marketFilter !== 'ALL' && r.market !== marketFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      return true;
    });
  }, [recruitments, marketFilter, statusFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            Recruitments · {recruitments.length} total
          </div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
            Recruitment <span style={{ color: BRAND.orange }}>pipeline</span>
          </h2>
        </div>
        <button onClick={onNewRecruitment} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> New recruitment
        </button>
      </div>

      <div style={{ background: BRAND.grey, padding: '16px', border: `1px solid #333`, marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <FilterLabel>Market</FilterLabel>
          <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option><option value="DK">DK</option><option value="NO">NO</option><option value="SE">SE</option><option value="FI">FI</option>
          </select>
        </div>
        <div>
          <FilterLabel>Status</FilterLabel>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option>
            <option value="Initiated">Initiated</option>
            <option value="Live">Live</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {filtered.map(r => {
          const hiredCount = (r.candidates || []).filter(c => c.status === 'hired').length;
          const totalCount = r.targetCount || 0;
          const pct = totalCount > 0 ? (hiredCount / totalCount) * 100 : 0;
          const trainerNames = (r.trainerIds || []).map(id => trainers.find(t => t.id === id)?.name).filter(Boolean);
          const recruiterNames = (r.recruiterIds || []).map(id => recruiters.find(rc => rc.id === id)?.name).filter(Boolean);

          return (
            <div key={r.id} onClick={() => setSelectedRecruitment(r.id)} className="hover-lift"
              style={{ background: BRAND.grey, border: `1px solid #333`, borderTop: `3px solid ${recruitmentStatusColor(r.status)}`, padding: '20px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 className="display-font" style={{ margin: 0, fontSize: '20px' }}>{r.name}</h3>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{r.market}</div>
                </div>
                <span style={{ fontSize: '9px', padding: '3px 8px', background: recruitmentStatusColor(r.status), color: BRAND.black, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                  {r.status}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700 }}>Progress</span>
                  <span style={{ color: '#999' }}>
                    <span style={{ color: BRAND.orange, fontWeight: 700 }}>{hiredCount}</span> of {totalCount} hired
                  </span>
                </div>
                <div style={{ position: 'relative', height: '8px', background: '#1a1a1a' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: BRAND.orange }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginBottom: '12px' }}>
                {r.applicationDeadline && (
                  <div>
                    <div style={{ color: '#999', textTransform: 'uppercase' }}>Deadline</div>
                    <div style={{ fontWeight: 700 }}>{formatDate(r.applicationDeadline)}</div>
                  </div>
                )}
                {r.classStartDate && (
                  <div>
                    <div style={{ color: '#999', textTransform: 'uppercase' }}>Class starts</div>
                    <div style={{ fontWeight: 700 }}>{formatDate(r.classStartDate)}</div>
                  </div>
                )}
              </div>

              {(recruiterNames.length > 0 || trainerNames.length > 0) && (
                <div style={{ paddingTop: '12px', borderTop: `1px solid #333`, fontSize: '11px' }}>
                  {recruiterNames.length > 0 && (
                    <div style={{ marginBottom: '4px', color: '#bbb' }}>
                      <UserCog size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: BRAND.orange }} />
                      <strong>Recruiters:</strong> {recruiterNames.join(', ')}
                    </div>
                  )}
                  {trainerNames.length > 0 && (
                    <div style={{ color: '#bbb' }}>
                      <Briefcase size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: BRAND.orange }} />
                      <strong>Trainers:</strong> {trainerNames.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#666', fontStyle: 'italic', background: BRAND.grey, border: `1px solid #333` }}>
            {recruitments.length === 0 ? 'No recruitments yet.' : 'No recruitments match filters.'}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ RECRUITMENT DETAIL — UPDATED with Convert button ============
function RecruitmentDetailView({ recruitmentId, recruitments, trainers, recruiters, agents, courses, courseTypes, session, onBack, onConvertSlot, onAddSlots, onRemoveSlot, onRevertSlot, onCreateOnboardingCourse, onJumpToCourse }) {
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const rec = recruitments.find(r => r.id === recruitmentId);
  if (!rec) return (
    <div>
      <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>← Back</button>
      <div style={{ padding: '40px', color: '#999', textAlign: 'center' }}>Recruitment not found</div>
    </div>
  );

  const hiredCount = (rec.candidates || []).filter(c => c.status === 'hired').length;
  const totalCount = rec.targetCount || 0;
  const pct = totalCount > 0 ? (hiredCount / totalCount) * 100 : 0;
  const assignedRecruiters = recruiters.filter(r => (rec.recruiterIds || []).includes(r.id));
  const assignedTrainers = trainers.filter(t => (rec.trainerIds || []).includes(t.id));
  const availableRecruiters = recruiters.filter(r => r.market === rec.market);
  const availableTrainers = trainers.filter(t => t.market === rec.market);

  const startEdit = () => {
    setEditForm({
      name: rec.name,
      applicationDeadline: rec.applicationDeadline || '',
      classStartDate: rec.classStartDate || '',
      recruiterIds: rec.recruiterIds || [],
      trainerIds: rec.trainerIds || [],
      status: rec.status,
    });
    setEditMode(true);
  };

  const saveEdit = async () => {
    setError(''); setProcessing(true);
    try { await updateRecruitment(recruitmentId, editForm); setEditMode(false); }
    catch (err) { setError(err.message); } finally { setProcessing(false); }
  };

  const handleStatusChange = async (newStatus) => {
    await updateRecruitment(recruitmentId, { status: newStatus });
  };

  const handleDelete = async () => {
    if (confirm(`Delete recruitment "${rec.name}"? Linked agents will NOT be deleted.`)) {
      await deleteRecruitment(recruitmentId);
      onBack();
    }
  };

  // Onboarding course integration (C3)
  const linkedOnboardingCourse = (courses || []).find(c => c.recruitmentId === recruitmentId);
  const hiredAgentIds = (rec.candidates || [])
    .filter(c => c.status === 'hired' && c.agentId)
    .map(c => c.agentId);
  const canCreateOnboarding = hiredAgentIds.length > 0 && !linkedOnboardingCourse;

  const handleCreateOnboardingCourse = () => {
    // Pick the first course type whose name contains "onboard" (case-insensitive),
    // or fall back to no type — admin can pick another in the modal.
    const onboardingType = (courseTypes || []).find(ct => /onboard/i.test(ct.name));
    const trainerId = (rec.trainerIds && rec.trainerIds[0]) || '';
    const preset = {
      name: `${rec.name} · Onboarding`,
      market: rec.market,
      courseTypeId: onboardingType?.id || '',
      trainerId,
      startDate: rec.classStartDate || '',
      endDate: '',
      skillIds: onboardingType?.defaultSkillIds || [],
      recruitmentId,
      enrolledAgentIds: hiredAgentIds,
      actorName: session.displayName,
    };
    onCreateOnboardingCourse(preset);
  };

  const toggleInForm = (field, id) => {
    const current = editForm[field] || [];
    setEditForm({ ...editForm, [field]: current.includes(id) ? current.filter(x => x !== id) : [...current, id] });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>← Back</button>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {linkedOnboardingCourse && (
            <button onClick={() => onJumpToCourse(linkedOnboardingCourse.id)}
              style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={12} /> View onboarding course
            </button>
          )}
          {canCreateOnboarding && (
            <button onClick={handleCreateOnboardingCourse}
              style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={12} /> Create onboarding course
            </button>
          )}
          {!editMode && (
            <button onClick={startEdit} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Edit3 size={12} /> Edit
            </button>
          )}
          <button onClick={handleDelete} style={{ background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
          Recruitment · {rec.market} · <span style={{ color: recruitmentStatusColor(rec.status) }}>{rec.status}</span>
        </div>
        <h2 className="display-font" style={{ fontSize: '42px', margin: '4px 0 0', lineHeight: 1 }}>{rec.name}</h2>
      </div>

      {editMode ? (
        <div style={{ background: BRAND.grey, padding: '24px', border: `2px solid ${BRAND.orange}`, marginBottom: '24px' }}>
          <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '20px' }}>Edit recruitment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
            <div>
              <FormLabel>Name</FormLabel>
              <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <FormLabel>Application deadline</FormLabel>
                <input type="date" value={editForm.applicationDeadline} onChange={(e) => setEditForm({...editForm, applicationDeadline: e.target.value})}
                  style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
              </div>
              <div>
                <FormLabel>Class start date</FormLabel>
                <input type="date" value={editForm.classStartDate} onChange={(e) => setEditForm({...editForm, classStartDate: e.target.value})}
                  style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
              </div>
              <div>
                <FormLabel>Status</FormLabel>
                <select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
                  <option value="Initiated">Initiated</option>
                  <option value="Live">Live</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <FormLabel>Recruiters (market: {rec.market})</FormLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: BRAND.black, border: `1px solid #444` }}>
                {availableRecruiters.map(r => {
                  const isChecked = editForm.recruiterIds.includes(r.id);
                  return (
                    <button key={r.id} type="button" onClick={() => toggleInForm('recruiterIds', r.id)}
                      style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>
                      {r.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <FormLabel>Trainers (market: {rec.market})</FormLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: BRAND.black, border: `1px solid #444` }}>
                {availableTrainers.map(t => {
                  const isChecked = editForm.trainerIds.includes(t.id);
                  return (
                    <button key={t.id} type="button" onClick={() => toggleInForm('trainerIds', t.id)}
                      style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '10px 12px', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setEditMode(false)} disabled={processing} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '10px 20px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
            <button onClick={saveEdit} disabled={processing} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Save</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: BRAND.grey, padding: '20px', border: `1px solid #333`, borderTop: `3px solid ${BRAND.orange}` }}>
            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progress</div>
            <div className="display-font" style={{ fontSize: '32px', color: BRAND.orange, marginTop: '4px', lineHeight: 1 }}>
              {hiredCount}<span style={{ color: '#666', fontSize: '20px' }}>/{totalCount}</span>
            </div>
            <div style={{ marginTop: '8px', height: '6px', background: '#1a1a1a' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: BRAND.orange }} />
            </div>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{pct.toFixed(0)}% hired</div>
          </div>
          {rec.applicationDeadline && (
            <div style={{ background: BRAND.grey, padding: '20px', border: `1px solid #333`, borderTop: `3px solid ${BRAND.yellow}` }}>
              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Deadline</div>
              <div className="display-font" style={{ fontSize: '18px', color: BRAND.yellow, marginTop: '4px', lineHeight: 1.2 }}>
                {formatDate(rec.applicationDeadline)}
              </div>
            </div>
          )}
          {rec.classStartDate && (
            <div style={{ background: BRAND.grey, padding: '20px', border: `1px solid #333`, borderTop: `3px solid ${BRAND.red}` }}>
              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Class starts</div>
              <div className="display-font" style={{ fontSize: '18px', color: BRAND.red, marginTop: '4px', lineHeight: 1.2 }}>
                {formatDate(rec.classStartDate)}
              </div>
            </div>
          )}
          <div style={{ background: BRAND.grey, padding: '20px', border: `1px solid #333`, borderTop: `3px solid ${recruitmentStatusColor(rec.status)}` }}>
            <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {['Initiated', 'Live', 'Completed'].map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  style={{
                    background: rec.status === s ? recruitmentStatusColor(s) : 'transparent',
                    color: rec.status === s ? BRAND.black : BRAND.white,
                    border: `1px solid ${rec.status === s ? recruitmentStatusColor(s) : '#555'}`,
                    padding: '4px 8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  }}>
                  {rec.status === s && <Check size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <InfoPill icon={UserCog} label={`Recruiters (${assignedRecruiters.length})`}>
          {assignedRecruiters.length > 0
            ? <span style={{ fontWeight: 700 }}>{assignedRecruiters.map(r => r.name).join(', ')}</span>
            : <em style={{ color: '#666' }}>None</em>}
        </InfoPill>
        <InfoPill icon={Briefcase} label={`Trainers (${assignedTrainers.length})`}>
          {assignedTrainers.length > 0
            ? <span style={{ fontWeight: 700 }}>{assignedTrainers.map(t => t.name).join(', ')}</span>
            : <em style={{ color: '#666' }}>None</em>}
        </InfoPill>
      </div>

      {/* Candidate slots — UPDATED with Convert button */}
      <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 className="display-font" style={{ margin: 0, fontSize: '20px' }}>
            Candidate slots ({rec.candidates?.length || 0})
          </h3>
          <button onClick={onAddSlots}
            style={{ background: 'transparent', color: BRAND.orange, border: `1px solid ${BRAND.orange}`, padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={12} /> Add slots
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
          {(rec.candidates || []).map(slot => {
            const linkedAgent = slot.agentId ? agents.find(a => a.id === slot.agentId) : null;
            const isHired = slot.status === 'hired';
            return (
              <div key={slot.slotNumber} style={{
                background: BRAND.black,
                border: `1px solid ${isHired ? BRAND.orange : '#333'}`,
                borderLeft: `3px solid ${isHired ? BRAND.orange : '#555'}`,
                padding: '12px 14px',
                position: 'relative',
              }}>
                {!isHired && (
                  <button onClick={() => onRemoveSlot(slot)}
                    title="Remove this empty slot"
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = BRAND.red}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                    <X size={14} />
                  </button>
                )}
                <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Slot #{slot.slotNumber}
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '4px', color: isHired ? BRAND.orange : '#999', fontStyle: isHired ? 'normal' : 'italic' }}>
                  {isHired ? (linkedAgent?.name || slot.hiredName || 'Hired') : `Candidate ${slot.slotNumber}`}
                </div>
                <div style={{ marginTop: '10px' }}>
                  {!isHired ? (
                    <button onClick={() => onConvertSlot(slot)}
                      style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '6px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}>
                      <UserPlus size={11} /> Convert
                    </button>
                  ) : (
                    <button onClick={() => onRevertSlot(slot)}
                      style={{ background: 'transparent', color: BRAND.orange, border: `1px solid ${BRAND.orange}`, padding: '6px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}>
                      <Check size={11} /> Hired · Manage
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {(rec.candidates || []).length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>No slots</div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewRecruitmentModal({ recruiters, trainers, onClose }) {
  const [form, setForm] = useState({
    name: '', market: 'DK', targetCount: 10,
    applicationDeadline: '', classStartDate: '',
    recruiterIds: [], trainerIds: [],
  });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const availableRecruiters = recruiters.filter(r => r.market === form.market);
  const availableTrainers = trainers.filter(t => t.market === form.market);

  const toggleInForm = (field, id) => {
    const current = form[field] || [];
    setForm({ ...form, [field]: current.includes(id) ? current.filter(x => x !== id) : [...current, id] });
  };

  const save = async () => {
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.targetCount || form.targetCount < 1) { setError('Target must be at least 1'); return; }
    setProcessing(true);
    try { await createRecruitment(form); onClose(); }
    catch (err) { setError(err.message); setProcessing(false); }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()} wide>
      <h3 className="display-font" style={{ margin: 0, fontSize: '24px' }}>New recruitment</h3>
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <FormField label="Recruitment name *" required value={form.name} onChange={(v) => setForm({...form, name: v})} placeholder="e.g. DK Spring intake 2026" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <FormLabel>Market *</FormLabel>
            <select value={form.market} onChange={(e) => setForm({...form, market: e.target.value, recruiterIds: [], trainerIds: []})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
              {['DK', 'NO', 'SE', 'FI'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <FormLabel>Target hires *</FormLabel>
            <input type="number" min="1" max="100" value={form.targetCount}
              onChange={(e) => setForm({...form, targetCount: parseInt(e.target.value) || 0})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <FormLabel>Application deadline</FormLabel>
            <input type="date" value={form.applicationDeadline} onChange={(e) => setForm({...form, applicationDeadline: e.target.value})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
          </div>
          <div>
            <FormLabel>Class start date</FormLabel>
            <input type="date" value={form.classStartDate} onChange={(e) => setForm({...form, classStartDate: e.target.value})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
          </div>
        </div>
        <div>
          <FormLabel>Recruiters (market: {form.market})</FormLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: BRAND.black, border: `1px solid #444`, minHeight: '40px' }}>
            {availableRecruiters.map(r => {
              const isChecked = form.recruiterIds.includes(r.id);
              return (
                <button key={r.id} type="button" onClick={() => toggleInForm('recruiterIds', r.id)}
                  style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>
                  {r.name}
                </button>
              );
            })}
            {availableRecruiters.length === 0 && <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>No recruiters for {form.market}</span>}
          </div>
        </div>
        <div>
          <FormLabel>Trainers (market: {form.market})</FormLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: BRAND.black, border: `1px solid #444`, minHeight: '40px' }}>
            {availableTrainers.map(t => {
              const isChecked = form.trainerIds.includes(t.id);
              return (
                <button key={t.id} type="button" onClick={() => toggleInForm('trainerIds', t.id)}
                  style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>
                  {t.name}
                </button>
              );
            })}
            {availableTrainers.length === 0 && <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>No trainers for {form.market}</span>}
          </div>
        </div>
      </div>
      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '10px 12px', fontSize: '12px', marginTop: '12px' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing} style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>
          {processing ? 'Creating...' : 'Create'}
        </button>
      </div>
    </ModalShell>
  );
}

// ============ COURSES (C2) ============

function CourseListView({ courses, courseTypes, trainers, setSelectedCourse, onNewCourse }) {
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [trainerFilter, setTrainerFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return courses.filter(c => {
      if (marketFilter !== 'ALL' && c.market !== marketFilter) return false;
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (typeFilter !== 'ALL') {
        if (typeFilter === 'NONE' && c.courseTypeId) return false;
        if (typeFilter !== 'NONE' && c.courseTypeId !== typeFilter) return false;
      }
      if (trainerFilter !== 'ALL') {
        if (trainerFilter === 'NONE' && c.trainerId) return false;
        if (trainerFilter !== 'NONE' && c.trainerId !== trainerFilter) return false;
      }
      return true;
    });
  }, [courses, marketFilter, statusFilter, typeFilter, trainerFilter]);

  const hasFilters = marketFilter !== 'ALL' || statusFilter !== 'ALL' || typeFilter !== 'ALL' || trainerFilter !== 'ALL';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            Courses · {courses.length} total
          </div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
            Course <span style={{ color: BRAND.orange }}>schedule</span>
          </h2>
        </div>
        <button onClick={onNewCourse} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> New course
        </button>
      </div>

      <div style={{ background: BRAND.grey, padding: '16px', border: `1px solid #333`, marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <FilterLabel>Market</FilterLabel>
          <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option><option value="DK">DK</option><option value="NO">NO</option><option value="SE">SE</option><option value="FI">FI</option>
          </select>
        </div>
        <div>
          <FilterLabel>Type</FilterLabel>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option>
            <option value="NONE">No type</option>
            {courseTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
          </select>
        </div>
        <div>
          <FilterLabel>Status</FilterLabel>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option>
            <option value="Planned">Planned</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <FilterLabel>Trainer</FilterLabel>
          <select value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option><option value="NONE">None</option>
            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button onClick={() => { setMarketFilter('ALL'); setStatusFilter('ALL'); setTypeFilter('ALL'); setTrainerFilter('ALL'); }}
            style={{ background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red, padding: '8px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', height: '34px' }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {filtered.map(c => {
          const courseType = courseTypes.find(ct => ct.id === c.courseTypeId);
          const trainer = trainers.find(t => t.id === c.trainerId);
          const enrolledCount = (c.enrolledAgentIds || []).length;

          return (
            <div key={c.id} onClick={() => setSelectedCourse(c.id)} className="hover-lift"
              style={{ background: BRAND.grey, border: `1px solid #333`, borderTop: `3px solid ${courseStatusColor(c.status)}`, padding: '20px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 className="display-font" style={{ margin: 0, fontSize: '20px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</h3>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                    {c.market} {courseType && <>· {courseType.name}</>}
                  </div>
                </div>
                <span style={{ fontSize: '9px', padding: '3px 8px', background: courseStatusColor(c.status), color: BRAND.black, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {c.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginBottom: '12px' }}>
                {c.startDate && (
                  <div>
                    <div style={{ color: '#999', textTransform: 'uppercase' }}>Starts</div>
                    <div style={{ fontWeight: 700 }}>{formatDate(c.startDate)}</div>
                  </div>
                )}
                {c.endDate && (
                  <div>
                    <div style={{ color: '#999', textTransform: 'uppercase' }}>Ends</div>
                    <div style={{ fontWeight: 700 }}>{formatDate(c.endDate)}</div>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '12px', borderTop: `1px solid #333`, fontSize: '11px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ color: '#bbb' }}>
                  <Briefcase size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: BRAND.orange }} />
                  {trainer ? trainer.name : <em style={{ color: '#666' }}>No trainer</em>}
                </div>
                <div style={{ color: '#bbb' }}>
                  <Users size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: BRAND.orange }} />
                  <strong style={{ color: BRAND.orange }}>{enrolledCount}</strong> enrolled
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#666', fontStyle: 'italic', background: BRAND.grey, border: `1px solid #333` }}>
            {courses.length === 0 ? 'No courses yet — click "New course" to schedule your first one.' : 'No courses match filters.'}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ TIME LOGS (C5) ============

function TimeLogsPanel({ parentType, parentId, parentStatus, isLocked, session, onAddLog }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!parentId) return;
    return subscribeTimeLogs(parentType, parentId, setLogs);
  }, [parentType, parentId]);

  const totalHours = logs.reduce((sum, l) => sum + (l.hours || 0), 0);

  const handleDelete = async (log) => {
    if (!confirm(`Delete this time log entry?\n\n${log.date} · ${log.hours}h${log.note ? ' · ' + log.note : ''}`)) return;
    try {
      setError('');
      await deleteTimeLog(parentType, parentId, log.id);
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333`, marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="display-font" style={{ margin: 0, fontSize: '20px' }}>
            Time logs
          </h3>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            <span style={{ color: BRAND.orange, fontWeight: 700, fontSize: '14px' }}>{totalHours.toFixed(1)}h</span> total · {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
        {!isLocked && (
          <button onClick={onAddLog}
            style={{ background: 'transparent', color: BRAND.orange, border: `1px solid ${BRAND.orange}`, padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} /> Log time
          </button>
        )}
      </div>

      {isLocked && (
        <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', marginBottom: '10px' }}>
          {parentStatus === 'Completed' ? 'Completed — time logging closed.' : 'Cancelled — time logging closed.'}
        </div>
      )}

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '6px 10px', fontSize: '11px', marginBottom: '10px' }}>{error}</div>}

      {logs.length === 0 ? (
        <em style={{ color: '#666', fontSize: '12px' }}>No time logged yet.</em>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {logs.map(log => (
            <div key={log.id}
              style={{ background: BRAND.black, padding: '10px 12px', borderLeft: `3px solid ${BRAND.orange}`, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: BRAND.orange }}>{log.hours}h</span>
                  <span style={{ fontSize: '11px', color: '#999' }}>{formatDate(log.date)}</span>
                  <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>by {log.createdBy || 'Unknown'}</span>
                </div>
                {log.note && (
                  <div style={{ fontSize: '12px', color: '#bbb', marginTop: '4px', lineHeight: 1.4 }}>{log.note}</div>
                )}
              </div>
              <button onClick={() => handleDelete(log)} title="Delete entry"
                style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => e.currentTarget.style.color = BRAND.red}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimeLogModal({ parentType, parentId, parentLabel, session, onClose }) {
  const todayIso = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: todayIso,
    hours: '',
    note: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError(''); setProcessing(true);
    try {
      await addTimeLog(parentType, parentId, {
        date: form.date,
        hours: form.hours,
        note: form.note,
        createdBy: session.displayName,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log time');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()}>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>Log time</h3>
      <div style={{ marginTop: '8px', color: '#bbb', fontSize: '12px' }}>
        Logging time for <strong style={{ color: BRAND.orange }}>{parentLabel}</strong>.
      </div>

      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
        <div>
          <FormLabel>Date *</FormLabel>
          <input type="date" value={form.date} max={todayIso} onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', colorScheme: 'dark' }} />
        </div>
        <div>
          <FormLabel>Hours *</FormLabel>
          <input type="number" step="0.25" min="0.25" max="24" value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
            placeholder="e.g. 1.5"
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <FormLabel>Note (optional)</FormLabel>
        <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="What did you work on?"
          rows={3}
          style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' }} />
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '12px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing || !form.hours}
          style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: (processing || !form.hours) ? 'not-allowed' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', opacity: !form.hours ? 0.5 : 1 }}>
          {processing ? 'Saving...' : 'Save'}
        </button>
      </div>
    </ModalShell>
  );
}

function CourseDetailView({ courseId, courses, courseTypes, trainers, agents, skills, session, onBack, onEnroll, onEdit, onDelete, onLogTime, onJumpToAgent }) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;

  const courseType = courseTypes.find(ct => ct.id === course.courseTypeId);
  const trainer = trainers.find(t => t.id === course.trainerId);
  const enrolledAgents = (course.enrolledAgentIds || []).map(id => agents.find(a => a.id === id)).filter(Boolean);
  const courseSkills = skills.filter(s => (course.skillIds || []).includes(s.id));

  const [statusError, setStatusError] = useState('');
  const [unenrollError, setUnenrollError] = useState('');

  const handleStatusChange = async (newStatus) => {
    if (newStatus === course.status) return;
    if (newStatus === 'Completed') {
      const skillCount = (course.skillIds || []).length;
      const agentCount = enrolledAgents.length;
      const msg = skillCount > 0 && agentCount > 0
        ? `Mark course as Completed?\n\nThis will award ${skillCount} skill(s) to ${agentCount} enrolled agent(s) (skipping anyone who already has them) and add a timeline event for each.`
        : agentCount === 0
          ? 'Mark course as Completed?\n\nNo agents are enrolled, so no skills will be awarded.'
          : 'Mark course as Completed?\n\nNo skills are configured, so nothing will be awarded.';
      if (!confirm(msg)) return;
    }
    if (newStatus === 'Cancelled' && course.status === 'Completed') {
      if (!confirm('Move from Completed back to Cancelled?\n\nSkills already awarded to agents will NOT be removed.')) return;
    }
    try {
      setStatusError('');
      await setCourseStatus(courseId, newStatus, session.displayName);
    } catch (err) {
      setStatusError(err.message || 'Failed to change status');
    }
  };

  const handleUnenroll = async (agent) => {
    if (!confirm(`Remove ${agent.name} from this course?`)) return;
    try {
      setUnenrollError('');
      await unenrollAgentFromCourse(courseId, agent.id, course.name, session.displayName);
    } catch (err) {
      setUnenrollError(err.message || 'Failed to unenroll');
    }
  };

  const isLocked = course.status === 'Completed' || course.status === 'Cancelled';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>← Back</button>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={onEdit} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Edit3 size={12} /> Edit
          </button>
          <button onClick={onDelete} style={{ background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', background: BRAND.orange, color: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="display-font">
          <BookOpen size={36} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            {course.market}{courseType && <> · {courseType.name}</>}
          </div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '4px 0 0', lineHeight: 1 }}>{course.name}</h2>
          <div style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
            <span style={{ background: courseStatusColor(course.status), color: BRAND.black, padding: '2px 8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginRight: '8px' }}>
              {course.status}
            </span>
            {enrolledAgents.length} enrolled · {courseSkills.length} skills
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <InfoPill icon={Briefcase} label="Trainer">
          {trainer ? <span style={{ fontWeight: 700 }}>{trainer.name}</span> : <em style={{ color: '#666' }}>Not assigned</em>}
        </InfoPill>
        <InfoPill icon={Calendar} label="Start date">
          {course.startDate ? <span style={{ fontWeight: 700 }}>{formatDate(course.startDate)}</span> : <em style={{ color: '#666' }}>Not set</em>}
        </InfoPill>
        <InfoPill icon={Calendar} label="End date">
          {course.endDate ? <span style={{ fontWeight: 700 }}>{formatDate(course.endDate)}</span> : <em style={{ color: '#666' }}>Not set</em>}
        </InfoPill>
      </div>

      {/* Status switcher */}
      <div style={{ background: BRAND.grey, padding: '16px 20px', border: `1px solid #333`, marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Status</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Planned', 'In progress', 'Completed', 'Cancelled'].map(s => {
              const isActive = course.status === s;
              return (
                <button key={s} onClick={() => handleStatusChange(s)} disabled={isActive}
                  style={{ background: isActive ? courseStatusColor(s) : 'transparent', color: isActive ? BRAND.black : '#bbb', border: `1px solid ${isActive ? courseStatusColor(s) : '#555'}`, padding: '6px 12px', cursor: isActive ? 'default' : 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        {statusError && <div style={{ background: BRAND.red, color: BRAND.white, padding: '6px 10px', fontSize: '11px', marginTop: '10px' }}>{statusError}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '20px' }}>
            Skills awarded on completion ({courseSkills.length})
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {courseSkills.map(s => (
              <span key={s.id} style={{ fontSize: '11px', padding: '4px 10px', background: BRAND.black, color: BRAND.orange, border: `1px solid ${BRAND.orange}`, fontWeight: 700 }}>{s.name}</span>
            ))}
            {courseSkills.length === 0 && <em style={{ color: '#666', fontSize: '12px' }}>No skills will be assigned at completion.</em>}
          </div>
        </div>

        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="display-font" style={{ margin: 0, fontSize: '20px' }}>
              Enrolled agents ({enrolledAgents.length})
            </h3>
            {!isLocked && (
              <button onClick={onEnroll}
                style={{ background: 'transparent', color: BRAND.orange, border: `1px solid ${BRAND.orange}`, padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={12} /> Enroll
              </button>
            )}
          </div>
          {isLocked && (
            <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', marginBottom: '10px' }}>
              Course is {course.status.toLowerCase()} — enrollment locked.
            </div>
          )}
          {unenrollError && <div style={{ background: BRAND.red, color: BRAND.white, padding: '6px 10px', fontSize: '11px', marginBottom: '10px' }}>{unenrollError}</div>}
          {enrolledAgents.length === 0 ? (
            <em style={{ color: '#666', fontSize: '12px' }}>No agents enrolled yet.</em>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {enrolledAgents.map(a => (
                <div key={a.id} style={{ background: BRAND.black, padding: '8px 12px', borderLeft: `3px solid ${BRAND.orange}`, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div onClick={() => onJumpToAgent && onJumpToAgent(a.id)}
                    style={{ cursor: onJumpToAgent ? 'pointer' : 'default', flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{a.name}</div>
                    <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.market} · {a.status}</div>
                  </div>
                  {!isLocked && (
                    <button onClick={() => handleUnenroll(a)} title="Remove from course"
                      style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = BRAND.red}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TimeLogsPanel parentType="course" parentId={courseId} parentStatus={course.status}
        isLocked={course.status === 'Completed' || course.status === 'Cancelled'}
        session={session} onAddLog={onLogTime} />
    </div>
  );
}

function NewCourseModal({ courseTypes, trainers, skills, onClose, preset }) {
  const [form, setForm] = useState({
    name: preset?.name || '',
    courseTypeId: preset?.courseTypeId || '',
    market: preset?.market || 'DK',
    trainerId: preset?.trainerId || '',
    startDate: preset?.startDate || '',
    endDate: preset?.endDate || '',
    skillIds: preset?.skillIds || [],
  });
  const [skillsTouched, setSkillsTouched] = useState(!!preset?.skillIds?.length);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // When user picks a course type, pre-fill skills with the type's defaults
  // — but only if the user hasn't manually toggled skills yet.
  const handleTypeChange = (typeId) => {
    const type = courseTypes.find(ct => ct.id === typeId);
    if (type && !skillsTouched) {
      setForm({ ...form, courseTypeId: typeId, skillIds: type.defaultSkillIds || [] });
    } else {
      setForm({ ...form, courseTypeId: typeId });
    }
  };

  const toggleSkill = (skillId) => {
    setSkillsTouched(true);
    const has = form.skillIds.includes(skillId);
    setForm({ ...form, skillIds: has ? form.skillIds.filter(s => s !== skillId) : [...form.skillIds, skillId] });
  };

  // Trainers are filtered to the selected market
  const availableTrainers = trainers.filter(t => t.market === form.market);

  // If user changes market and the picked trainer is no longer in that market, clear the trainer
  const handleMarketChange = (newMarket) => {
    const stillValid = trainers.find(t => t.id === form.trainerId && t.market === newMarket);
    setForm({ ...form, market: newMarket, trainerId: stillValid ? form.trainerId : '' });
  };

  const save = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('End date cannot be before start date'); return;
    }
    setError(''); setProcessing(true);
    try {
      const payload = { ...form };
      if (preset?.recruitmentId) payload.recruitmentId = preset.recruitmentId;
      const newCourseId = await createCourse(payload);
      // If this course was created from a recruitment, auto-enroll the hired agents
      if (preset?.enrolledAgentIds && preset.enrolledAgentIds.length > 0 && preset?.actorName) {
        await enrollAgentsOnCourse(newCourseId, preset.enrolledAgentIds, form.name, preset.actorName);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create course');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()} wide>
      <h3 className="display-font" style={{ margin: 0, fontSize: '24px' }}>New course</h3>
      <div style={{ marginTop: '6px', color: '#bbb', fontSize: '12px' }}>
        Schedule a course. Status starts as <strong>Planned</strong>; you can move it forward later.
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <FormField label="Name *" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Onboarding April 2026" />
        <div>
          <FormLabel>Market *</FormLabel>
          <select value={form.market} onChange={(e) => handleMarketChange(e.target.value)} disabled={!!preset}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: preset ? '#888' : BRAND.white, fontFamily: 'inherit', cursor: preset ? 'not-allowed' : 'pointer' }}>
            {['DK', 'NO', 'SE', 'FI'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {preset && <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>Inherited from recruitment</div>}
        </div>
      </div>

      {preset?.enrolledAgentIds?.length > 0 && (
        <div style={{ marginTop: '14px', padding: '10px 14px', background: BRAND.black, borderLeft: `3px solid ${BRAND.orange}`, fontSize: '11px', color: '#bbb', lineHeight: 1.5 }}>
          <strong style={{ color: BRAND.orange }}>{preset.enrolledAgentIds.length} agent(s)</strong> from this recruitment will be auto-enrolled when the course is created.
        </div>
      )}

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <FormLabel>Course type</FormLabel>
          <select value={form.courseTypeId} onChange={(e) => handleTypeChange(e.target.value)}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="">— No type —</option>
            {courseTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
          </select>
        </div>
        <div>
          <FormLabel>Trainer</FormLabel>
          <select value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="">— Unassigned —</option>
            {availableTrainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {availableTrainers.length === 0 && <div style={{ fontSize: '10px', color: BRAND.yellow, marginTop: '4px' }}>No trainers in market {form.market}</div>}
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <FormLabel>Start date</FormLabel>
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', colorScheme: 'dark' }} />
        </div>
        <div>
          <FormLabel>End date</FormLabel>
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', colorScheme: 'dark' }} />
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <FormLabel>Skills awarded on completion</FormLabel>
        <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px', lineHeight: 1.4 }}>
          {form.courseTypeId
            ? (skillsTouched ? 'Customised for this course.' : `Pre-filled from "${courseTypes.find(ct => ct.id === form.courseTypeId)?.name || 'type'}" — toggle to customise.`)
            : 'Pick the skills agents will receive when this course is completed.'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: BRAND.black, border: `1px solid #444`, maxHeight: '160px', overflowY: 'auto' }}>
          {skills.length === 0 && <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>No skills defined yet</span>}
          {skills.map(s => {
            const isChecked = form.skillIds.includes(s.id);
            return (
              <button key={s.id} type="button" onClick={() => toggleSkill(s.id)}
                style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>{s.name}</button>
            );
          })}
        </div>
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '14px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing}
          style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>
          {processing ? 'Creating...' : 'Create course'}
        </button>
      </div>
    </ModalShell>
  );
}

function EnrollAgentsModal({ courseId, courses, agents, session, onClose }) {
  const course = courses.find(c => c.id === courseId);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!course) return null;

  // Eligible: same market, not already enrolled
  const enrolled = new Set(course.enrolledAgentIds || []);
  const eligible = useMemo(() => {
    return agents
      .filter(a => a.market === course.market && !enrolled.has(a.id))
      .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [agents, course.market, search]);

  const toggle = (agentId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId); else next.add(agentId);
      return next;
    });
  };

  const save = async () => {
    if (selected.size === 0) { setError('Pick at least one agent'); return; }
    setError(''); setProcessing(true);
    try {
      await enrollAgentsOnCourse(courseId, Array.from(selected), course.name, session.displayName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to enroll');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()} wide>
      <h3 className="display-font" style={{ margin: 0, fontSize: '24px' }}>Enroll agents</h3>
      <div style={{ marginTop: '6px', color: '#bbb', fontSize: '12px' }}>
        Adding agents to <strong style={{ color: BRAND.orange }}>{course.name}</strong> ({course.market}). Only agents from {course.market} are shown.
      </div>

      <div style={{ marginTop: '16px', position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#666' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          style={{ width: '100%', padding: '10px 10px 10px 32px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', fontSize: '13px' }} />
      </div>

      <div style={{ marginTop: '12px', maxHeight: '320px', overflowY: 'auto', background: BRAND.black, border: `1px solid #333` }}>
        {eligible.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontStyle: 'italic', fontSize: '12px' }}>
            {search ? 'No agents match search.' : `No eligible agents in ${course.market}.`}
          </div>
        ) : eligible.map(a => {
          const isChecked = selected.has(a.id);
          return (
            <div key={a.id} onClick={() => toggle(a.id)}
              style={{ padding: '10px 14px', borderTop: `1px solid #222`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isChecked ? '#1a1a1a' : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isChecked
                  ? <CheckSquare size={16} color={BRAND.orange} />
                  : <Square size={16} color="#555" />}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{a.name}</div>
                  <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.market} · {a.status}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '12px', fontSize: '11px', color: '#999' }}>
        <strong style={{ color: BRAND.orange }}>{selected.size}</strong> selected of {eligible.length} eligible
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '12px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing || selected.size === 0}
          style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: (processing || selected.size === 0) ? 'not-allowed' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', opacity: selected.size === 0 ? 0.5 : 1 }}>
          {processing ? 'Enrolling...' : `Enroll ${selected.size > 0 ? selected.size : ''}`.trim()}
        </button>
      </div>
    </ModalShell>
  );
}

function EditCourseModal({ courseId, courses, courseTypes, trainers, skills, onClose }) {
  const course = courses.find(c => c.id === courseId);
  const [form, setForm] = useState({
    name: course?.name || '',
    courseTypeId: course?.courseTypeId || '',
    trainerId: course?.trainerId || '',
    startDate: course?.startDate || '',
    endDate: course?.endDate || '',
    skillIds: course?.skillIds || [],
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!course) return null;

  const availableTrainers = trainers.filter(t => t.market === course.market);

  const toggleSkill = (skillId) => {
    const has = form.skillIds.includes(skillId);
    setForm({ ...form, skillIds: has ? form.skillIds.filter(s => s !== skillId) : [...form.skillIds, skillId] });
  };

  const save = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('End date cannot be before start date'); return;
    }
    setError(''); setProcessing(true);
    try {
      await updateCourse(courseId, form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update course');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()} wide>
      <h3 className="display-font" style={{ margin: 0, fontSize: '24px' }}>Edit course</h3>
      <div style={{ marginTop: '6px', color: '#bbb', fontSize: '12px' }}>
        Editing <strong style={{ color: BRAND.orange }}>{course.name}</strong>. Market is locked to {course.market}.
      </div>

      <div style={{ marginTop: '20px' }}>
        <FormField label="Name *" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Course name" />
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <FormLabel>Course type</FormLabel>
          <select value={form.courseTypeId} onChange={(e) => setForm({ ...form, courseTypeId: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="">— No type —</option>
            {courseTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
          </select>
        </div>
        <div>
          <FormLabel>Trainer</FormLabel>
          <select value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="">— Unassigned —</option>
            {availableTrainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {availableTrainers.length === 0 && <div style={{ fontSize: '10px', color: BRAND.yellow, marginTop: '4px' }}>No trainers in market {course.market}</div>}
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <FormLabel>Start date</FormLabel>
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', colorScheme: 'dark' }} />
        </div>
        <div>
          <FormLabel>End date</FormLabel>
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', colorScheme: 'dark' }} />
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <FormLabel>Skills awarded on completion</FormLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: BRAND.black, border: `1px solid #444`, maxHeight: '160px', overflowY: 'auto' }}>
          {skills.length === 0 && <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>No skills defined yet</span>}
          {skills.map(s => {
            const isChecked = form.skillIds.includes(s.id);
            return (
              <button key={s.id} type="button" onClick={() => toggleSkill(s.id)}
                style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>{s.name}</button>
            );
          })}
        </div>
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '14px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing}
          style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>
          {processing ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </ModalShell>
  );
}

// ============ UPSKILLS (C4) ============

function upskillLabel(u, skills) {
  if (u.name && u.name.trim()) return u.name;
  const skill = skills.find(s => s.id === u.skillId);
  return skill ? skill.name : 'Untitled upskill';
}

function UpskillListView({ upskills, skills, trainers, setSelectedUpskill, onNewUpskill }) {
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trainerFilter, setTrainerFilter] = useState('ALL');
  const [skillFilter, setSkillFilter] = useState('ALL');

  const filtered = useMemo(() => {
    return upskills.filter(u => {
      if (marketFilter !== 'ALL' && u.market !== marketFilter) return false;
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      if (trainerFilter !== 'ALL') {
        if (trainerFilter === 'NONE' && u.trainerId) return false;
        if (trainerFilter !== 'NONE' && u.trainerId !== trainerFilter) return false;
      }
      if (skillFilter !== 'ALL' && u.skillId !== skillFilter) return false;
      return true;
    });
  }, [upskills, marketFilter, statusFilter, trainerFilter, skillFilter]);

  const hasFilters = marketFilter !== 'ALL' || statusFilter !== 'ALL' || trainerFilter !== 'ALL' || skillFilter !== 'ALL';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            Upskills · {upskills.length} total
          </div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
            Upskill <span style={{ color: BRAND.orange }}>tasks</span>
          </h2>
        </div>
        <button onClick={onNewUpskill} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> New upskill
        </button>
      </div>

      <div style={{ background: BRAND.grey, padding: '16px', border: `1px solid #333`, marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <FilterLabel>Market</FilterLabel>
          <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option><option value="DK">DK</option><option value="NO">NO</option><option value="SE">SE</option><option value="FI">FI</option>
          </select>
        </div>
        <div>
          <FilterLabel>Skill</FilterLabel>
          <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <FilterLabel>Status</FilterLabel>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option>
            <option value="Planned">Planned</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <FilterLabel>Trainer</FilterLabel>
          <select value={trainerFilter} onChange={(e) => setTrainerFilter(e.target.value)} style={filterSelectStyle}>
            <option value="ALL">All</option><option value="NONE">None</option>
            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button onClick={() => { setMarketFilter('ALL'); setStatusFilter('ALL'); setTrainerFilter('ALL'); setSkillFilter('ALL'); }}
            style={{ background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red, padding: '8px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', height: '34px' }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {filtered.map(u => {
          const skill = skills.find(s => s.id === u.skillId);
          const trainer = trainers.find(t => t.id === u.trainerId);
          const agentCount = (u.agentIds || []).length;
          const label = upskillLabel(u, skills);

          return (
            <div key={u.id} onClick={() => setSelectedUpskill(u.id)} className="hover-lift"
              style={{ background: BRAND.grey, border: `1px solid #333`, borderTop: `3px solid ${courseStatusColor(u.status)}`, padding: '20px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 className="display-font" style={{ margin: 0, fontSize: '18px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</h3>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
                    {u.market}{skill && <> · {skill.name}</>}
                  </div>
                </div>
                <span style={{ fontSize: '9px', padding: '3px 8px', background: courseStatusColor(u.status), color: BRAND.black, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {u.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginBottom: '12px' }}>
                {u.startDate && (
                  <div>
                    <div style={{ color: '#999', textTransform: 'uppercase' }}>Starts</div>
                    <div style={{ fontWeight: 700 }}>{formatDate(u.startDate)}</div>
                  </div>
                )}
                {u.deadline && (
                  <div>
                    <div style={{ color: '#999', textTransform: 'uppercase' }}>Deadline</div>
                    <div style={{ fontWeight: 700 }}>{formatDate(u.deadline)}</div>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '12px', borderTop: `1px solid #333`, fontSize: '11px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ color: '#bbb' }}>
                  <Briefcase size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: BRAND.orange }} />
                  {trainer ? trainer.name : <em style={{ color: '#666' }}>No trainer</em>}
                </div>
                <div style={{ color: '#bbb' }}>
                  <Users size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: BRAND.orange }} />
                  <strong style={{ color: BRAND.orange }}>{agentCount}</strong> agent{agentCount === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#666', fontStyle: 'italic', background: BRAND.grey, border: `1px solid #333` }}>
            {upskills.length === 0 ? 'No upskill tasks yet — click "New upskill" to assign your first one.' : 'No upskills match filters.'}
          </div>
        )}
      </div>
    </div>
  );
}

function UpskillDetailView({ upskillId, upskills, skills, trainers, agents, session, onBack, onAddAgents, onEdit, onDelete, onLogTime, onJumpToAgent }) {
  const upskill = upskills.find(u => u.id === upskillId);
  const [statusError, setStatusError] = useState('');
  const [removeError, setRemoveError] = useState('');

  if (!upskill) return null;

  const skill = skills.find(s => s.id === upskill.skillId);
  const trainer = trainers.find(t => t.id === upskill.trainerId);
  const assignedAgents = (upskill.agentIds || []).map(id => agents.find(a => a.id === id)).filter(Boolean);
  const label = upskillLabel(upskill, skills);
  const isLocked = upskill.status === 'Completed' || upskill.status === 'Cancelled';

  const handleStatusChange = async (newStatus) => {
    if (newStatus === upskill.status) return;
    if (newStatus === 'Completed') {
      const agentCount = assignedAgents.length;
      const skillName = skill?.name || 'the skill';
      const msg = agentCount > 0
        ? `Mark upskill as Completed?\n\nThis will award "${skillName}" to ${agentCount} agent(s) (skipping anyone who already has it) and add a timeline event for each.`
        : 'Mark upskill as Completed?\n\nNo agents are assigned, so no skill will be awarded.';
      if (!confirm(msg)) return;
    }
    if (newStatus === 'Cancelled' && upskill.status === 'Completed') {
      if (!confirm('Move from Completed back to Cancelled?\n\nSkills already awarded to agents will NOT be removed.')) return;
    }
    try {
      setStatusError('');
      await setUpskillStatus(upskillId, newStatus, session.displayName);
    } catch (err) {
      setStatusError(err.message || 'Failed to change status');
    }
  };

  const handleRemove = async (agent) => {
    if (!confirm(`Remove ${agent.name} from this upskill?`)) return;
    try {
      setRemoveError('');
      await removeAgentFromUpskill(upskillId, agent.id, label, session.displayName);
    } catch (err) {
      setRemoveError(err.message || 'Failed to remove');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>← Back</button>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={onEdit} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Edit3 size={12} /> Edit
          </button>
          <button onClick={onDelete} style={{ background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red, padding: '6px 14px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', background: BRAND.orange, color: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="display-font">
          <Zap size={36} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
            {upskill.market}{skill && <> · {skill.name}</>}
          </div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '4px 0 0', lineHeight: 1 }}>{label}</h2>
          <div style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
            <span style={{ background: courseStatusColor(upskill.status), color: BRAND.black, padding: '2px 8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginRight: '8px' }}>
              {upskill.status}
            </span>
            {assignedAgents.length} agent{assignedAgents.length === 1 ? '' : 's'} assigned
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <InfoPill icon={Briefcase} label="Trainer">
          {trainer ? <span style={{ fontWeight: 700 }}>{trainer.name}</span> : <em style={{ color: '#666' }}>Not assigned</em>}
        </InfoPill>
        <InfoPill icon={Calendar} label="Start date">
          {upskill.startDate ? <span style={{ fontWeight: 700 }}>{formatDate(upskill.startDate)}</span> : <em style={{ color: '#666' }}>Not set</em>}
        </InfoPill>
        <InfoPill icon={Clock} label="Deadline">
          {upskill.deadline ? <span style={{ fontWeight: 700 }}>{formatDate(upskill.deadline)}</span> : <em style={{ color: '#666' }}>Not set</em>}
        </InfoPill>
      </div>

      {/* Status switcher */}
      <div style={{ background: BRAND.grey, padding: '16px 20px', border: `1px solid #333`, marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Status</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Planned', 'In progress', 'Completed', 'Cancelled'].map(s => {
              const isActive = upskill.status === s;
              return (
                <button key={s} onClick={() => handleStatusChange(s)} disabled={isActive}
                  style={{ background: isActive ? courseStatusColor(s) : 'transparent', color: isActive ? BRAND.black : '#bbb', border: `1px solid ${isActive ? courseStatusColor(s) : '#555'}`, padding: '6px 12px', cursor: isActive ? 'default' : 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        {statusError && <div style={{ background: BRAND.red, color: BRAND.white, padding: '6px 10px', fontSize: '11px', marginTop: '10px' }}>{statusError}</div>}
      </div>

      <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 className="display-font" style={{ margin: 0, fontSize: '20px' }}>
            Assigned agents ({assignedAgents.length})
          </h3>
          {!isLocked && (
            <button onClick={onAddAgents}
              style={{ background: 'transparent', color: BRAND.orange, border: `1px solid ${BRAND.orange}`, padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={12} /> Add agents
            </button>
          )}
        </div>
        {isLocked && (
          <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', marginBottom: '10px' }}>
            Upskill is {upskill.status.toLowerCase()} — agent assignment locked.
          </div>
        )}
        {removeError && <div style={{ background: BRAND.red, color: BRAND.white, padding: '6px 10px', fontSize: '11px', marginBottom: '10px' }}>{removeError}</div>}
        {assignedAgents.length === 0 ? (
          <em style={{ color: '#666', fontSize: '12px' }}>No agents assigned yet.</em>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {assignedAgents.map(a => (
              <div key={a.id} style={{ background: BRAND.black, padding: '8px 12px', borderLeft: `3px solid ${BRAND.orange}`, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <div onClick={() => onJumpToAgent && onJumpToAgent(a.id)}
                  style={{ cursor: onJumpToAgent ? 'pointer' : 'default', flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{a.name}</div>
                  <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.market} · {a.status}</div>
                </div>
                {!isLocked && (
                  <button onClick={() => handleRemove(a)} title="Remove from upskill"
                    style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = BRAND.red}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <TimeLogsPanel parentType="upskill" parentId={upskillId} parentStatus={upskill.status}
        isLocked={upskill.status === 'Completed' || upskill.status === 'Cancelled'}
        session={session} onAddLog={onLogTime} />
    </div>
  );
}

function NewUpskillModal({ skills, trainers, agents, session, onClose }) {
  const [form, setForm] = useState({
    name: '',
    skillId: '',
    market: 'DK',
    trainerId: '',
    startDate: '',
    deadline: '',
    agentIds: [],
  });
  const [agentSearch, setAgentSearch] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const availableTrainers = trainers.filter(t => t.market === form.market);
  const availableAgents = useMemo(() => {
    return agents
      .filter(a => a.market === form.market)
      .filter(a => !agentSearch || a.name.toLowerCase().includes(agentSearch.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [agents, form.market, agentSearch]);

  const handleMarketChange = (newMarket) => {
    const stillValidTrainer = trainers.find(t => t.id === form.trainerId && t.market === newMarket);
    const validAgentIds = form.agentIds.filter(id => agents.find(a => a.id === id && a.market === newMarket));
    setForm({
      ...form,
      market: newMarket,
      trainerId: stillValidTrainer ? form.trainerId : '',
      agentIds: validAgentIds,
    });
  };

  const toggleAgent = (agentId) => {
    const has = form.agentIds.includes(agentId);
    setForm({ ...form, agentIds: has ? form.agentIds.filter(id => id !== agentId) : [...form.agentIds, agentId] });
  };

  const save = async () => {
    if (!form.skillId) { setError('Skill is required'); return; }
    if (form.startDate && form.deadline && form.deadline < form.startDate) {
      setError('Deadline cannot be before start date'); return;
    }
    setError(''); setProcessing(true);
    try {
      const newId = await createUpskill(form);
      // Log timeline events for the initial agents
      if (form.agentIds.length > 0) {
        const skill = skills.find(s => s.id === form.skillId);
        const label = (form.name || '').trim() || skill?.name || 'Untitled upskill';
        await addAgentsToUpskill(newId, form.agentIds, label, session.displayName);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create upskill');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()} wide>
      <h3 className="display-font" style={{ margin: 0, fontSize: '24px' }}>New upskill task</h3>
      <div style={{ marginTop: '6px', color: '#bbb', fontSize: '12px' }}>
        Assign one skill to one or more agents under a trainer. Status starts as <strong>Planned</strong>.
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <FormField label="Name (optional)" value={form.name} onChange={(v) => setForm({ ...form, name: v })}
          placeholder="Defaults to the skill name if empty" />
        <div>
          <FormLabel>Market *</FormLabel>
          <select value={form.market} onChange={(e) => handleMarketChange(e.target.value)}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            {['DK', 'NO', 'SE', 'FI'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <FormLabel>Skill *</FormLabel>
          <select value={form.skillId} onChange={(e) => setForm({ ...form, skillId: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="">— Pick a skill —</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <FormLabel>Trainer</FormLabel>
          <select value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="">— Unassigned —</option>
            {availableTrainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {availableTrainers.length === 0 && <div style={{ fontSize: '10px', color: BRAND.yellow, marginTop: '4px' }}>No trainers in market {form.market}</div>}
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <FormLabel>Start date</FormLabel>
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', colorScheme: 'dark' }} />
        </div>
        <div>
          <FormLabel>Deadline</FormLabel>
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', colorScheme: 'dark' }} />
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <FormLabel>Agents to upskill ({form.agentIds.length} selected)</FormLabel>
        <div style={{ position: 'relative', marginBottom: '6px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#666' }} />
          <input value={agentSearch} onChange={(e) => setAgentSearch(e.target.value)}
            placeholder={`Search ${form.market} agents...`}
            style={{ width: '100%', padding: '8px 8px 8px 32px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', fontSize: '12px' }} />
        </div>
        <div style={{ background: BRAND.black, border: `1px solid #444`, maxHeight: '180px', overflowY: 'auto' }}>
          {availableAgents.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontStyle: 'italic', fontSize: '12px' }}>
              {agentSearch ? 'No agents match search.' : `No agents in ${form.market}.`}
            </div>
          ) : availableAgents.map(a => {
            const isChecked = form.agentIds.includes(a.id);
            return (
              <div key={a.id} onClick={() => toggleAgent(a.id)}
                style={{ padding: '8px 12px', borderTop: `1px solid #222`, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: isChecked ? '#1a1a1a' : 'transparent' }}>
                {isChecked
                  ? <CheckSquare size={14} color={BRAND.orange} />
                  : <Square size={14} color="#555" />}
                <div style={{ fontSize: '12px' }}>
                  <span style={{ fontWeight: 700 }}>{a.name}</span>
                  <span style={{ color: '#999', marginLeft: '6px', fontSize: '10px', textTransform: 'uppercase' }}>{a.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '14px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing}
          style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>
          {processing ? 'Creating...' : 'Create upskill'}
        </button>
      </div>
    </ModalShell>
  );
}

function AddUpskillAgentsModal({ upskillId, upskills, agents, skills, session, onClose }) {
  const upskill = upskills.find(u => u.id === upskillId);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!upskill) return null;

  const assigned = new Set(upskill.agentIds || []);
  const eligible = useMemo(() => {
    return agents
      .filter(a => a.market === upskill.market && !assigned.has(a.id))
      .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [agents, upskill.market, search]);

  const toggle = (agentId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId); else next.add(agentId);
      return next;
    });
  };

  const save = async () => {
    if (selected.size === 0) { setError('Pick at least one agent'); return; }
    setError(''); setProcessing(true);
    try {
      const label = upskillLabel(upskill, skills);
      await addAgentsToUpskill(upskillId, Array.from(selected), label, session.displayName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add agents');
      setProcessing(false);
    }
  };

  const label = upskillLabel(upskill, skills);

  return (
    <ModalShell onClose={() => !processing && onClose()} wide>
      <h3 className="display-font" style={{ margin: 0, fontSize: '24px' }}>Add agents</h3>
      <div style={{ marginTop: '6px', color: '#bbb', fontSize: '12px' }}>
        Adding agents to <strong style={{ color: BRAND.orange }}>{label}</strong> ({upskill.market}). Only agents from {upskill.market} are shown.
      </div>

      <div style={{ marginTop: '16px', position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#666' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          style={{ width: '100%', padding: '10px 10px 10px 32px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', fontSize: '13px' }} />
      </div>

      <div style={{ marginTop: '12px', maxHeight: '320px', overflowY: 'auto', background: BRAND.black, border: `1px solid #333` }}>
        {eligible.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontStyle: 'italic', fontSize: '12px' }}>
            {search ? 'No agents match search.' : `No eligible agents in ${upskill.market}.`}
          </div>
        ) : eligible.map(a => {
          const isChecked = selected.has(a.id);
          return (
            <div key={a.id} onClick={() => toggle(a.id)}
              style={{ padding: '10px 14px', borderTop: `1px solid #222`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isChecked ? '#1a1a1a' : 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isChecked
                  ? <CheckSquare size={16} color={BRAND.orange} />
                  : <Square size={16} color="#555" />}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{a.name}</div>
                  <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.market} · {a.status}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '12px', fontSize: '11px', color: '#999' }}>
        <strong style={{ color: BRAND.orange }}>{selected.size}</strong> selected of {eligible.length} eligible
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '12px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing || selected.size === 0}
          style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: (processing || selected.size === 0) ? 'not-allowed' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', opacity: selected.size === 0 ? 0.5 : 1 }}>
          {processing ? 'Adding...' : `Add ${selected.size > 0 ? selected.size : ''}`.trim()}
        </button>
      </div>
    </ModalShell>
  );
}

function EditUpskillModal({ upskillId, upskills, skills, trainers, onClose }) {
  const upskill = upskills.find(u => u.id === upskillId);
  const [form, setForm] = useState({
    name: upskill?.name || '',
    skillId: upskill?.skillId || '',
    trainerId: upskill?.trainerId || '',
    startDate: upskill?.startDate || '',
    deadline: upskill?.deadline || '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!upskill) return null;

  const availableTrainers = trainers.filter(t => t.market === upskill.market);

  const save = async () => {
    if (!form.skillId) { setError('Skill is required'); return; }
    if (form.startDate && form.deadline && form.deadline < form.startDate) {
      setError('Deadline cannot be before start date'); return;
    }
    setError(''); setProcessing(true);
    try {
      await updateUpskill(upskillId, form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update upskill');
      setProcessing(false);
    }
  };

  return (
    <ModalShell onClose={() => !processing && onClose()} wide>
      <h3 className="display-font" style={{ margin: 0, fontSize: '24px' }}>Edit upskill</h3>
      <div style={{ marginTop: '6px', color: '#bbb', fontSize: '12px' }}>
        Market is locked to {upskill.market}. To change market, delete and recreate.
      </div>

      <div style={{ marginTop: '20px' }}>
        <FormField label="Name (optional)" value={form.name} onChange={(v) => setForm({ ...form, name: v })}
          placeholder="Defaults to the skill name if empty" />
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <FormLabel>Skill *</FormLabel>
          <select value={form.skillId} onChange={(e) => setForm({ ...form, skillId: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="">— Pick a skill —</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <FormLabel>Trainer</FormLabel>
          <select value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="">— Unassigned —</option>
            {availableTrainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <FormLabel>Start date</FormLabel>
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', colorScheme: 'dark' }} />
        </div>
        <div>
          <FormLabel>Deadline</FormLabel>
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', colorScheme: 'dark' }} />
        </div>
      </div>

      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginTop: '14px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} disabled={processing}
          style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>Cancel</button>
        <button onClick={save} disabled={processing}
          style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: processing ? 'wait' : 'pointer', fontWeight: 700, textTransform: 'uppercase', fontSize: '12px' }}>
          {processing ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </ModalShell>
  );
}

function SkillListView({ skillStats, setSelectedSkill, isAdmin, onManageSkills }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>All Skills · {skillStats.length}</div>
          <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>Skill <span style={{ color: BRAND.orange }}>paths</span></h2>
        </div>
        {isAdmin && (
          <button onClick={onManageSkills} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={14} /> Manage
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {skillStats.map(s => {
          const status = s.gap > 10 ? 'critical' : s.gap > 0 ? 'warning' : 'ok';
          const statusColor = status === 'critical' ? BRAND.red : status === 'warning' ? BRAND.yellow : BRAND.orange;
          return (
            <div key={s.id} onClick={() => setSelectedSkill(s.id)} className="hover-lift"
              style={{ background: BRAND.grey, border: `1px solid #333`, padding: '20px', cursor: 'pointer', borderTop: `3px solid ${statusColor}` }}>
              <h3 className="display-font" style={{ margin: '0 0 12px', fontSize: '22px' }}>{s.name}</h3>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>{s.description}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Target</div>
                  <div className="display-font" style={{ fontSize: '24px', color: statusColor }}>{s.targetVolumePct}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Actual</div>
                  <div className="display-font" style={{ fontSize: '24px', color: BRAND.white }}>{s.actualPct.toFixed(0)}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillDetailView({ skill, agents, isAdmin, onBack, onUpdateTarget, onToggleSkill }) {
  if (!skill) return null;
  const agentsWith = agents.filter(a => (a.skills || []).includes(skill.id));
  const agentsWithout = agents.filter(a => !(a.skills || []).includes(skill.id));
  return (
    <div>
      <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '6px 14px', cursor: 'pointer', marginBottom: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>← Back</button>
      <h2 className="display-font" style={{ fontSize: '42px', margin: '4px 0 16px', lineHeight: 1 }}>{skill.name}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '18px' }}>Certified · <span style={{ color: BRAND.orange }}>{agentsWith.length}</span></h3>
          {agentsWith.map(a => (
            <div key={a.id} style={{ padding: '10px 12px', background: BRAND.black, borderLeft: `3px solid ${BRAND.orange}`, marginBottom: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>{a.name}</div>
              <div style={{ fontSize: '10px', color: '#999' }}>{a.market} · {a.status}</div>
            </div>
          ))}
        </div>
        <div style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333` }}>
          <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '18px' }}>Not yet · <span style={{ color: BRAND.yellow }}>{agentsWithout.length}</span></h3>
          {agentsWithout.map(a => (
            <div key={a.id} style={{ padding: '10px 12px', background: BRAND.black, borderLeft: `3px solid #444`, marginBottom: '6px', opacity: 0.75 }}>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>{a.name}</div>
              <div style={{ fontSize: '10px', color: '#999' }}>{a.market} · {a.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatrixView({ skillStats, agents, isAdmin, onUpdateTarget, onToggleSkill }) {
  return (
    <div>
      <h2 className="display-font" style={{ fontSize: '42px', margin: '0 0 20px', lineHeight: 1 }}>Skill <span style={{ color: BRAND.orange }}>matrix</span></h2>
      <div style={{ overflowX: 'auto', background: BRAND.grey, border: `1px solid #333` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: BRAND.black }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: '#999', borderBottom: `2px solid ${BRAND.orange}` }}>Agent</th>
              {skillStats.map(s => (
                <th key={s.id} style={{ padding: '14px 8px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', color: BRAND.orange, borderBottom: `2px solid ${BRAND.orange}` }}>{s.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id} style={{ borderTop: `1px solid #333` }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px' }}>{a.name}</td>
                {skillStats.map(s => {
                  const has = (a.skills || []).includes(s.id);
                  return (
                    <td key={s.id} onClick={() => isAdmin && onToggleSkill(a.id, s.id)}
                      style={{ padding: '12px 8px', textAlign: 'center', cursor: isAdmin ? 'pointer' : 'default', background: has ? BRAND.orange : 'transparent' }}>
                      {has ? <Check size={14} color={BRAND.black} strokeWidth={3} /> : <span style={{ color: '#444' }}>·</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminView({ session, skills, teams, trainers, recruiters, courseTypes, onManageTeams, onManageTrainers, onManageRecruiters, onManageCourseTypes }) {
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
      setSuccess(`User "${form.displayName}" created`);
      setForm({ username: '', displayName: '', pin: '', role: 'reader' });
      setShowNew(false);
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (userId, displayName) => {
    if (userId === session.uid) { alert("You can't delete yourself"); return; }
    if (confirm(`Delete user "${displayName}"?`)) await deleteUser(userId);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: BRAND.orange, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Admin</div>
        <h2 className="display-font" style={{ fontSize: '42px', margin: '8px 0 0', lineHeight: 1 }}>
          Administration <span style={{ color: BRAND.orange }}>console</span>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <AdminActionCard icon={Users2} title="Teams" count={teams.length} label="teams defined" onClick={onManageTeams} />
        <AdminActionCard icon={Briefcase} title="Trainers" count={trainers.length} label="trainers" onClick={onManageTrainers} />
        <AdminActionCard icon={UserCog} title="Recruiters" count={recruiters.length} label="recruiters" onClick={onManageRecruiters} />
        <AdminActionCard icon={GraduationCap} title="Course Types" count={(courseTypes || []).length} label="course types" onClick={onManageCourseTypes} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 className="display-font" style={{ margin: 0, fontSize: '24px' }}>User <span style={{ color: BRAND.orange }}>management</span></h3>
        <button onClick={() => setShowNew(!showNew)} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserPlus size={14} /> New user
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} style={{ background: BRAND.grey, padding: '24px', border: `1px solid #333`, marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <FormField label="Username" required value={form.username} onChange={(v) => setForm({...form, username: v})} placeholder="mjensen" />
            <FormField label="Display name" required value={form.displayName} onChange={(v) => setForm({...form, displayName: v})} placeholder="Mette Jensen" />
            <div>
              <FormLabel>6-digit PIN</FormLabel>
              <input required value={form.pin} onChange={(e) => setForm({...form, pin: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                placeholder="123456"
                style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'monospace', letterSpacing: '0.3em' }} />
            </div>
            <div>
              <FormLabel>Role</FormLabel>
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}
                style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
                <option value="reader">Reader</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '8px 12px', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Create</button>
            <button type="button" onClick={() => setShowNew(false)} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '10px 20px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </div>
        </form>
      )}

      {success && <div style={{ background: BRAND.orange, color: BRAND.black, padding: '12px 16px', fontSize: '13px', marginBottom: '16px', fontWeight: 700 }}>{success}</div>}

      <div style={{ background: BRAND.grey, border: `1px solid #333`, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: BRAND.black }}>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Username</th>
              <th style={tableHeaderStyle}>Role</th>
              <th style={{...tableHeaderStyle, textAlign: 'right'}}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: `1px solid #333` }}>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{u.displayName}</td>
                <td style={{ padding: '12px 16px', color: '#999', fontFamily: 'monospace' }}>{u.username}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '10px', padding: '3px 8px', background: u.role === 'admin' ? BRAND.orange : '#444', color: u.role === 'admin' ? BRAND.black : BRAND.white, textTransform: 'uppercase', fontWeight: 700 }}>{u.role}</span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(u.id, u.displayName)} style={{ background: 'transparent', border: `1px solid #555`, color: '#999', padding: '4px 10px', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
                    <Trash2 size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminActionCard({ icon: Icon, title, count, label, onClick }) {
  return (
    <div onClick={onClick} className="hover-lift"
      style={{ background: BRAND.grey, border: `1px solid #333`, borderTop: `3px solid ${BRAND.orange}`, padding: '20px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <Icon size={24} color={BRAND.orange} />
        <h3 className="display-font" style={{ margin: 0, fontSize: '20px' }}>{title}</h3>
      </div>
      <div className="display-font" style={{ fontSize: '36px', color: BRAND.orange, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
      <div style={{ fontSize: '11px', color: BRAND.orange, marginTop: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
        Manage <ChevronRight size={12} />
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  padding: '12px 16px', textAlign: 'left', fontSize: '11px',
  textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999',
};

function FormLabel({ children }) {
  return <label style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '4px' }}>{children}</label>;
}

function FormField({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <input required={required} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
    </div>
  );
}

function CommentModal({ agentId, session, onClose }) {
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('comment');
  const save = async () => {
    if (!text.trim()) return;
    const titles = { comment: 'Development note', training: 'Training scheduled', onboarding: 'Onboarding milestone' };
    await addTimelineEvent(agentId, { type, title: titles[type] || 'Note', note: text, date, createdBy: session.displayName });
    onClose();
  };
  return (
    <ModalShell onClose={onClose}>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>Add note</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
        <div>
          <FormLabel>Type</FormLabel>
          <select value={type} onChange={(e) => setType(e.target.value)}
            style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
            <option value="comment">Comment</option>
            <option value="training">Training</option>
            <option value="onboarding">Onboarding</option>
          </select>
        </div>
        <div>
          <FormLabel>Date</FormLabel>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
        </div>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a note..."
        style={{ width: '100%', minHeight: '120px', marginTop: '12px', padding: '12px', background: BRAND.black, color: BRAND.white, border: `1px solid ${BRAND.orange}`, fontFamily: 'inherit', fontSize: '14px' }} />
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Cancel</button>
        <button onClick={save} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Save</button>
      </div>
    </ModalShell>
  );
}

function NewAgentModal({ session, teams, trainers, onClose }) {
  const [form, setForm] = useState({ name: '', market: 'DK', startDate: new Date().toISOString().split('T')[0], status: 'Onboarding', teamId: '', trainerId: '' });
  const save = async () => {
    if (!form.name.trim()) return;
    await createAgent({ ...form, teamId: form.teamId || null, trainerId: form.trainerId || null, actorName: session.displayName });
    onClose();
  };
  return (
    <ModalShell onClose={onClose}>
      <h3 className="display-font" style={{ margin: 0, fontSize: '22px' }}>New agent</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <FormField label="Name" value={form.name} onChange={(v) => setForm({...form, name: v})} placeholder="First Last" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <FormLabel>Market</FormLabel>
            <select value={form.market} onChange={(e) => setForm({...form, market: e.target.value})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
              {['DK', 'NO', 'SE', 'FI'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <FormLabel>Start date</FormLabel>
            <input type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
          </div>
          <div>
            <FormLabel>Status</FormLabel>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
              style={{ width: '100%', padding: '8px', background: BRAND.black, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
              <option value="Onboarding">Onboarding</option>
              <option value="Active">Active</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ background: 'transparent', color: BRAND.white, border: `1px solid #555`, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Cancel</button>
        <button onClick={save} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Create</button>
      </div>
    </ModalShell>
  );
}

function ManageSkillsModal({ skills, skillStats, onClose }) {
  return <SimpleManageModal title="Manage skills" items={skills}
    columns={[{ key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }, { key: 'targetVolumePct', label: 'Target %', isNumber: true, width: '90px' }]}
    defaults={{ name: '', description: '', targetVolumePct: 0, order: 99 }}
    getUsageCount={(s) => skillStats.find(ss => ss.id === s.id)?.agentCount || 0}
    usageBlocksDelete usageLabel="agents"
    onCreate={async (form) => {
      const maxOrder = Math.max(0, ...skills.map(s => s.order || 0));
      await createSkill({ ...form, order: maxOrder + 1 });
    }}
    onUpdate={updateSkill} onDelete={deleteSkill} onClose={onClose} />;
}

function ManageTeamsModal({ teams, agents, onClose }) {
  return <SimpleManageModal title="Manage teams" items={teams}
    columns={[{ key: 'name', label: 'Name' }, { key: 'market', label: 'Market', isSelect: true, options: ['DK', 'NO', 'SE', 'FI'], width: '120px' }]}
    defaults={{ name: '', market: 'DK' }}
    getUsageCount={(t) => agents.filter(a => a.teamId === t.id).length}
    usageBlocksDelete usageLabel="agents"
    onCreate={createTeam} onUpdate={updateTeam} onDelete={deleteTeam} onClose={onClose} />;
}

function ManageRecruitersModal({ recruiters, onClose }) {
  return <SimpleManageModal title="Manage recruiters" items={recruiters}
    columns={[{ key: 'name', label: 'Name' }, { key: 'market', label: 'Market', isSelect: true, options: ['DK', 'NO', 'SE', 'FI'], width: '120px' }]}
    defaults={{ name: '', market: 'DK' }}
    onCreate={createRecruiter} onUpdate={updateRecruiter} onDelete={deleteRecruiter} onClose={onClose} />;
}

function ManageCourseTypesModal({ courseTypes, skills, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', description: '', defaultSkillIds: [] });
  const [error, setError] = useState('');

  const startEdit = (ct) => {
    setEditingId(ct.id);
    setEditForm({ name: ct.name, description: ct.description || '', defaultSkillIds: ct.defaultSkillIds || [] });
  };
  const saveEdit = async () => {
    if (!editForm.name.trim()) { setError('Name required'); return; }
    try { await updateCourseType(editingId, editForm); setEditingId(null); setError(''); }
    catch (err) { setError(err.message); }
  };
  const handleDelete = async (ct) => {
    if (confirm(`Delete course type "${ct.name}"?\n\nThis will not affect existing courses already created from this type.`)) {
      await deleteCourseType(ct.id);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    if (!newForm.name.trim()) { setError('Name required'); return; }
    try {
      await createCourseType(newForm);
      setNewForm({ name: '', description: '', defaultSkillIds: [] });
      setShowNew(false);
    } catch (err) { setError(err.message); }
  };
  const toggleSkill = (formState, setFormState, skillId) => {
    const has = (formState.defaultSkillIds || []).includes(skillId);
    setFormState({
      ...formState,
      defaultSkillIds: has
        ? formState.defaultSkillIds.filter(s => s !== skillId)
        : [...(formState.defaultSkillIds || []), skillId],
    });
  };

  return (
    <ModalShell onClose={onClose} wide>
      <h3 className="display-font" style={{ margin: '0 0 8px', fontSize: '24px' }}>Manage course types</h3>
      <div style={{ fontSize: '12px', color: '#bbb', marginBottom: '16px', lineHeight: 1.5 }}>
        Course types are templates for the courses you'll run (e.g. <em>Onboarding</em>, <em>Leadership training</em>).
        Default skills are automatically assigned to enrolled agents when a course of this type is completed.
      </div>

      {!showNew && (
        <button onClick={() => setShowNew(true)} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <Plus size={14} /> New course type
        </button>
      )}
      {showNew && (
        <form onSubmit={handleCreate} style={{ background: BRAND.black, padding: '20px', border: `1px solid ${BRAND.orange}`, marginBottom: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <FormField label="Name *" required value={newForm.name} onChange={(v) => setNewForm({ ...newForm, name: v })} placeholder="Onboarding, Leadership training, etc." />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <FormLabel>Description</FormLabel>
            <textarea value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              placeholder="What is this type of course about?" rows={2}
              style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit', fontSize: '13px', resize: 'vertical' }} />
          </div>
          <FormLabel>Default skills (assigned on completion)</FormLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: BRAND.grey, border: `1px solid #444`, marginBottom: '12px' }}>
            {skills.length === 0 && <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>No skills defined yet</span>}
            {skills.map(s => {
              const isChecked = (newForm.defaultSkillIds || []).includes(s.id);
              return (
                <button key={s.id} type="button" onClick={() => toggleSkill(newForm, setNewForm, s.id)}
                  style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>{s.name}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Create</button>
            <button type="button" onClick={() => { setShowNew(false); setNewForm({ name: '', description: '', defaultSkillIds: [] }); setError(''); }}
              style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '8px 16px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </div>
        </form>
      )}
      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '10px 12px', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}

      <div style={{ background: BRAND.black, border: `1px solid #333` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Description</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Default skills</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', color: '#999' }}></th>
            </tr>
          </thead>
          <tbody>
            {courseTypes.map(ct => {
              const isEditing = editingId === ct.id;
              const defaultSkills = skills.filter(s => (ct.defaultSkillIds || []).includes(s.id));
              if (isEditing) return (
                <tr key={ct.id} style={{ borderTop: `1px solid #333`, background: BRAND.grey }}>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={{ width: '100%', padding: '4px 6px', background: BRAND.black, border: `1px solid ${BRAND.orange}`, color: BRAND.white, fontFamily: 'inherit' }} />
                  </td>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                    <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={2}
                      style={{ width: '100%', padding: '4px 6px', background: BRAND.black, border: `1px solid ${BRAND.orange}`, color: BRAND.white, fontFamily: 'inherit', fontSize: '12px', resize: 'vertical' }} />
                  </td>
                  <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {skills.map(s => {
                        const isChecked = (editForm.defaultSkillIds || []).includes(s.id);
                        return <button key={s.id} type="button" onClick={() => toggleSkill(editForm, setEditForm, s.id)}
                          style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '3px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>{s.name}</button>;
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <button onClick={saveEdit} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '4px 10px', cursor: 'pointer', fontSize: '10px', fontWeight: 700, marginRight: '4px' }}>Save</button>
                    <button onClick={() => { setEditingId(null); setError(''); }} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '4px 10px', cursor: 'pointer', fontSize: '10px' }}>Cancel</button>
                  </td>
                </tr>
              );
              return (
                <tr key={ct.id} style={{ borderTop: `1px solid #333` }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, verticalAlign: 'top' }}>{ct.name}</td>
                  <td style={{ padding: '10px 12px', color: ct.description ? '#bbb' : '#666', fontSize: '12px', verticalAlign: 'top', fontStyle: ct.description ? 'normal' : 'italic' }}>
                    {ct.description || 'No description'}
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {defaultSkills.map(s => <span key={s.id} style={{ fontSize: '10px', padding: '2px 6px', background: BRAND.black, color: BRAND.orange, border: `1px solid ${BRAND.orange}`, fontWeight: 700 }}>{s.name}</span>)}
                      {defaultSkills.length === 0 && <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>None</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    <button onClick={() => startEdit(ct)} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 700, marginRight: '4px' }}>Edit</button>
                    <button onClick={() => handleDelete(ct)} style={{ background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red, padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {courseTypes.length === 0 && <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>No course types yet — create one to get started</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Done</button>
      </div>
    </ModalShell>
  );
}

function ManageTrainersModal({ trainers, skills, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', market: 'DK', certifiedSkills: [] });
  const [error, setError] = useState('');

  const startEdit = (t) => { setEditingId(t.id); setEditForm({ name: t.name, market: t.market, certifiedSkills: t.certifiedSkills || [] }); };
  const saveEdit = async () => { try { await updateTrainer(editingId, editForm); setEditingId(null); } catch (err) { setError(err.message); } };
  const handleDelete = async (t) => { if (confirm(`Delete trainer "${t.name}"?`)) await deleteTrainer(t.id); };
  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    if (!newForm.name.trim()) { setError('Name required'); return; }
    try { await createTrainer(newForm); setNewForm({ name: '', market: 'DK', certifiedSkills: [] }); setShowNew(false); }
    catch (err) { setError(err.message); }
  };
  const toggleSkill = (formState, setFormState, skillId) => {
    const has = (formState.certifiedSkills || []).includes(skillId);
    setFormState({ ...formState, certifiedSkills: has ? formState.certifiedSkills.filter(s => s !== skillId) : [...(formState.certifiedSkills || []), skillId] });
  };

  return (
    <ModalShell onClose={onClose} wide>
      <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '24px' }}>Manage trainers</h3>
      {!showNew && (
        <button onClick={() => setShowNew(true)} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <Plus size={14} /> New trainer
        </button>
      )}
      {showNew && (
        <form onSubmit={handleCreate} style={{ background: BRAND.black, padding: '20px', border: `1px solid ${BRAND.orange}`, marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <FormField label="Name *" required value={newForm.name} onChange={(v) => setNewForm({...newForm, name: v})} placeholder="First Last" />
            <div>
              <FormLabel>Market *</FormLabel>
              <select value={newForm.market} onChange={(e) => setNewForm({...newForm, market: e.target.value})}
                style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
                {['DK', 'NO', 'SE', 'FI'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <FormLabel>Certified skills</FormLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: BRAND.grey, border: `1px solid #444`, marginBottom: '12px' }}>
            {skills.map(s => {
              const isChecked = (newForm.certifiedSkills || []).includes(s.id);
              return (
                <button key={s.id} type="button" onClick={() => toggleSkill(newForm, setNewForm, s.id)}
                  style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>{s.name}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Create</button>
            <button type="button" onClick={() => setShowNew(false)} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '8px 16px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </div>
        </form>
      )}
      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '10px 12px', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
      <div style={{ background: BRAND.black, border: `1px solid #333` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Market</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Skills</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', color: '#999' }}></th>
            </tr>
          </thead>
          <tbody>
            {trainers.map(t => {
              const isEditing = editingId === t.id;
              const certifiedSkills = skills.filter(s => (t.certifiedSkills || []).includes(s.id));
              if (isEditing) return (
                <tr key={t.id} style={{ borderTop: `1px solid #333`, background: BRAND.grey }}>
                  <td style={{ padding: '8px 12px' }}><input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '4px 6px', background: BRAND.black, border: `1px solid ${BRAND.orange}`, color: BRAND.white, fontFamily: 'inherit' }} /></td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <select value={editForm.market} onChange={(e) => setEditForm({...editForm, market: e.target.value})} style={{ padding: '4px', background: BRAND.black, border: `1px solid ${BRAND.orange}`, color: BRAND.white, fontFamily: 'inherit' }}>
                      {['DK', 'NO', 'SE', 'FI'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {skills.map(s => {
                        const isChecked = (editForm.certifiedSkills || []).includes(s.id);
                        return <button key={s.id} type="button" onClick={() => toggleSkill(editForm, setEditForm, s.id)}
                          style={{ background: isChecked ? BRAND.orange : 'transparent', color: isChecked ? BRAND.black : BRAND.white, border: `1px solid ${isChecked ? BRAND.orange : '#555'}`, padding: '3px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>{s.name}</button>;
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    <button onClick={saveEdit} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '4px 10px', cursor: 'pointer', fontSize: '10px', fontWeight: 700, marginRight: '4px' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '4px 10px', cursor: 'pointer', fontSize: '10px' }}>Cancel</button>
                  </td>
                </tr>
              );
              return (
                <tr key={t.id} style={{ borderTop: `1px solid #333` }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{t.name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: BRAND.orange, fontWeight: 700 }}>{t.market}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {certifiedSkills.map(s => <span key={s.id} style={{ fontSize: '10px', padding: '2px 6px', background: BRAND.black, color: BRAND.orange, border: `1px solid ${BRAND.orange}`, fontWeight: 700 }}>{s.name}</span>)}
                      {certifiedSkills.length === 0 && <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>None</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => startEdit(t)} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 700, marginRight: '4px' }}>Edit</button>
                    <button onClick={() => handleDelete(t)} style={{ background: 'transparent', border: `1px solid ${BRAND.red}`, color: BRAND.red, padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {trainers.length === 0 && <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>No trainers yet</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Done</button>
      </div>
    </ModalShell>
  );
}

function SimpleManageModal({ title, items, columns, defaults, onCreate, onUpdate, onDelete, onClose, getUsageCount, usageBlocksDelete, usageLabel }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState(defaults);
  const [error, setError] = useState('');

  const startEdit = (item) => {
    const formData = {};
    columns.forEach(c => formData[c.key] = item[c.key] !== undefined ? item[c.key] : (c.isNumber ? 0 : ''));
    setEditingId(item.id);
    setEditForm(formData);
  };
  const saveEdit = async () => {
    try { await onUpdate(editingId, editForm); setEditingId(null); }
    catch (err) { setError(err.message); }
  };
  const handleDelete = async (item) => {
    if (usageBlocksDelete && getUsageCount) {
      const count = getUsageCount(item);
      if (count > 0) { alert(`Cannot delete: ${count} ${usageLabel} are using this.`); return; }
    }
    if (confirm(`Delete "${item.name}"?`)) {
      try { await onDelete(item.id); } catch (err) { setError(err.message); }
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    if (!newForm.name?.trim()) { setError('Name required'); return; }
    try { await onCreate(newForm); setNewForm(defaults); setShowNew(false); }
    catch (err) { setError(err.message); }
  };

  return (
    <ModalShell onClose={onClose} wide>
      <h3 className="display-font" style={{ margin: '0 0 16px', fontSize: '24px' }}>{title}</h3>
      {!showNew && (
        <button onClick={() => setShowNew(true)} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <Plus size={14} /> New
        </button>
      )}
      {showNew && (
        <form onSubmit={handleCreate} style={{ background: BRAND.black, padding: '20px', border: `1px solid ${BRAND.orange}`, marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: '10px', marginBottom: '12px' }}>
            {columns.map(col => (
              <div key={col.key}>
                <FormLabel>{col.label}</FormLabel>
                {col.isSelect ? (
                  <select value={newForm[col.key]} onChange={(e) => setNewForm({...newForm, [col.key]: e.target.value})}
                    style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }}>
                    {col.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={col.isNumber ? 'number' : 'text'}
                    value={newForm[col.key]}
                    onChange={(e) => setNewForm({...newForm, [col.key]: col.isNumber ? (parseInt(e.target.value) || 0) : e.target.value})}
                    style={{ width: '100%', padding: '8px', background: BRAND.grey, border: `1px solid #444`, color: BRAND.white, fontFamily: 'inherit' }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Create</button>
            <button type="button" onClick={() => { setShowNew(false); setError(''); }} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '8px 16px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </div>
        </form>
      )}
      {error && <div style={{ background: BRAND.red, color: BRAND.white, padding: '10px 12px', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
      <div style={{ background: BRAND.black, border: `1px solid #333` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              {columns.map(col => (
                <th key={col.key} style={{ padding: '10px 12px', textAlign: col.isNumber ? 'center' : 'left', fontSize: '10px', textTransform: 'uppercase', color: '#999' }}>{col.label}</th>
              ))}
              {getUsageCount && <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '10px', color: '#999' }}>{usageLabel}</th>}
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '10px', color: '#999' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const isEditing = editingId === item.id;
              const usageCount = getUsageCount ? getUsageCount(item) : 0;
              if (isEditing) return (
                <tr key={item.id} style={{ borderTop: `1px solid #333`, background: BRAND.grey }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '8px 12px', textAlign: col.isNumber ? 'center' : 'left' }}>
                      {col.isSelect ? (
                        <select value={editForm[col.key]} onChange={(e) => setEditForm({...editForm, [col.key]: e.target.value})}
                          style={{ padding: '4px', background: BRAND.black, border: `1px solid ${BRAND.orange}`, color: BRAND.white, fontFamily: 'inherit' }}>
                          {col.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={col.isNumber ? 'number' : 'text'}
                          value={editForm[col.key]}
                          onChange={(e) => setEditForm({...editForm, [col.key]: col.isNumber ? (parseInt(e.target.value) || 0) : e.target.value})}
                          style={{ width: col.isNumber ? '60px' : '100%', padding: '4px 6px', background: BRAND.black, border: `1px solid ${BRAND.orange}`, color: BRAND.white, fontFamily: 'inherit', textAlign: col.isNumber ? 'center' : 'left' }} />
                      )}
                    </td>
                  ))}
                  {getUsageCount && <td style={{ padding: '8px 12px', textAlign: 'center', color: '#999' }}>{usageCount}</td>}
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    <button onClick={saveEdit} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '4px 10px', cursor: 'pointer', fontSize: '10px', fontWeight: 700, marginRight: '4px' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'transparent', border: `1px solid #555`, color: BRAND.white, padding: '4px 10px', cursor: 'pointer', fontSize: '10px' }}>Cancel</button>
                  </td>
                </tr>
              );
              return (
                <tr key={item.id} style={{ borderTop: `1px solid #333` }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '10px 12px', textAlign: col.isNumber ? 'center' : 'left', fontWeight: col.key === 'name' ? 700 : 400, color: col.isNumber ? BRAND.orange : (col.key === 'market' ? BRAND.orange : (col.key === 'description' ? '#bbb' : BRAND.white)) }}>
                      {item[col.key]}{col.isNumber && col.label.includes('%') ? '%' : ''}
                    </td>
                  ))}
                  {getUsageCount && <td style={{ padding: '10px 12px', textAlign: 'center', color: usageCount > 0 ? BRAND.orange : '#666' }}>{usageCount}</td>}
                  <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => startEdit(item)} style={{ background: 'transparent', border: `1px solid ${BRAND.orange}`, color: BRAND.orange, padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 700, marginRight: '4px' }}>Edit</button>
                    <button onClick={() => handleDelete(item)} disabled={usageBlocksDelete && usageCount > 0}
                      style={{ background: 'transparent', border: `1px solid ${(usageBlocksDelete && usageCount > 0) ? '#444' : BRAND.red}`, color: (usageBlocksDelete && usageCount > 0) ? '#444' : BRAND.red, padding: '4px 8px', cursor: (usageBlocksDelete && usageCount > 0) ? 'not-allowed' : 'pointer', fontSize: '10px', fontWeight: 700 }}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan={columns.length + (getUsageCount ? 2 : 1)} style={{ padding: '30px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>No items yet</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ background: BRAND.orange, color: BRAND.black, border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Done</button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.grey, padding: '32px', maxWidth: wide ? '900px' : '500px', width: '100%', border: `2px solid ${BRAND.orange}`, maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
