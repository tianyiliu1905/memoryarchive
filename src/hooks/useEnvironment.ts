import { useEffect } from 'react';
import { useArchive } from '@/store/archive';

/**
 * 探测运行环境：动效偏好、触屏、真实视口高度（移动端地址栏）。
 */
export function useEnvironment() {
  const setReducedMotion = useArchive((s) => s.setReducedMotion);
  const setIsTouch = useArchive((s) => s.setIsTouch);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setReducedMotion(mq.matches);
      document.documentElement.dataset.reducedMotion = String(mq.matches);
    };
    apply();
    mq.addEventListener('change', apply);

    const touch = window.matchMedia('(hover: none), (pointer: coarse)');
    const applyTouch = () => setIsTouch(touch.matches);
    applyTouch();
    touch.addEventListener('change', applyTouch);

    // 真实视口高度
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);

    return () => {
      mq.removeEventListener('change', apply);
      touch.removeEventListener('change', applyTouch);
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, [setReducedMotion, setIsTouch]);
}
