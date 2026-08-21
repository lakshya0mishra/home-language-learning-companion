import './TopicCard.css';

export default function TopicCard({ topic, onClick, isSaved, showGrade = false }) {
  return (
    <button
      className="topic-card"
      onClick={() => onClick(topic)}
      aria-label={`${topic.title_school} - ${topic.title_home}`}
    >
      <div className="topic-card-icon">
        <span className="topic-card-emoji">{topic.image_emoji}</span>
      </div>
      <div className="topic-card-content">
        <h3 className="topic-card-title">{topic.title_school}</h3>
        <p className="topic-card-subtitle">{topic.title_home}</p>
        <div className="topic-card-meta">
          {showGrade && (
            <span className="badge badge-grade">Grade {topic.grade}</span>
          )}
          <span className="topic-card-pages">
            p. {topic.page_numbers.join(', ')}
          </span>
        </div>
      </div>
      <div className="topic-card-right">
        {isSaved && (
          <span className="topic-card-saved" aria-label="Saved for offline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-success)">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
        )}
        <svg className="topic-card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 6L15 12L9 18" stroke="var(--color-text-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}
