// scripts/seed.js
// Run once after Firebase project setup:
//   node scripts/seed.js
// This populates initial skills and creates the first admin user.
// Make sure .env.local is filled out first.

import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { createHash } from 'crypto';

// Load env manually (scripts run outside Vite)
const env = readFileSync('.env.local', 'utf8')
  .split('\n')
  .filter(l => l && !l.startsWith('#'))
  .reduce((acc, line) => {
    const [k, ...rest] = line.split('=');
    acc[k.trim()] = rest.join('=').trim();
    return acc;
  }, {});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function hashPin(pin) {
  return createHash('sha256').update(pin).digest('hex');
}

// Skills from POWER learning strategy
const SKILLS = [
  { id: 's_basic',      order: 1, name: 'Basic',       description: 'Grundlæggende kundeservice',     targetVolumePct: 100 },
  { id: 's_aftersales', order: 2, name: 'After Sales', description: 'Reklamationer og eftermarked',   targetVolumePct: 35 },
  { id: 's_delivery',   order: 3, name: 'Delivery',    description: 'Leveringsspørgsmål og logistik', targetVolumePct: 25 },
  { id: 's_eletra',     order: 4, name: 'Eletra',      description: 'Hvidevarer og installation',     targetVolumePct: 15 },
  { id: 's_b2b',        order: 5, name: 'B2B',         description: 'Erhvervskunder',                 targetVolumePct: 10 },
  { id: 's_product',    order: 6, name: 'Product',     description: 'Produktspecifik support',        targetVolumePct: 20 },
  { id: 's_teamleader', order: 7, name: 'Team Leader', description: 'Teamleder kompetencer',          targetVolumePct: 5 },
  { id: 's_trainer',    order: 8, name: 'Trainer',     description: 'Træner kompetencer',             targetVolumePct: 3 },
];

// CHANGE THIS — first admin user
const FIRST_ADMIN = {
  username: 'admin',
  displayName: 'System Admin',
  pin: '123456', // CHANGE IMMEDIATELY after first login
  role: 'admin',
};

async function seed() {
  console.log('🌱 Seeding Control Tower...\n');

  // Check if already seeded
  const existing = await getDocs(collection(db, 'skills'));
  if (!existing.empty) {
    console.log(`⚠️  Found ${existing.size} existing skills. Skipping skill seed.`);
  } else {
    console.log('Creating skills:');
    for (const s of SKILLS) {
      const { id, ...data } = s;
      await setDoc(doc(db, 'skills', id), { ...data, createdAt: serverTimestamp() });
      console.log(`  ✓ ${s.name} (target ${s.targetVolumePct}%)`);
    }
  }

  // Check for existing admin
  const users = await getDocs(collection(db, 'users'));
  const hasAdmin = users.docs.some(d => d.data().role === 'admin');
  if (hasAdmin) {
    console.log('\n⚠️  At least one admin user already exists. Skipping admin seed.');
  } else {
    console.log('\nCreating first admin user:');
    const uid = `u_${FIRST_ADMIN.username}_${Date.now()}`;
    await setDoc(doc(db, 'users', uid), {
      username: FIRST_ADMIN.username,
      displayName: FIRST_ADMIN.displayName,
      pinHash: hashPin(FIRST_ADMIN.pin),
      role: FIRST_ADMIN.role,
      createdAt: serverTimestamp(),
    });
    console.log(`  ✓ Username: ${FIRST_ADMIN.username}`);
    console.log(`  ✓ PIN: ${FIRST_ADMIN.pin}  ← CHANGE THIS FROM THE UI AFTER FIRST LOGIN`);
  }

  console.log('\n✅ Seed complete.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
