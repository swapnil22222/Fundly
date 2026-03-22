import React from 'react';

const CatMascot = ({ size = 80, mood = 'happy', className = '', style = {} }) => {
  const s = size;
  const moods = {
    happy: { eyes: 'owo', blush: true },
    thinking: { eyes: 'uwu', blush: false },
    excited: { eyes: '★★', blush: true },
    sleeping: { eyes: '---', blush: false },
    love: { eyes: '♡♡', blush: true },
  };
  const m = moods[mood] || moods.happy;

  return (
    <svg
      width={s} height={s} viewBox="0 0 100 100"
      className={className} style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="50" cy="72" rx="26" ry="20" fill="#ffd4e8" />
      {/* Head */}
      <circle cx="50" cy="48" r="28" fill="#ffd4e8" />
      {/* Ears */}
      <polygon points="22,28 16,8 34,24" fill="#ffd4e8" />
      <polygon points="78,28 84,8 66,24" fill="#ffd4e8" />
      <polygon points="24,26 19,12 32,24" fill="#ffb7c5" />
      <polygon points="76,26 81,12 68,24" fill="#ffb7c5" />
      {/* Face */}
      {m.blush && <>
        <ellipse cx="35" cy="53" rx="7" ry="5" fill="rgba(255,120,150,0.25)" />
        <ellipse cx="65" cy="53" rx="7" ry="5" fill="rgba(255,120,150,0.25)" />
      </>}
      {/* Eyes */}
      {mood === 'sleeping' ? (
        <>
          <path d="M36 46 Q40 50 44 46" stroke="#5a4e6e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M56 46 Q60 50 64 46" stroke="#5a4e6e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'love' ? (
        <>
          <text x="31" y="51" fontSize="12" fill="#e8789a">♡</text>
          <text x="53" y="51" fontSize="12" fill="#e8789a">♡</text>
        </>
      ) : mood === 'excited' ? (
        <>
          <text x="31" y="52" fontSize="13" fill="#5a4e6e">★</text>
          <text x="53" y="52" fontSize="13" fill="#5a4e6e">★</text>
        </>
      ) : (
        <>
          <ellipse cx="40" cy="48" rx="5" ry="5.5" fill="#2d2438" />
          <ellipse cx="60" cy="48" rx="5" ry="5.5" fill="#2d2438" />
          <circle cx="42" cy="46" r="1.5" fill="white" />
          <circle cx="62" cy="46" r="1.5" fill="white" />
        </>
      )}
      {/* Nose */}
      <polygon points="50,54 47,58 53,58" fill="#e8789a" />
      {/* Mouth */}
      <path d="M47 58 Q50 62 53 58" stroke="#e8789a" strokeWidth="1.5" fill="none" />
      {/* Whiskers */}
      <line x1="18" y1="54" x2="38" y2="56" stroke="#c9b8f5" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="18" y1="58" x2="38" y2="58" stroke="#c9b8f5" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="62" y1="56" x2="82" y2="54" stroke="#c9b8f5" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="62" y1="58" x2="82" y2="58" stroke="#c9b8f5" strokeWidth="1.2" strokeLinecap="round" />
      {/* Tail */}
      <path
        d="M70 80 Q90 70 85 55 Q80 45 75 55"
        fill="none" stroke="#ffc0d8" strokeWidth="6" strokeLinecap="round"
        style={{ transformOrigin: '70px 80px', animation: 'cat-tail 1.5s ease-in-out infinite' }}
      />
    </svg>
  );
};

export default CatMascot;
