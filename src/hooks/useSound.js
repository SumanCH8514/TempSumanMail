import { useCallback, useState, useRef, useEffect } from 'react';

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('tempsumanmail_sound');
      return saved !== 'false';
    } catch (e) {
      return true;
    }
  });

  const [soundType, setSoundTypeState] = useState(() => {
    try {
      const saved = localStorage.getItem('tempsumanmail_sound_type');
      return ['faaaa', 'you_ve_got_mail', 'mail_received', 'default'].includes(saved) ? saved : 'you_ve_got_mail';
    } catch (e) {
      return 'you_ve_got_mail';
    }
  });

  const audioCtxRef = useRef(null);
  const userInteracted = useRef(false);
  const soundTypeRef = useRef(soundType);
  const audioCacheRef = useRef({});

  useEffect(() => {
    soundTypeRef.current = soundType;
  }, [soundType]);

  useEffect(() => {
    try {
      const fahh = new Audio('/sounds/fahh.mp3');
      fahh.preload = 'auto';
      fahh.load();
      audioCacheRef.current['faaaa'] = fahh;

      const mailSound = new Audio('/sounds/you_ve_got_mail.mp3');
      mailSound.preload = 'auto';
      mailSound.load();
      audioCacheRef.current['you_ve_got_mail'] = mailSound;
    } catch (e) {}

    const handleGesture = () => {
      userInteracted.current = true;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new AudioCtx();
          }
          if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {});
          }
        }
      } catch (e) {}
    };

    window.addEventListener('pointerdown', handleGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleGesture, { once: true, passive: true });
    window.addEventListener('click', handleGesture, { once: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('click', handleGesture);
    };
  }, []);

  const getAudioContext = useCallback(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioCtx();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }, []);

  const playTone = useCallback((typeToPlay) => {
    const type = typeToPlay || soundTypeRef.current;

    if (type === 'faaaa' || type === 'you_ve_got_mail') {
      try {
        const fallbackUrl = type === 'faaaa' ? '/sounds/fahh.mp3' : '/sounds/you_ve_got_mail.mp3';
        const audio = audioCacheRef.current[type] || new Audio(fallbackUrl);
        audio.currentTime = 0;
        audio.volume = 0.9;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
        return;
      } catch (e) {}
    }

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (type === 'mail_received') {
        const notes = [783.99, 1046.50, 1318.51];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = ctx.currentTime + i * 0.11;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.26);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.28);
        });
        return;
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15);

      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  }, [getAudioContext]);

  const setSoundType = useCallback((type) => {
    userInteracted.current = true;
    setSoundTypeState(type);
    soundTypeRef.current = type;
    try {
      localStorage.setItem('tempsumanmail_sound_type', type);
    } catch (e) {}
    playTone(type);
  }, [playTone]);

  const previewSound = useCallback((type) => {
    userInteracted.current = true;
    playTone(type);
  }, [playTone]);

  const toggleSound = useCallback(() => {
    userInteracted.current = true;
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('tempsumanmail_sound', String(next));
      } catch (e) {}
      if (next) {
        playTone(soundTypeRef.current);
      }
      return next;
    });
  }, [playTone]);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !userInteracted.current) return;
    playTone(soundTypeRef.current);
  }, [soundEnabled, playTone]);

  return {
    soundEnabled,
    soundType,
    toggleSound,
    setSoundType,
    previewSound,
    playNotificationSound,
    userInteracted
  };
}
