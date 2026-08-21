export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', bcp47: 'en-US', label: 'English' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', bcp47: 'hi-IN', label: 'Hindi' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', bcp47: 'sw-KE', label: 'Swahili' },
  { code: 'es', name: 'Español', flag: '🇪🇸', bcp47: 'es-ES', label: 'Spanish' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', bcp47: 'fr-FR', label: 'French' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', bcp47: 'ta-IN', label: 'Tamil' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳', bcp47: 'mr-IN', label: 'Marathi' },
];

export const getLanguage = (code) => languages.find(l => l.code === code);
