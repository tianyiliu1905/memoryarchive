import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createBasinMaterial } from './basinMaterial';
import { BASIN_RADIUS } from './layout';
import { useArchive } from '@/store/archive';
import { CLUSTERS } from '@/data/clusters';
import type { PointerState } from '@/hooks/usePointer';

interface Props {
  pointer: React.MutableRefObject<PointerState>;
}

/** 记忆盆的液面 */
export function Basin({ pointer }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const awakened = useArchive((s) => s.awakened);
  const depth = useArchive((s) => s.depth);
  const focusedCluster = useArchive((s) => s.focusedCluster);

  const material = useMemo(() => createBasinMaterial(), []);
  const forceV = useRef(0);
  const tintTarget = useMemo(() => new THREE.Color('#b07cff'), []);

  useFrame((state, delta) => {
    const m = matRef.current;
    if (!m) return;
    const d = Math.min(delta, 0.05);
    const u = m.uniforms;

    u.uTime.value = state.clock.elapsedTime;

    // 盆坐标系下的指针位置（-1 ~ 1）
    const px = (pointer.current.sx * viewport.width * 0.5) / BASIN_RADIUS;
    const pz = (-pointer.current.sy * viewport.height * 0.5) / BASIN_RADIUS;
    u.uPointer.value.set(px, pz);

    const targetForce = pointer.current.inside && depth === 'basin' ? 0.42 + pointer.current.speed * 0.3 : 0.1;
    forceV.current += (targetForce - forceV.current) * d * 4;
    u.uPointerForce.value = forceV.current;

    // 首次显影
    const targetReveal = awakened ? 1 : 0;
    u.uReveal.value += (targetReveal - u.uReveal.value) * d * 0.85;

    // 聚焦时的色彩渗透
    const focusing = depth === 'cluster' || depth === 'diving' || depth === 'surfacing';
    if (focusedCluster) tintTarget.set(CLUSTERS[focusedCluster].color);
    u.uTint.value.lerp(tintTarget, d * 2.5);
    u.uFocusAmt.value += ((focusing ? 1 : 0) - u.uFocusAmt.value) * d * 2;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <circleGeometry args={[BASIN_RADIUS, 128]} />
      <primitive object={material} ref={matRef} attach="material" />
    </mesh>
  );
}
