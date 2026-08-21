import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserProfile,
  updateStudentProfile,
  saveTopic as firestoreSaveTopic,
  removeSavedTopic,
  getSavedTopics,
  getStudyHistory as fetchFirestoreStudyHistory,
} from '../services/firestoreService';

const AppContext = createContext(null);

const defaultState = {
  onboardingComplete: false,
  schoolLanguage: null,
  homeLanguage: null,
  grade: null,
  subjectInterests: [],
  savedTopics: [],
  lastBrowseGrade: null,
  lastBrowseSubject: null,
  isOfflineMode: false,
  theme: 'light',
  profileLoaded: false,
};

export function AppProvider({ children }) {
  const { user, isLoggedIn, signOut } = useAuth();
  const [state, setState] = useState(defaultState);

  // ─── Load profile from Firestore & local cache when user logs in ──────
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setState(prev => ({ ...defaultState, theme: prev.theme }));
      return;
    }

    let cancelled = false;
    const userEmail = user.email || user.uid;
    const cacheKey = `homelanguage_profile_${userEmail.toLowerCase()}`;

    // Seed state immediately with cached data if available for instant restore
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setState(prev => ({
          ...prev,
          ...parsed,
          profileLoaded: true,
        }));
      }
    } catch {
      // ignore JSON parse error
    }

    async function loadProfile() {
      try {
        const [profile, topics] = await Promise.all([
          getUserProfile(user.uid),
          getSavedTopics(user.uid),
        ]);

        if (cancelled) return;

        if (profile) {
          const freshData = {
            onboardingComplete: profile.onboardingComplete !== undefined ? profile.onboardingComplete : false,
            schoolLanguage: profile.schoolLanguage || null,
            homeLanguage: profile.homeLanguage || null,
            grade: profile.grade || null,
            subjectInterests: profile.subjectInterests || [],
            savedTopics: topics && topics.length > 0 ? topics : [],
            lastBrowseGrade: profile.lastBrowseGrade || null,
            lastBrowseSubject: profile.lastBrowseSubject || null,
            isOfflineMode: false,
            theme: profile.theme || 'light',
            profileLoaded: true,
          };

          setState(freshData);

          // Update local cache for this email
          try {
            localStorage.setItem(cacheKey, JSON.stringify(freshData));
          } catch {
            // ignore
          }
        } else {
          setState(prev => ({ ...prev, profileLoaded: true }));
        }
      } catch (err) {
        console.error('Failed to load user profile from Firestore:', err);
        if (!cancelled) {
          setState(prev => ({ ...prev, profileLoaded: true }));
        }
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [isLoggedIn, user]);

  // ─── Sync theme attribute to HTML element ───────────────
  useEffect(() => {
    if (state.theme) {
      document.documentElement.setAttribute('data-theme', state.theme);
    }
  }, [state.theme]);

  // ─── Helpers ────────────────────────────────────────────

  const syncToFirestore = useCallback(async (updates) => {
    if (!user) return;
    try {
      await updateStudentProfile(user.uid, updates);

      // Also persist to email-based cache
      const userEmail = user.email || user.uid;
      const cacheKey = `homelanguage_profile_${userEmail.toLowerCase()}`;
      try {
        const currentCached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        localStorage.setItem(cacheKey, JSON.stringify({ ...currentCached, ...updates }));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to sync to Firestore:', err);
    }
  }, [user]);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // ─── Onboarding ─────────────────────────────────────────

  const completeOnboarding = useCallback(async (data) => {
    const updates = {
      ...data,
      onboardingComplete: true,
    };
    updateState(updates);
    await syncToFirestore(updates);
  }, [updateState, syncToFirestore]);

  // ─── Topics ─────────────────────────────────────────────

  const saveTopic = useCallback(async (topic) => {
    setState(prev => {
      if (prev.savedTopics.find(t => (t.topic_id || t.id) === (topic.topic_id || topic.id))) {
        return prev;
      }
      return {
        ...prev,
        savedTopics: [...prev.savedTopics, { ...topic, savedAt: Date.now() }],
      };
    });

    if (user) {
      try {
        await firestoreSaveTopic(user.uid, topic);
      } catch (err) {
        console.error('Failed to save topic to Firestore:', err);
      }
    }
  }, [user]);

  const removeTopic = useCallback(async (topicId) => {
    setState(prev => ({
      ...prev,
      savedTopics: prev.savedTopics.filter(t => (t.topic_id || t.id) !== topicId),
    }));

    if (user) {
      try {
        await removeSavedTopic(user.uid, topicId);
      } catch (err) {
        console.error('Failed to remove topic from Firestore:', err);
      }
    }
  }, [user]);

  const isTopicSaved = useCallback((topicId) => {
    return state.savedTopics.some(t => (t.topic_id || t.id) === topicId);
  }, [state.savedTopics]);

  // ─── Settings ───────────────────────────────────────────

  const updateSettings = useCallback(async (settings) => {
    updateState(settings);
    await syncToFirestore(settings);
  }, [updateState, syncToFirestore]);

  const setLastBrowse = useCallback(async (grade, subject) => {
    const updates = { lastBrowseGrade: grade, lastBrowseSubject: subject };
    updateState(updates);
    await syncToFirestore(updates);
  }, [updateState, syncToFirestore]);

  const toggleOfflineMode = useCallback(() => {
    updateState({ isOfflineMode: !state.isOfflineMode });
  }, [state.isOfflineMode, updateState]);

  const toggleTheme = useCallback(async () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    updateState({ theme: newTheme });
    await syncToFirestore({ theme: newTheme });
  }, [state.theme, updateState, syncToFirestore]);

  const logout = useCallback(async () => {
    setState(defaultState);
    await signOut();
  }, [signOut]);

  const resetApp = useCallback(async () => {
    setState(defaultState);
    await signOut();
  }, [signOut]);

  const fetchStudyHistory = useCallback(async () => {
    if (!user) return [];
    try {
      return await fetchFirestoreStudyHistory(user.uid);
    } catch (err) {
      console.error('Failed to fetch study history:', err);
      return [];
    }
  }, [user]);

  const value = {
    ...state,
    isLoggedIn,
    user: user ? {
      name: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      uid: user.uid,
    } : null,
    completeOnboarding,
    saveTopic,
    removeTopic,
    isTopicSaved,
    updateSettings,
    setLastBrowse,
    toggleOfflineMode,
    toggleTheme,
    fetchStudyHistory,
    logout,
    resetApp,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
