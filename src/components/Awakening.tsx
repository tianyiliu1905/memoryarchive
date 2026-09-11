import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchive } from '@/store/archive';
import './awakening.css';

/**
 * 开场：像显影液中慢慢浮出的第一帧。
 * 白场 → 一行档案编号 → 散去 → 记忆盆显形。
 */
export function Awakening() {
  const awaken = useArchive((s) => s.awaken);
  const reducedMotion = useArchive((s) => s.reducedMotion);
  const [stage, setStage] = useState<'hold' | 'fading' | 'gone'>('hold');

  useEffect(() => {
    const d = reducedMotion ? 0.25 : 1;
    const t1 = setTimeout(() => setStage('fading'), 1750 * d);
    const t2 = setTimeout(() => {
      awaken();
    }, 2250 * d);
    const t3 = setTimeout(() => setStage('gone'), 3900 * d);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [awaken, reducedMotion]);

  return (
    <AnimatePresence>
      {stage !== 'gone' && (
        <motion.div
          className="awakening"
          initial={{ opacity: 1 }}
          animate={{ opacity: stage === 'fading' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.3 : 1.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="awakening__inner"
            initial={{ opacity: 0, filter: 'blur(16px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: reducedMotion ? 0.3 : 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          >
            <span className="awakening__id archive-tag">PENSIEVE / ACCESS GRANTED</span>
            <span className="awakening__line" />
            <span className="awakening__note serif-note">retrieving memories…</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
