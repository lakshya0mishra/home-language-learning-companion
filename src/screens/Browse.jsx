import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { grades, subjects } from '../data/grades';
import { getTopicsByGradeAndSubject, getAllGradesWithContent, getSubjectsForGrade } from '../data/content';
import Header from '../components/Header';
import TopicCard from '../components/TopicCard';
import './Browse.css';

export default function Browse() {
  const { grade: userGrade, lastBrowseGrade, lastBrowseSubject, setLastBrowse, isTopicSaved } = useApp();
  const navigate = useNavigate();

  const [selectedGrade, setSelectedGrade] = useState(lastBrowseGrade || userGrade || 2);
  const [selectedSubject, setSelectedSubject] = useState(lastBrowseSubject || 'language');
  const [topics, setTopics] = useState([]);

  const availableGrades = getAllGradesWithContent();
  const availableSubjects = getSubjectsForGrade(selectedGrade);

  useEffect(() => {
    const results = getTopicsByGradeAndSubject(selectedGrade, selectedSubject);
    setTopics(results);
    setLastBrowse(selectedGrade, selectedSubject);
  }, [selectedGrade, selectedSubject]);

  // If the subject is not available for the grade, switch to first available
  useEffect(() => {
    if (!availableSubjects.includes(selectedSubject) && availableSubjects.length > 0) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [selectedGrade, availableSubjects, selectedSubject]);

  const handleTopicClick = (topic) => {
    navigate(`/content/${topic.topic_id}`);
  };

  return (
    <div className="screen screen-with-header browse-screen">
      <Header title="Browse Topics" showBack />

      {/* Grade selector */}
      <div className="browse-section">
        <h3 className="browse-section-label">
          <span className="browse-section-icon">🎓</span> Choose Grade
        </h3>
        <div className="browse-grade-row">
          {grades.filter(g => availableGrades.includes(g.id)).map(g => (
            <button
              key={g.id}
              className={`browse-grade-btn ${selectedGrade === g.id ? 'active' : ''}`}
              onClick={() => setSelectedGrade(g.id)}
              aria-pressed={selectedGrade === g.id}
            >
              <span className="browse-grade-icon">{g.icon}</span>
              <span className="browse-grade-label">Grade {g.id}</span>
            </button>
          ))}
          {/* Show empty grades as coming soon */}
          {grades.filter(g => !availableGrades.includes(g.id)).map(g => (
            <button
              key={g.id}
              className="browse-grade-btn disabled"
              disabled
              aria-disabled="true"
            >
              <span className="browse-grade-icon">{g.icon}</span>
              <span className="browse-grade-label">Grade {g.id}</span>
              <span className="browse-coming-soon">Soon</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subject selector */}
      <div className="browse-section">
        <h3 className="browse-section-label">
          <span className="browse-section-icon">📖</span> Choose Subject
        </h3>
        <div className="browse-subject-row">
          {subjects.map(sub => (
            <button
              key={sub.id}
              className={`browse-subject-btn ${selectedSubject === sub.id ? 'active' : ''}`}
              onClick={() => setSelectedSubject(sub.id)}
              aria-pressed={selectedSubject === sub.id}
              disabled={!availableSubjects.includes(sub.id)}
            >
              <span className="browse-subject-icon">{sub.icon}</span>
              <span className="browse-subject-name">{sub.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic list */}
      <div className="browse-section">
        <h3 className="browse-section-label">
          <span className="browse-section-icon">📝</span> Topics
          <span className="browse-count">{topics.length} available</span>
        </h3>
        <div className="browse-topic-list">
          {topics.map((topic, i) => (
            <div key={topic.topic_id} style={{ animationDelay: `${i * 60}ms` }} className="browse-topic-item">
              <TopicCard
                topic={topic}
                onClick={handleTopicClick}
                isSaved={isTopicSaved(topic.topic_id)}
              />
            </div>
          ))}
          {topics.length === 0 && (
            <div className="browse-empty">
              <span className="browse-empty-emoji">📚</span>
              <p className="browse-empty-text">No topics available for this combination yet.</p>
              <p className="browse-empty-sub">Try a different grade or subject!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
