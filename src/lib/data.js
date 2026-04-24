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
  // Log event
  await addTimelineEvent(agentId, {
    type: 'skill',
    title: assign ? `${skillName} skill assigned` : `${skillName} skill removed`,
    note: assign ? `Tildelt af ${actorName}` : `Fjernet af ${actorName}`,
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
    note: `Oprettet af ${actorName}`,
  });
  return ref.id;
}

export async function updateAgent(agentId, updates) {
  await updateDoc(doc(db, 'agents', agentId), updates);
}

export async function deleteAgent(agentId) {
  // Delete timeline subcollection first
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

export async function addTimelineEvent(agentId, { type, title, note, date }) {
  await addDoc(collection(db, 'agents', agentId, 'timeline'), {
    type,
    title,
    note: note || '',
    date: date || new Date().toISOString().split('T')[0],
    createdAt: serverTimestamp(),
  });
}

export async function deleteTimelineEvent(agentId, eventId) {
  await deleteDoc(doc(db, 'agents', agentId, 'timeline', eventId));
}

// ============ USERS (admin) ============
export function subscribeUsers(callback) {
  return onSnapshot(collection(db, 'users'), (snap) => {
    // Never expose pinHash to UI
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
