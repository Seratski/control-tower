// src/lib/auth.js
// PIN-based auth. PIN is hashed client-side (SHA-256) before Firestore lookup.
// NOTE: This is internal-use security — not suitable for public/sensitive data.
// For higher security, swap to Firebase Auth with Microsoft 365 SSO.

import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';

const SESSION_KEY = 'ct_session';

export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Attempts login with username + 6-digit PIN.
 * Returns { user, role } on success, throws on failure.
 */
export async function loginWithPin(username, pin) {
  if (!/^\d{6}$/.test(pin)) {
    throw new Error('PIN must be 6 digits');
  }
  const pinHash = await hashPin(pin);
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase().trim()));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('User not found');
  }

  const userDoc = snap.docs[0];
  const data = userDoc.data();

  if (data.pinHash !== pinHash) {
    throw new Error('Incorrect PIN');
  }

  const session = {
    uid: userDoc.id,
    username: data.username,
    displayName: data.displayName,
    role: data.role,
    loggedInAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    // Session expires after 12 hours
    if (Date.now() - s.loggedInAt > 12 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Create a new user (admin-only operation, enforce in UI).
 */
export async function createUser({ username, displayName, pin, role }) {
  if (!/^\d{6}$/.test(pin)) {
    throw new Error('PIN must be 6 digits');
  }
  const pinHash = await hashPin(pin);
  const uid = `u_${username.toLowerCase().trim()}_${Date.now()}`;
  await setDoc(doc(db, 'users', uid), {
    username: username.toLowerCase().trim(),
    displayName,
    pinHash,
    role,
    createdAt: serverTimestamp(),
  });
  return uid;
}
