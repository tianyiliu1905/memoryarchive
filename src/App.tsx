import { Suspense, lazy, useEffect } from 'react';
import { MemoryBasinScene } from '@/three/MemoryBasinScene';
import { BasinOverlay } from '@/components/BasinOverlay';
import { MemoryCursor } from '@/components/MemoryCursor';
import { Awakening } from '@/components/Awakening';
import { DiveTransition } from '@/components/DiveTransition';
import { usePointer } from '@/hooks/usePointer';
import { useDiveGesture } from '@/hooks/useDiveGesture';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useArchive } from '@/store/archive';

/**
 * 项目详情（横向日记）按需加载。
 *
 * 它包含全部章节排版、图版生成与横向滚动逻辑，但只有当用户
 * 真正潜入某个项目时才会用到。留在主包里会让每个只看首页的
 * 访客都白白下载一遍。
 */
const MemoryJournal = lazy(() =>
  import('@/journal/MemoryJournal').then((m) => ({ default: m.MemoryJournal }))
);

export default function App() {
  useEnvironment();
  const pointer = usePointer();
  const { chargeRef, panRef, subscribe, subscribePan, dragGuardRef } = useDiveGesture();

  const depth = useArchive((s) => s.depth);

  /**
   * 是否需要挂载日记。
   *
   * 注意这里必须覆盖 surfacing：退场动画由组件内的 AnimatePresence
   * 播放，如果一离开 project 就卸载，上浮动画会被直接截断。
   * diving 则用来抢跑——转场动画进行时组件已经在解析了。
   */
  const journalMounted =
    depth === 'diving' || depth === 'project' || depth === 'surfacing';

  /**
   * 预取时机：用户聚焦到某个光斑群时，说明他很可能接着潜入。
   * 此时在后台悄悄拉取日记代码，等真正点击时已经就绪——
   * 既不拖慢首屏，也不会让转场卡在加载上。
   */
  useEffect(() => {
    if (depth === 'cluster') {
      import('@/journal/MemoryJournal');
    }
  }, [depth]);

  return (
    <>
      {/* ---------- 记忆盆 ---------- */}
      <Suspense fallback={null}>
        <MemoryBasinScene
          pointer={pointer}
          diveCharge={chargeRef}
          panAmount={panRef}
          dragGuard={dragGuardRef}
        />
      </Suspense>

      {/* ---------- 首页 UI ---------- */}
      <BasinOverlay subscribe={subscribe} subscribePan={subscribePan} />

      {/* ---------- 项目详情（按需加载）---------- */}
      {/* fallback 为 null：转场动画本身就覆盖了这段等待，
          再叠一个加载指示反而会打断叙事的连贯性 */}
      {journalMounted && (
        <Suspense fallback={null}>
          <MemoryJournal />
        </Suspense>
      )}

      {/* ---------- 转场 ---------- */}
      <DiveTransition />
      <Awakening />

      {/* ---------- 质感覆盖层 ---------- */}
      <div className="paper-grain" />
      <div className="scanlines" />

      {/* ---------- 光标 ---------- */}
      <MemoryCursor pointer={pointer} />
    </>
  );
}
