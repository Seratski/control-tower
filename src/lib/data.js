// src/lib/data.js
import {
  collection, doc, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, query, orderBy, serverTimestamp, arrayUnion, arrayRemove, getDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase.js';

// ============ SKILLS ============
export function subscribeSkills(callback) {
  const q = query(collection(db, 'skills'), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    const skills = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(skills);
  });
}

export async function updateSkillTarget(skillId, targetVolumePct) {
  await updateDoc(doc(db, 'skills', skillId), { targetVolumePct });
}

export async function createSkill({ name, description, targetVolumePct, order }) {
  const cleanId = 's_' + name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const finalId = cleanId + '_' + Date.now().toString().slice(-4);
  await setDoc(doc(db, 'skills', finalId), {
    name: name.trim(),
    description: description.trim(),
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

export async function deleteSkill(skillId) {
  await deleteDoc(doc(db, 'skills', skillId));
}

// ============ TEAMS ============
export function subscribeTeams(callback) {
  const q = query(collection(db, 'teams'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => {
    const teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(teams);
  });
}

export async function createTeam({ name, market }) {
  const cleanId = 't_' + name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const finalId = cleanId + '_' + Date.now().toString().slice(-4);
  await setDoc(doc(db, 'teams', finalId), {
    name: name.trim(),
    market,
    createdAt: serverTimestamp(),
  });
  return finalId;
}

export async function updateTeam(teamId, updates) {
  const cleanUpdates = {};
  if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
  if (updates.market !== undefined) cleanUpdates.market = updates.market;
  await updateDoc(doc(db, 'teams', teamId), cleanUpdates);
}

export async function deleteTeam(teamId) {
  await deleteDoc(doc(db, 'teams', teamId));
}

// ============ TRAINERS ============
export function subscribeTrainers(callback) {
  const q = query(collection(db, 'trainers'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => {
    const trainers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(trainers);
  });
}

export async function createTrainer({ name, market, certifiedSkills }) {
  const cleanId = 'tr_' + name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const finalId = cleanId + '_' + Date.now().toString().slice(-4);
  await setDoc(doc(db, 'trainers', finalId), {
    name: name.trim(),
    market,
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

export async function deleteTrainer(trainerId) {
  await deleteDoc(doc(db, 'trainers', trainerId));
}

export async function toggleTrainerSkill(trainerId, skillId, currentlyCertified) {
  await updateDoc(doc(db, 'trainers', trainerId), {
    certifiedSkills: currentlyCertified ? arrayRemove(skillId) : arrayUnion(skillId),
  });
}

// ============ AGENTS ============
export function subscribeAgents(callback) {
  const q = query(collection(db, 'agents'), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => {
    const agents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(agents);
  });
}

export async function toggleAgentSkill(agentId, skillId, skillName, assign, actorName) {
  const agentRef = doc(db, 'agents', agentId);
  await updateDoc(agentRef, {
    skills: assign ? arrayUnion(skillId) : arrayRemove(skillId),
  });
  await addTimelineEvent(agentId, {
    type: 'skill',
    title: assign ? `${skillName} skill assigned` : `${skillName} skill removed`,
    note: '',
    createdBy: actorName,
  });
}

export async function createAgent({ name, market, startDate, status, teamId, trainerId, actorName }) {
  const newAgent = {
    name,
    market,
    startDate,
    status,
    skills: [],
    teamId: teamId || null,
    trainerId: trainerId || null,
    onboardingComplete: status === 'Active',
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, 'agents'), newAgent);
  await addTimelineEvent(ref.id, {
    type: 'onboarding',
    title: 'Agent profile created',
    note: '',
    createdBy: actorName,
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
  await addTimelineEvent(agentId, {
    type: 'comment',
    title,
    note: '',
    createdBy: actorName,
  });
}

export async function changeAgentTrainer(agentId, newTrainerId, newTrainerName, oldTrainerName, actorName) {
  await updateDoc(doc(db, 'agents', agentId), { trainerId: newTrainerId || null });
  const title = newTrainerId
    ? (oldTrainerName ? `Trainer changed: ${oldTrainerName} → ${newTrainerName}` : `Assigned to trainer: ${newTrainerName}`)
    : `Trainer removed: ${oldTrainerName || 'Unknown'}`;
  await addTimelineEvent(agentId, {
    type: 'comment',
    title,
    note: '',
    createdBy: actorName,
  });
}

export async function deleteAgent(agentId) {
  const timelineSnap = await getDocs(collection(db, 'agents', agentId, 'timeline'));
  await Promise.all(timelineSnap.docs.map(d => deleteDoc(d.ref)));
  await deleteDoc(doc(db, 'agents', agentId));
}

// ============ TIMELINE ============
export function subscribeTimeline(agentId, callback) {
  // Sort by createdAt (newest first) for second-precision ordering
  const q = query(collection(db, 'agents', agentId, 'timeline'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(events);
  });
}

export async function addTimelineEvent(agentId, { type, title, note, date, createdBy }) {
  await addDoc(collection(db, 'agents', agentId, 'timeline'), {
    type,
    title,
    note: note || '',
    date: date || new Date().toISOString().split('T')[0],
    createdBy: createdBy || 'System',
    createdAt: serverTimestamp(),
  });
}

export async function deleteTimelineEvent(agentId, eventId) {
  await deleteDoc(doc(db, 'agents', agentId, 'timeline', eventId));
}

// ============ USERS (admin) ============
export function subscribeUsers(callback) {
  return onSnapshot(collection(db, 'users'), (snap) => {
    const users = snap.docs.map(d => {
      const { pinHash, ...rest } = d.data();
      return { id: d.id, ...rest };
    });
    callback(users);
  });
}

export async function deleteUser(userId) {
  await deleteDoc(doc(db, 'users', userId));
}
