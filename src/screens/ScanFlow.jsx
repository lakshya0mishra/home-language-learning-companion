import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getTopicByPageNumber } from '../data/content';
import Header from '../components/Header';
import './ScanFlow.css';

export default function ScanFlow() {
  const [phase, setPhase] = useState('camera'); // camera | manual | processing | no-match
  const [pageInput, setPageInput] = useState('');
  const { grade } = useApp();
  const navigate = useNavigate();

  const handleCapture = () => {
    setPhase('processing');
    // Simulate OCR - pick a random page from known content
    const knownPages = [12, 22, 30, 5, 15, 25, 45, 55, 62, 70, 35, 50, 60];
    const randomPage = knownPages[Math.floor(Math.random() * knownPages.length)];
    
    setTimeout(() => {
      const topic = getTopicByPageNumber(grade, randomPage);
      if (topic) {
        navigate(`/content/${topic.topic_id}`);
      } else {
        // Try the other grade
        const topic2 = getTopicByPageNumber(grade === 2 ? 4 : 2, randomPage);
        if (topic2) {
          navigate(`/content/${topic2.topic_id}`);
        } else {
          setPhase('no-match');
        }
      }
    }, 2500);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (!page || page < 1) return;

    setPhase('processing');
    setTimeout(() => {
      const topic = getTopicByPageNumber(grade, page) || getTopicByPageNumber(grade === 2 ? 4 : 2, page);
      if (topic) {
        navigate(`/content/${topic.topic_id}`);
      } else {
        setPhase('no-match');
      }
    }, 1500);
  };

  return (
    <div className="screen screen-with-header scan-screen">
      <Header title="Scan Page" showBack />

      {/* Camera View */}
      {phase === 'camera' && (
        <div className="scan-camera" key="camera">
          <div className="scan-viewfinder">
            <div className="scan-frame">
              <div className="scan-corner scan-corner-tl" />
              <div className="scan-corner scan-corner-tr" />
              <div className="scan-corner scan-corner-bl" />
              <div className="scan-corner scan-corner-br" />
              <div className="scan-line" />
            </div>
            <div className="scan-fake-preview">
              <span className="scan-book-icon">📖</span>
              <p>Point camera at textbook page</p>
            </div>
          </div>
          <p className="scan-instruction">
            Align the textbook page inside the frame
          </p>
          <button
            className="scan-capture-btn"
            onClick={handleCapture}
            aria-label="Capture page"
          >
            <div className="scan-capture-inner" />
          </button>
          <button
            className="btn btn-ghost btn-full mt-md"
            onClick={() => setPhase('manual')}
          >
            Or enter page number manually →
          </button>
        </div>
      )}

      {/* Manual Entry */}
      {phase === 'manual' && (
        <div className="scan-manual" key="manual">
          <div className="scan-manual-illustration">
            <span className="scan-manual-icon">🔢</span>
          </div>
          <h2 className="scan-manual-title">Enter Page Number</h2>
          <p className="scan-manual-desc">
            Type the page number from your textbook and we'll find the matching content.
          </p>
          <form onSubmit={handleManualSubmit} className="scan-manual-form">
            <input
              type="number"
              className="scan-page-input"
              placeholder="e.g. 12"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              min="1"
              max="200"
              autoFocus
              aria-label="Page number"
            />
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={!pageInput}>
              Find Content 🔍
            </button>
          </form>
          <button className="btn btn-ghost btn-full mt-md" onClick={() => setPhase('camera')}>
            ← Back to camera
          </button>
          <div className="scan-hint mt-lg">
            <p className="text-small text-muted text-center">
              💡 Try page numbers like <strong>12, 22, 45, 55, 70</strong> for our demo content
            </p>
          </div>
        </div>
      )}

      {/* Processing */}
      {phase === 'processing' && (
        <div className="scan-processing" key="processing">
          <div className="scan-loading">
            <div className="scan-loading-book">
              <span className="scan-loading-emoji">📖</span>
              <div className="scan-loading-sparkles">
                <span className="sparkle s1">✨</span>
                <span className="sparkle s2">⭐</span>
                <span className="sparkle s3">✨</span>
              </div>
            </div>
            <h3 className="scan-loading-text">Reading your page...</h3>
            <p className="scan-loading-sub">Finding matching content in both languages</p>
            <div className="scan-loading-bar">
              <div className="scan-loading-bar-fill" />
            </div>
          </div>
        </div>
      )}

      {/* No Match */}
      {phase === 'no-match' && (
        <div className="scan-no-match" key="no-match">
          <div className="scan-no-match-illustration">
            <span className="scan-no-match-emoji">🔍</span>
          </div>
          <h2 className="scan-no-match-title">Page Not Found</h2>
          <p className="scan-no-match-desc">
            We couldn't find content for that page yet. Don't worry — you can browse by topic instead!
          </p>
          <button
            className="btn btn-primary btn-lg btn-full mt-lg"
            onClick={() => navigate('/browse')}
          >
            📚 Browse by Topic
          </button>
          <button
            className="btn btn-secondary btn-lg btn-full mt-md"
            onClick={() => setPhase('camera')}
          >
            📷 Try Scanning Again
          </button>
          <button
            className="btn btn-ghost btn-full mt-sm"
            onClick={() => setPhase('manual')}
          >
            Enter page number manually
          </button>
        </div>
      )}
    </div>
  );
}
