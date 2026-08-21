import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── User Profile ─────────────────────────────────────────

/**
 * Creates or updates a user document on login.
 * Merges so it never overwrites existing profile fields.
 */
export async function createOrUpdateUser(firebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    // Returning user — preserve everything, only update lastLoginAt and basic profile metadata if available
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      email: firebaseUser.email || '',
    }, { merge: true });
  } else {
    // New user — create full profile with defaults
    await setDoc(userRef, {
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      grade: null,
      schoolLanguage: null,
      homeLanguage: null,
      subjectInterests: [],
      onboardingComplete: false,
      theme: 'light',
    }, { merge: true });
  }
}

/**
 * Fetch the full user profile document.
 */
export async function getUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { uid, ...snap.data() };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

/**
 * Update arbitrary profile fields (grade, languages, theme, etc.)
 */
export async function updateStudentProfile(uid, data) {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });
  } catch (err) {
    console.error('Error updating student profile:', err);
  }
}

// ─── Study History ────────────────────────────────────────

/**
 * Record that a student studied a topic.
 */
export async function recordTopicStudied(uid, topicData) {
  const historyRef = collection(db, 'users', uid, 'studyHistory');
  await addDoc(historyRef, {
    topicId: topicData.topic_id || topicData.topicId,
    topicTitle: topicData.title_school || topicData.topicTitle || '',
    subject: topicData.subject || '',
    grade: topicData.grade || null,
    studiedAt: serverTimestamp(),
  });
}

/**
 * Get all studied topics for a student, ordered by most recent.
 */
export async function getStudyHistory(uid) {
  const historyRef = collection(db, 'users', uid, 'studyHistory');
  const q = query(historyRef, orderBy('studiedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Saved Topics (offline) ──────────────────────────────

/**
 * Save a topic for offline access.
 */
export async function saveTopic(uid, topic) {
  const topicId = topic.topic_id || topic.topicId;
  const topicRef = doc(db, 'users', uid, 'savedTopics', topicId);
  await setDoc(topicRef, {
    ...topic,
    savedAt: serverTimestamp(),
  });
}

/**
 * Remove a saved topic.
 */
export async function removeSavedTopic(uid, topicId) {
  const topicRef = doc(db, 'users', uid, 'savedTopics', topicId);
  await deleteDoc(topicRef);
}

/**
 * Get all saved topics for a student.
 */
export async function getSavedTopics(uid) {
  const topicsRef = collection(db, 'users', uid, 'savedTopics');
  const snap = await getDocs(topicsRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
