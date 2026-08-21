import { useState, useEffect, useCallback, useRef } from 'react';
import './AudioPlayer.css';

export default function AudioPlayer({ text, lang, label, colorClass = 'school' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const utteranceRef = useRef(null);
  const sentencesRef = useRef([]);

  // Split text into sentences
  useEffect(() => {
    if (text) {
      sentencesRef.current = text
        .split(/(?<=[.!?।\n])\s*/)
        .filter(s => s.trim().length > 0);
    }
  }, [text]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentSentenceIndex(-1);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const play = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    stop();
    const sentences = sentencesRef.current;
    if (sentences.length === 0) return;

    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= sentences.length) {
        setIsPlaying(false);
        setProgress(100);
        setCurrentSentenceIndex(-1);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentences[currentIndex]);
      utterance.lang = lang;
      utterance.rate = 0.85;
      utterance.pitch = 1.05;

      // Try to find a matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang === lang) ||
        voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setCurrentSentenceIndex(currentIndex);
        setProgress(Math.round((currentIndex / sentences.length) * 100));
      };

      utterance.onend = () => {
        currentIndex++;
        speakNext();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled') {
          currentIndex++;
          speakNext();
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    setIsPlaying(true);
    speakNext();
  }, [lang, isPaused, stop]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <div className={`audio-player audio-player-${colorClass}`} role="region" aria-label={`Audio player for ${label}`}>
      <button
        className={`audio-play-btn audio-play-btn-${colorClass} ${isPlaying ? 'playing' : ''}`}
        onClick={handlePlayPause}
        aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z"/>
          </svg>
        )}
      </button>
      <div className="audio-info">
        <span className="audio-label">{label}</span>
        <div className="audio-progress-track">
          <div
            className={`audio-progress-bar audio-progress-bar-${colorClass}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {(isPlaying || isPaused) && (
        <button
          className="audio-stop-btn"
          onClick={stop}
          aria-label="Stop audio"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// Export currentSentenceIndex for parent consumption
AudioPlayer.useSentenceHighlight = function useSentenceHighlight() {
  const [index, setIndex] = useState(-1);
  return [index, setIndex];
};
