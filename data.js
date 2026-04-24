// src/lib/data.js
import {
  collection, doc, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, query, orderBy, serverTimestamp, arrayUnion, arrayRemove, getDoc,
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

export async function createAgent({ name, market, startDate, status, actorName }) {
  const newAgent = {
    name,
    market,
    startDate,
    status,
    skills: [],
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

export async function deleteAgent(agentId) {
  const timelineSnap = await getDocs(collection(db, 'agents', agentId, 'timeline'));
  await Promise.all(timelineSnap.docs.map(d => deleteDoc(d.ref)));
  await deleteDoc(doc(db, 'agents', agentId));
}

// ============ TIMELINE ============
export function subscribeTimeline(agentId, callback) {
  const q = query(collection(db, 'agents', agentId, 'timeline'), orderBy('date', 'desc'));
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
