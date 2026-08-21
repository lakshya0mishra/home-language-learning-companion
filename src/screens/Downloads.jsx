import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSubject } from '../data/grades';
import Header from '../components/Header';
import './Downloads.css';

export default function Downloads() {
  const { savedTopics, removeTopic, isOfflineMode, toggleOfflineMode } = useApp();
  const navigate = useNavigate();

  const handleTopicClick = (topic) => {
    navigate(`/content/${topic.topic_id}`);
  };

  const handleRemove = (e, topicId) => {
    e.stopPropagation();
    removeTopic(topicId);
  };

  return (
    <div className="screen screen-with-header downloads-screen">
      <Header title="My Downloads" showBack />

      {/* Offline toggle */}
      <div className="downloads-offline-bar">
        <div className="downloads-offline-info">
          <span className="downloads-offline-icon">
            {isOfflineMode ? '📴' : '📶'}
          </span>
          <div>
            <span className="downloads-offline-label">
              {isOfflineMode ? 'Offline Mode' : 'Online'}
            </span>
            <span className="downloads-offline-sub">
              {isOfflineMode ? 'Using saved content only' : 'Connected to internet'}
            </span>
          </div>
        </div>
        <button
          className={`downloads-toggle ${isOfflineMode ? 'active' : ''}`}
          onClick={toggleOfflineMode}
          role="switch"
          aria-checked={isOfflineMode}
          aria-label="Toggle offline mode"
        >
          <div className="downloads-toggle-thumb" />
        </button>
      </div>

      {/* Content */}
      {savedTopics.length > 0 ? (
        <>
          <p className="downloads-count">
            {savedTopics.length} {savedTopics.length === 1 ? 'topic' : 'topics'} saved for offline
          </p>
          <div className="downloads-list">
            {savedTopics.map((topic, i) => {
              const subjectInfo = getSubject(topic.subject);
              return (
                <button
                  key={topic.topic_id}
                  className="downloads-card"
                  onClick={() => handleTopicClick(topic)}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="downloads-card-icon">
                    <span>{topic.image_emoji}</span>
                  </div>
                  <div className="downloads-card-content">
                    <h3 className="downloads-card-title">{topic.title_school}</h3>
                    <p className="downloads-card-subtitle">{topic.title_home}</p>
                    <div className="downloads-card-meta">
                      <span className="badge badge-grade">Grade {topic.grade}</span>
                      {subjectInfo && (
                        <span className="text-small text-muted">{subjectInfo.icon} {subjectInfo.label}</span>
                      )}
                    </div>
                  </div>
                  <div className="downloads-card-actions">
                    <span className="downloads-offline-badge">
                      📱 Offline
                    </span>
                    <button
                      className="downloads-remove-btn"
                      onClick={(e) => handleRemove(e, topic.topic_id)}
                      aria-label={`Remove ${topic.title_school} from downloads`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="downloads-empty">
          <div className="downloads-empty-illustration">
            <span className="downloads-empty-emoji">📥</span>
          </div>
          <h2 className="downloads-empty-title">No Downloads Yet</h2>
          <p className="downloads-empty-desc">
            Save topics to access them offline — perfect for learning without internet!
          </p>
          <button
            className="btn btn-primary btn-lg btn-full mt-lg"
            onClick={() => navigate('/browse')}
          >
            📚 Browse Topics to Save
          </button>
        </div>
      )}
    </div>
  );
}
