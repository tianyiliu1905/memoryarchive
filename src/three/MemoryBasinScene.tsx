import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Basin } from './Basin';
import { BasinRing } from './BasinRing';
import { MoteCluster } from './MoteCluster';
import { CameraRig } from './CameraRig';
import { HitZones } from './HitZones';
import { clusterAnchor } from './layout';
import { CLUSTERS, CLUSTER_ORDER } from '@/data/clusters';
import { PROJECTS_BY_CLUSTER } from '@/data/projects';
import type { PointerState } from '@/hooks/usePointer';

interface Props {
  pointer: React.MutableRefObject<PointerState>;
  diveCharge: React.MutableRefObject<number>;
  panAmount: React.MutableRefObject<number>;
  dragGuard: React.MutableRefObject<() => boolean>;
}

export function MemoryBasinScene({ pointer, diveCharge, panAmount, dragGuard }: Props) {
  const anchors = useMemo(
    () => Object.fromEntries(CLUSTER_ORDER.map((id) => [id, clusterAnchor(CLUSTERS[id])])),
    []
  );

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      camera={{ fov: 42, near: 0.1, far: 100, position: [0, 9.2, 0] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <CameraRig pointer={pointer} diveCharge={diveCharge} panAmount={panAmount} />
      <Basin pointer={pointer} />
      <BasinRing />

      {CLUSTER_ORDER.map((id) => (
        <MoteCluster
          key={id}
          cluster={CLUSTERS[id]}
          projects={PROJECTS_BY_CLUSTER[id]}
          pointer={pointer}
          diveCharge={diveCharge}
          anchor={anchors[id]}
        />
      ))}

      <HitZones dragGuard={dragGuard} />
    </Canvas>
  );
}
