export const grades = [
  { id: 1, label: 'Grade 1', icon: '🌱', description: 'Just starting!' },
  { id: 2, label: 'Grade 2', icon: '🌻', description: 'Growing strong!' },
  { id: 3, label: 'Grade 3', icon: '🌈', description: 'Reaching higher!' },
  { id: 4, label: 'Grade 4', icon: '⭐', description: 'Shining bright!' },
  { id: 5, label: 'Grade 5', icon: '🚀', description: 'Ready to soar!' },
];

export const subjects = [
  { id: 'language', label: 'Language Arts', icon: '📖', color: '#E07A5F' },
  { id: 'math', label: 'Mathematics', icon: '🔢', color: '#5B8A72' },
];

export const getGrade = (id) => grades.find(g => g.id === id);
export const getSubject = (id) => subjects.find(s => s.id === id);
