import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLanguage } from '../data/languages';
import Header from '../components/Header';
import './VoiceTranslate.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// MyMemory free translation API
async function translateText(text, sourceLang, targetLang) {
  if (!text.trim()) return '';
  const langPair = `${sourceLang}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return '[Translation unavailable]';
  } catch {
    return '[Translation failed — check your connection]';
  }
}

export default function VoiceTranslate() {
  const { schoolLanguage, homeLanguage } = useApp();
  const schoolLang = getLanguage(schoolLanguage);
  const homeLang = getLanguage(homeLanguage);

  // Direction: 'school-to-home' or 'home-to-school'
  const [direction, setDirection] = useState('school-to-home');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const historyEndRef = useRef(null);

  const sourceLang = direction === 'school-to-home' ? schoolLang : homeLang;
  const targetLang = direction === 'school-to-home' ? homeLang : schoolLang;

  const isSupported = !!SpeechRecognition;

  // Scroll history into view when new entry added
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);
  const transcriptRef = useRef('');
  const handleTranslateRef = useRef(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const speakText = useCallback((text, langObj) => {
    if (!text || text.startsWith('[')) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langObj.bcp47;
    utterance.rate = 0.85;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang === langObj.bcp47) ||
      voices.find(v => v.lang.startsWith(langObj.code));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const handleTranslate = useCallback(async (text) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    setTranslation('');
    const result = await translateText(text, sourceLang.code, targetLang.code);
    setTranslation(result);
    setIsTranslating(false);

    if (result && !result.startsWith('[')) {
      // Auto speak translation
      speakText(result, targetLang);

      // Add to history
      setHistory(prev => [
        ...prev.slice(-9), // keep last 10
        {
          id: Date.now(),
          source: text,
          translated: result,
          direction,
          sourceLang: sourceLang,
          targetLang: targetLang,
        },
      ]);
    }
  }, [direction, sourceLang, targetLang, speakText]);

  // Keep handleTranslate reference fresh in a ref
  useEffect(() => {
    handleTranslateRef.current = handleTranslate;
  }, [handleTranslate]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setError('');
    setTranscript('');
    setInterimTranscript('');
    setTranslation('');
    transcriptRef.current = '';

    const recognition = new SpeechRecognition();
    recognition.lang = sourceLang.bcp47;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      const textToStore = final || interim;
      if (final) {
        setTranscript(final);
        transcriptRef.current = final;
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-translate whatever final text we collected
      const finalText = transcriptRef.current;
      if (finalText.trim()) {
        if (handleTranslateRef.current) {
          handleTranslateRef.current(finalText);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, sourceLang]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      // Trigger translation with whatever we have
      const finalText = transcript || interimTranscript;
      if (finalText.trim()) {
        setTranscript(finalText);
        setInterimTranscript('');
        handleTranslate(finalText);
      }
    } else {
      startListening();
    }
  };

  const toggleDirection = () => {
    if (isListening) stopListening();
    setDirection(prev => prev === 'school-to-home' ? 'home-to-school' : 'school-to-home');
    setTranscript('');
    setInterimTranscript('');
    setTranslation('');
    setError('');
  };

  const speakTranslation = () => {
    speakText(translation, targetLang);
  };

  const clearAll = () => {
    if (isListening) stopListening();
    window.speechSynthesis.cancel();
    setTranscript('');
    setInterimTranscript('');
    setTranslation('');
    setError('');
    setIsSpeaking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const displayTranscript = transcript || interimTranscript;

  return (
    <div className="screen screen-with-header voice-translate-screen">
      <Header title="Voice Translate" showBack />

      {/* Direction toggle */}
      <div className="vt-direction-bar">
        <div className={`vt-lang-chip ${direction === 'school-to-home' ? 'vt-lang-chip-source' : 'vt-lang-chip-target'}`}>
          <span className="vt-lang-chip-flag">{schoolLang?.flag}</span>
          <div className="vt-lang-chip-info">
            <span className="vt-lang-chip-label">{direction === 'school-to-home' ? 'From' : 'To'}</span>
            <span className="vt-lang-chip-name">{schoolLang?.label}</span>
          </div>
        </div>

        <button className="vt-swap-btn" onClick={toggleDirection} aria-label="Swap languages">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M7 16L3 12M3 12L7 8M3 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 8L21 12M21 12L17 16M21 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={`vt-lang-chip ${direction === 'school-to-home' ? 'vt-lang-chip-target' : 'vt-lang-chip-source'}`}>
          <span className="vt-lang-chip-flag">{homeLang?.flag}</span>
          <div className="vt-lang-chip-info">
            <span className="vt-lang-chip-label">{direction === 'school-to-home' ? 'To' : 'From'}</span>
            <span className="vt-lang-chip-name">{homeLang?.label}</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="vt-error">
          <span className="vt-error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Unsupported browser fallback */}
      {!isSupported && (
        <div className="vt-unsupported">
          <span className="vt-unsupported-icon">🌐</span>
          <h3>Browser Not Supported</h3>
          <p>Voice recognition works best in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>. Please switch browsers to use this feature.</p>
        </div>
      )}

      {/* Microphone section */}
      {isSupported && (
        <div className="vt-mic-section">
          <p className="vt-mic-hint">
            {isListening
              ? `Listening in ${sourceLang?.label}…`
              : `Tap to speak in ${sourceLang?.label}`
            }
          </p>

          <div className="vt-mic-container">
            {/* Pulse rings when listening */}
            {isListening && (
              <>
                <div className="vt-pulse-ring vt-pulse-ring-1" />
                <div className="vt-pulse-ring vt-pulse-ring-2" />
                <div className="vt-pulse-ring vt-pulse-ring-3" />
              </>
            )}
            <button
              className={`vt-mic-btn ${isListening ? 'vt-mic-btn-active' : ''}`}
              onClick={toggleListening}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                // Waveform bars
                <div className="vt-waveform">
                  <span className="vt-wave-bar vt-wave-bar-1" />
                  <span className="vt-wave-bar vt-wave-bar-2" />
                  <span className="vt-wave-bar vt-wave-bar-3" />
                  <span className="vt-wave-bar vt-wave-bar-4" />
                  <span className="vt-wave-bar vt-wave-bar-5" />
                </div>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" fill="currentColor"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Transcript panel */}
      {displayTranscript && (
        <div className="vt-panel vt-panel-source">
          <div className="vt-panel-header">
            <span className="vt-panel-flag">{sourceLang?.flag}</span>
            <span className="vt-panel-lang">{sourceLang?.label}</span>
            <span className="vt-panel-badge">Source</span>
          </div>
          <p className={`vt-panel-text ${interimTranscript && !transcript ? 'vt-panel-text-interim' : ''}`}>
            {displayTranscript}
          </p>
        </div>
      )}

      {/* Translation panel */}
      {(isTranslating || translation) && (
        <div className="vt-panel vt-panel-target">
          <div className="vt-panel-header">
            <span className="vt-panel-flag">{targetLang?.flag}</span>
            <span className="vt-panel-lang">{targetLang?.label}</span>
            <span className="vt-panel-badge vt-panel-badge-target">Translation</span>
          </div>
          {isTranslating ? (
            <div className="vt-translating">
              <div className="vt-translating-dots">
                <span className="vt-dot vt-dot-1" />
                <span className="vt-dot vt-dot-2" />
                <span className="vt-dot vt-dot-3" />
              </div>
              <span>Translating…</span>
            </div>
          ) : (
            <>
              <p className="vt-panel-text vt-panel-text-translation">{translation}</p>
              {translation && !translation.startsWith('[') && (
                <button
                  className={`vt-speak-btn ${isSpeaking ? 'vt-speak-btn-active' : ''}`}
                  onClick={speakTranslation}
                  aria-label="Read translation aloud"
                >
                  {isSpeaking ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1"/>
                        <rect x="14" y="4" width="4" height="16" rx="1"/>
                      </svg>
                      Speaking…
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
                        <path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Read Aloud
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Clear button */}
      {(displayTranscript || translation) && (
        <button className="vt-clear-btn" onClick={clearAll}>
          ✕ Clear
        </button>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="vt-history">
          <h3 className="vt-history-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Recent Translations
          </h3>
          <div className="vt-history-list">
            {history.map((item) => (
              <div key={item.id} className="vt-history-item">
                <div className="vt-history-source">
                  <span className="vt-history-flag">{item.sourceLang.flag}</span>
                  <span className="vt-history-text">{item.source}</span>
                </div>
                <div className="vt-history-arrow">→</div>
                <div className="vt-history-target">
                  <span className="vt-history-flag">{item.targetLang.flag}</span>
                  <span className="vt-history-text">{item.translated}</span>
                </div>
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {isSupported && !displayTranscript && !translation && history.length === 0 && !error && (
        <div className="vt-empty">
          <div className="vt-empty-icon">🌍</div>
          <h3 className="vt-empty-title">Bridge the Language Gap</h3>
          <p className="vt-empty-desc">
            Speak in {sourceLang?.label} and hear the translation in {targetLang?.label}. 
            Perfect for helping your child understand lessons at home!
          </p>
        </div>
      )}
    </div>
  );
}
