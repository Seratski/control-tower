// src/lib/data.js
import {
  collection, doc, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, query, orderBy, serverTimestamp, arrayUnion, arrayRemove, getDoc,
  where, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase.js';

// ============ SKILLS ============
export function subscribeSkills(callback) {
  const q = query(collection(db, 'skills'), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function updateSkillTarget(skillId, targetVolumePct) {
  await updateDoc(doc(db, 'skills', skillId), { targetVolumePct });
}
export async function createSkill({ name, description, targetVolumePct, order }) {
  const cleanId = 's_' + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const finalId = cleanId + '_' + Date.now().toString().slice(-4);
  await setDoc(doc(db, 'skills', finalId), {
    name: name.trim(), description: description.trim(),
    targetVolumePct: parseInt(targetVolumePct) || 0,
    order: parseInt(order) || 99,
    createdAt: serverTimestamp(),
  });
  return finalId;
}
export async function updateSkill(skillId, updates) {
  const cleanUpdates = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
  if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();
  if (updates.targetVolumePct !== undefined) cleanUpdates.targetVolumePct = parseInt(updates.targetVolumePct) || 0;
  if (updates.order !== undefined) cleanUpdates.order = parseInt(updates.order) || 99;
  await updateDoc(doc(db, 'skills', skillId), cleanUpdates);
}
export async function deleteSkill(skillId) { await deleteDoc(doc(db, 'skills', skillId)); }

// ============ TEAMS ============
export function subscribeTeams(callback) {
  const q = query(collection(db, 'teams'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function createTeam({ name, market }) {
  const cleanId = 't_' + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const finalId = cleanId + '_' + Date.now().toString().slice(-4);
  await setDoc(doc(db, 'teams', finalId), { name: name.trim(), market, createdAt: serverTimestamp() });
  return finalId;
}
export async function updateTeam(teamId, updates) {
  const cleanUpdates = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
  if (updates.market !== undefined) cleanUpdates.market = updates.market;
  await updateDoc(doc(db, 'teams', teamId), cleanUpdates);
}
export async function deleteTeam(teamId) { await deleteDoc(doc(db, 'teams', teamId)); }

// ============ TRAINERS ============
export function subscribeTrainers(callback) {
  const q = query(collection(db, 'trainers'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function createTrainer({ name, market, certifiedSkills }) {
  const cleanId = 'tr_' + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const finalId = cleanId + '_' + Date.now().toString().slice(-4);
  await setDoc(doc(db, 'trainers', finalId), {
    name: name.trim(), market,
    certifiedSkills: certifiedSkills || [],
    createdAt: serverTimestamp(),
  });
  return finalId;
}
export async function updateTrainer(trainerId, updates) {
  const cleanUpdates = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
  if (updates.market !== undefined) cleanUpdates.market = updates.market;
  if (updates.certifiedSkills !== undefined) cleanUpdates.certifiedSkills = updates.certifiedSkills;
  await updateDoc(doc(db, 'trainers', trainerId), cleanUpdates);
}
export async function deleteTrainer(trainerId) { await deleteDoc(doc(db, 'trainers', trainerId)); }
export async function toggleTrainerSkill(trainerId, skillId, currentlyCertified) {
  await updateDoc(doc(db, 'trainers', trainerId), {
    certifiedSkills: currentlyCertified ? arrayRemove(skillId) : arrayUnion(skillId),
  });
}

// ============ RECRUITERS ============
export function subscribeRecruiters(callback) {
  const q = query(collection(db, 'recruiters'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function createRecruiter({ name, market }) {
  const cleanId = 'rc_' + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const finalId = cleanId + '_' + Date.now().toString().slice(-4);
  await setDoc(doc(db, 'recruiters', finalId), {
    name: name.trim(), market,
    createdAt: serverTimestamp(),
  });
  return finalId;
}
export async function updateRecruiter(recruiterId, updates) {
  const cleanUpdates = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
  if (updates.market !== undefined) cleanUpdates.market = updates.market;
  await updateDoc(doc(db, 'recruiters', recruiterId), cleanUpdates);
}
export async function deleteRecruiter(recruiterId) { await deleteDoc(doc(db, 'recruiters', recruiterId)); }

// ============ RECRUITMENTS ============
export function subscribeRecruitments(callback) {
  const q = query(collection(db, 'recruitments'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function createRecruitment({ name, market, targetCount, applicationDeadline, classStartDate, recruiterIds, trainerIds }) {
  const cleanId = 'rec_' + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const finalId = cleanId + '_' + Date.now().toString().slice(-4);

  const candidates = [];
  const target = parseInt(targetCount) || 0;
  for (let i = 1; i <= target; i++) {
    candidates.push({ slotNumber: i, status: 'open', agentId: null });
  }

  await setDoc(doc(db, 'recruitments', finalId), {
    name: name.trim(),
    market,
    targetCount: target,
    createdDate: new Date().toISOString().split('T')[0],
    applicationDeadline: applicationDeadline || null,
    classStartDate: classStartDate || null,
    recruiterIds: recruiterIds || [],
    trainerIds: trainerIds || [],
    status: 'Initiated',
    candidates,
    createdAt: serverTimestamp(),
  });
  return finalId;
}

export async function updateRecruitment(recruitmentId, updates) {
  const cleanUpdates = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
  if (updates.applicationDeadline !== undefined) cleanUpdates.applicationDeadline = updates.applicationDeadline || null;
  if (updates.classStartDate !== undefined) cleanUpdates.classStartDate = updates.classStartDate || null;
  if (updates.recruiterIds !== undefined) cleanUpdates.recruiterIds = updates.recruiterIds;
  if (updates.trainerIds !== undefined) cleanUpdates.trainerIds = updates.trainerIds;
  if (updates.status !== undefined) cleanUpdates.status = updates.status;
  await updateDoc(doc(db, 'recruitments', recruitmentId), cleanUpdates);
}

export async function deleteRecruitment(recruitmentId) {
  await deleteDoc(doc(db, 'recruitments', recruitmentId));
}

/**
 * NEW IN ROUND 3a: Convert candidate slot → real agent
 * - Creates new agent with status='Onboarding', recruitmentId set
 * - Logs timeline events: profile created + hired via [recruitment]
 * - Updates the slot with hired status + agentId
 * - Auto-completes recruitment if all slots are hired
 */
export async function convertCandidateToAgent(recruitmentId, slotNumber, agentName, recruiters, actorName) {
  const recRef = doc(db, 'recruitments', recruitmentId);
  const recSnap = await getDoc(recRef);
  if (!recSnap.exists()) throw new Error('Recruitment not found');
  const rec = recSnap.data();

  // Build recruiter names list for the timeline event
  const recruiterNames = (rec.recruiterIds || [])
    .map(id => recruiters.find(r => r.id === id)?.name)
    .filter(Boolean);

  // Create the new agent
  const newAgent = {
    name: agentName.trim(),
    market: rec.market,
    startDate: rec.classStartDate || new Date().toISOString().split('T')[0],
    status: 'Onboarding',
    skills: [],
    teamId: null,
    trainerId: null,
    recruitmentId,
    onboardingComplete: false,
    createdAt: serverTimestamp(),
  };
  const agentRef = await addDoc(collection(db, 'agents'), newAgent);

  // Timeline event 1: profile created
  await addTimelineEvent(agentRef.id, {
    type: 'onboarding',
    title: 'Agent profile created',
    note: '',
    createdBy: actorName,
  });

  // Timeline event 2: hired via recruitment
  const recruitersNote = recruiterNames.length > 0
    ? `Recruited by: ${recruiterNames.join(', ')}`
    : 'Recruited (no recruiter specified)';
  await addTimelineEvent(agentRef.id, {
    type: 'onboarding',
    title: `Hired via "${rec.name}"`,
    note: recruitersNote,
    createdBy: actorName,
  });

  // Update the slot in the recruitment
  const updatedCandidates = (rec.candidates || []).map(c =>
    c.slotNumber === slotNumber
      ? { ...c, status: 'hired', agentId: agentRef.id, hiredName: agentName.trim() }
      : c
  );

  // Auto-complete recruitment if all slots are now hired
  const allHired = updatedCandidates.length > 0 && updatedCandidates.every(c => c.status === 'hired');
  const newStatus = allHired ? 'Completed' : rec.status;

  await updateDoc(recRef, {
    candidates: updatedCandidates,
    status: newStatus,
  });

  return agentRef.id;
}

/**
 * NEW IN ROUND 3b-1: Add empty candidate slots to existing recruitment
 */
export async function addCandidateSlots(recruitmentId, additionalCount) {
  const recRef = doc(db, 'recruitments', recruitmentId);
  const recSnap = await getDoc(recRef);
  if (!recSnap.exists()) throw new Error('Recruitment not found');
  const rec = recSnap.data();

  const existingSlots = rec.candidates || [];
  const maxSlot = existingSlots.length > 0 ? Math.max(...existingSlots.map(c => c.slotNumber)) : 0;

  const newSlots = [];
  for (let i = 1; i <= additionalCount; i++) {
    newSlots.push({ slotNumber: maxSlot + i, status: 'open', agentId: null });
  }

  const updatedCandidates = [...existingSlots, ...newSlots];

  // If recruitment was Completed and we add new open slots, kick it back to Live
  let newStatus = rec.status;
  if (rec.status === 'Completed' && newSlots.length > 0) {
    newStatus = 'Live';
  }

  await updateDoc(recRef, {
    candidates: updatedCandidates,
    targetCount: updatedCandidates.length,
    status: newStatus,
  });
}

/**
 * NEW IN ROUND 3b-1: Remove an empty slot
 */
export async function removeCandidateSlot(recruitmentId, slotNumber) {
  const recRef = doc(db, 'recruitments', recruitmentId);
  const recSnap = await getDoc(recRef);
  if (!recSnap.exists()) throw new Error('Recruitment not found');
  const rec = recSnap.data();

  const slot = (rec.candidates || []).find(c => c.slotNumber === slotNumber);
  if (!slot) throw new Error('Slot not found');
  if (slot.status === 'hired') throw new Error('Cannot remove a hired slot. Revert hire first.');

  const updatedCandidates = (rec.candidates || []).filter(c => c.slotNumber !== slotNumber);

  // Recalc auto-complete: if all remaining slots are hired (and there are some), set Completed
  const allHired = updatedCandidates.length > 0 && updatedCandidates.every(c => c.status === 'hired');
  let newStatus = rec.status;
  if (allHired && rec.status !== 'Completed') newStatus = 'Completed';

  await updateDoc(recRef, {
    candidates: updatedCandidates,
    targetCount: updatedCandidates.length,
    status: newStatus,
  });
}

/**
 * NEW IN ROUND 3b-1: Revert a hired slot — delete agent + free slot
 */
export async function revertCandidateSlotDeleteAgent(recruitmentId, slotNumber, actorName) {
  const recRef = doc(db, 'recruitments', recruitmentId);
  const recSnap = await getDoc(recRef);
  if (!recSnap.exists()) throw new Error('Recruitment not found');
  const rec = recSnap.data();

  const slot = (rec.candidates || []).find(c => c.slotNumber === slotNumber);
  if (!slot) throw new Error('Slot not found');
  if (slot.status !== 'hired' || !slot.agentId) throw new Error('Slot is not hired');

  const agentId = slot.agentId;
  try {
    const timelineSnap = await getDocs(collection(db, 'agents', agentId, 'timeline'));
    await Promise.all(timelineSnap.docs.map(d => deleteDoc(d.ref)));
    await deleteDoc(doc(db, 'agents', agentId));
  } catch (err) {
    console.warn('Agent already missing, freeing slot anyway', err);
  }

  const updatedCandidates = (rec.candidates || []).map(c =>
    c.slotNumber === slotNumber
      ? { slotNumber: c.slotNumber, status: 'open', agentId: null }
      : c
  );

  let newStatus = rec.status;
  if (rec.status === 'Completed') newStatus = 'Live';

  await updateDoc(recRef, {
    candidates: updatedCandidates,
    status: newStatus,
  });
}

/**
 * NEW IN ROUND 3b-1: Unlink a hired slot — keep agent, free slot
 */
export async function unlinkCandidateSlot(recruitmentId, slotNumber, actorName) {
  const recRef = doc(db, 'recruitments', recruitmentId);
  const recSnap = await getDoc(recRef);
  if (!recSnap.exists()) throw new Error('Recruitment not found');
  const rec = recSnap.data();

  const slot = (rec.candidates || []).find(c => c.slotNumber === slotNumber);
  if (!slot) throw new Error('Slot not found');
  if (slot.status !== 'hired' || !slot.agentId) throw new Error('Slot is not hired');

  const agentId = slot.agentId;

  try {
    await updateDoc(doc(db, 'agents', agentId), { recruitmentId: null });
    await addTimelineEvent(agentId, {
      type: 'comment',
      title: `Unlinked from recruitment "${rec.name}"`,
      note: 'Slot freed; agent profile retained.',
      createdBy: actorName,
    });
  } catch (err) {
    console.warn('Could not update agent for unlink', err);
  }

  const updatedCandidates = (rec.candidates || []).map(c =>
    c.slotNumber === slotNumber
      ? { slotNumber: c.slotNumber, status: 'open', agentId: null }
      : c
  );

  let newStatus = rec.status;
  if (rec.status === 'Completed') newStatus = 'Live';

  await updateDoc(recRef, {
    candidates: updatedCandidates,
    status: newStatus,
  });
}

// ============ AGENTS ============
export function subscribeAgents(callback) {
  const q = query(collection(db, 'agents'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function toggleAgentSkill(agentId, skillId, skillName, assign, actorName) {
  await updateDoc(doc(db, 'agents', agentId), {
    skills: assign ? arrayUnion(skillId) : arrayRemove(skillId),
  });
  await addTimelineEvent(agentId, {
    type: 'skill',
    title: assign ? `${skillName} skill assigned` : `${skillName} skill removed`,
    note: '', createdBy: actorName,
  });
}
export async function createAgent({ name, market, startDate, status, teamId, trainerId, actorName }) {
  const newAgent = {
    name, market, startDate, status,
    skills: [],
    teamId: teamId || null,
    trainerId: trainerId || null,
    recruitmentId: null,
    onboardingComplete: status === 'Active',
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, 'agents'), newAgent);
  await addTimelineEvent(ref.id, {
    type: 'onboarding', title: 'Agent profile created', note: '', createdBy: actorName,
  });
  return ref.id;
}
export async function updateAgent(agentId, updates) {
  await updateDoc(doc(db, 'agents', agentId), updates);
}
export async function changeAgentTeam(agentId, newTeamId, newTeamName, oldTeamName, actorName) {
  await updateDoc(doc(db, 'agents', agentId), { teamId: newTeamId || null });
  const title = newTeamId
    ? (oldTeamName ? `Team changed: ${oldTeamName} → ${newTeamName}` : `Assigned to team: ${newTeamName}`)
    : `Removed from team: ${oldTeamName || 'Unknown'}`;
  await addTimelineEvent(agentId, { type: 'comment', title, note: '', createdBy: actorName });
}
export async function changeAgentTrainer(agentId, newTrainerId, newTrainerName, oldTrainerName, actorName) {
  await updateDoc(doc(db, 'agents', agentId), { trainerId: newTrainerId || null });
  const title = newTrainerId
    ? (oldTrainerName ? `Trainer changed: ${oldTrainerName} → ${newTrainerName}` : `Assigned to trainer: ${newTrainerName}`)
    : `Trainer removed: ${oldTrainerName || 'Unknown'}`;
  await addTimelineEvent(agentId, { type: 'comment', title, note: '', createdBy: actorName });
}
/**
 * UPDATED IN ROUND 3b-1: deleteAgent now auto-frees the recruitment slot
 */
export async function deleteAgent(agentId) {
  // If agent is linked to a recruitment, free the slot first
  try {
    const agentSnap = await getDoc(doc(db, 'agents', agentId));
    if (agentSnap.exists()) {
      const agentData = agentSnap.data();
      if (agentData.recruitmentId) {
        const recRef = doc(db, 'recruitments', agentData.recruitmentId);
        const recSnap = await getDoc(recRef);
        if (recSnap.exists()) {
          const rec = recSnap.data();
          const updatedCandidates = (rec.candidates || []).map(c =>
            c.agentId === agentId
              ? { slotNumber: c.slotNumber, status: 'open', agentId: null }
              : c
          );
          let newStatus = rec.status;
          if (rec.status === 'Completed') newStatus = 'Live';
          await updateDoc(recRef, { candidates: updatedCandidates, status: newStatus });
        }
      }
    }
  } catch (err) {
    console.warn('Could not free slot on agent delete', err);
  }

  const timelineSnap = await getDocs(collection(db, 'agents', agentId, 'timeline'));
  await Promise.all(timelineSnap.docs.map(d => deleteDoc(d.ref)));
  await deleteDoc(doc(db, 'agents', agentId));
}

// ============ BULK OPERATIONS ============
export async function bulkDeleteAgents(agentIds) {
  for (const agentId of agentIds) {
    // Free any recruitment slot first
    try {
      const agentSnap = await getDoc(doc(db, 'agents', agentId));
      if (agentSnap.exists()) {
        const agentData = agentSnap.data();
        if (agentData.recruitmentId) {
          const recRef = doc(db, 'recruitments', agentData.recruitmentId);
          const recSnap = await getDoc(recRef);
          if (recSnap.exists()) {
            const rec = recSnap.data();
            const updatedCandidates = (rec.candidates || []).map(c =>
              c.agentId === agentId
                ? { slotNumber: c.slotNumber, status: 'open', agentId: null }
                : c
            );
            let newStatus = rec.status;
            if (rec.status === 'Completed') newStatus = 'Live';
            await updateDoc(recRef, { candidates: updatedCandidates, status: newStatus });
          }
        }
      }
    } catch (err) {
      console.warn('Could not free slot on bulk delete', err);
    }

    const timelineSnap = await getDocs(collection(db, 'agents', agentId, 'timeline'));
    const batch = writeBatch(db);
    let count = 0;
    for (const d of timelineSnap.docs) {
      batch.delete(d.ref);
      count++;
      if (count >= 450) { await batch.commit(); count = 0; }
    }
    if (count > 0) await batch.commit();
    await deleteDoc(doc(db, 'agents', agentId));
  }
}
export async function bulkAssignTeam(agentIds, newTeamId, newTeamName, agents, teams, actorName) {
  for (const agentId of agentIds) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) continue;
    const oldTeam = teams.find(t => t.id === agent.teamId);
    const oldTeamName = oldTeam?.name;
    await updateDoc(doc(db, 'agents', agentId), { teamId: newTeamId || null });
    const title = newTeamId
      ? (oldTeamName ? `Team changed: ${oldTeamName} → ${newTeamName}` : `Assigned to team: ${newTeamName}`)
      : `Removed from team: ${oldTeamName || 'Unknown'}`;
    await addTimelineEvent(agentId, {
      type: 'comment', title: `${title} (bulk)`, note: '', createdBy: actorName,
    });
  }
}
export async function bulkAssignTrainer(agentIds, newTrainerId, newTrainerName, agents, trainers, actorName) {
  for (const agentId of agentIds) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) continue;
    const oldTrainer = trainers.find(t => t.id === agent.trainerId);
    const oldTrainerName = oldTrainer?.name;
    await updateDoc(doc(db, 'agents', agentId), { trainerId: newTrainerId || null });
    const title = newTrainerId
      ? (oldTrainerName ? `Trainer changed: ${oldTrainerName} → ${newTrainerName}` : `Assigned to trainer: ${newTrainerName}`)
      : `Trainer removed: ${oldTrainerName || 'Unknown'}`;
    await addTimelineEvent(agentId, {
      type: 'comment', title: `${title} (bulk)`, note: '', createdBy: actorName,
    });
  }
}

// ============ TIMELINE ============
export function subscribeTimeline(agentId, callback) {
  const q = query(collection(db, 'agents', agentId, 'timeline'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function addTimelineEvent(agentId, { type, title, note, date, createdBy }) {
  await addDoc(collection(db, 'agents', agentId, 'timeline'), {
    type, title, note: note || '',
    date: date || new Date().toISOString().split('T')[0],
    createdBy: createdBy || 'System',
    createdAt: serverTimestamp(),
  });
}
export async function deleteTimelineEvent(agentId, eventId) {
  await deleteDoc(doc(db, 'agents', agentId, 'timeline', eventId));
}

// ============ USERS ============
export function subscribeUsers(callback) {
  return onSnapshot(collection(db, 'users'), (snap) => {
    const users = snap.docs.map(d => {
      const { pinHash, ...rest } = d.data();
      return { id: d.id, ...rest };
    });
    callback(users);
  });
}
export async function deleteUser(userId) { await deleteDoc(doc(db, 'users', userId)); }
