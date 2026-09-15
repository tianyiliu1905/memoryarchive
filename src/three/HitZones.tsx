import { useMemo } from 'react';
import * as THREE from 'three';
import { useArchive } from '@/store/archive';
import { CLUSTERS, CLUSTER_ORDER } from '@/data/clusters';
import { PROJECTS_BY_CLUSTER } from '@/data/projects';
import { clusterAnchor, focusedOffset, moteOffsets } from './layout';

/**
 * 不可见的命中区域。
 *
 * 逐粒子射线检测既昂贵又不稳定（粒子一直在漂浮），
 * 所以用隐形球体代理：
 *   - 盆全景层：每个群一个大球，决定 hoveredCluster
 *   - 群近景层：每个项目一个球，决定 hoveredProject 与点击潜入
 */
interface HitZonesProps {
  /** 返回 true 表示本次指针交互是拖拽，不应触发潜入 */
  dragGuard?: React.MutableRefObject<() => boolean>;
}

export function HitZones({ dragGuard }: HitZonesProps) {
  const depth = useArchive((s) => s.depth);
  const focusedCluster = useArchive((s) => s.focusedCluster);
  const setHoveredCluster = useArchive((s) => s.setHoveredCluster);
  const setHoveredProject = useArchive((s) => s.setHoveredProject);
  const focusCluster = useArchive((s) => s.focusCluster);
  const diveInto = useArchive((s) => s.diveInto);

  const anchors = useMemo(() => {
    const map: Record<string, THREE.Vector3> = {};
    CLUSTER_ORDER.forEach((id) => {
      map[id] = clusterAnchor(CLUSTERS[id]);
    });
    return map;
  }, []);

  const inBasin = depth === 'basin';
  const inCluster = depth === 'cluster';

  return (
    <group>
      {/* ---- 群级命中区 ---- */}
      {inBasin &&
        CLUSTER_ORDER.map((id) => {
          const a = anchors[id];
          return (
            <mesh
              key={id}
              position={[a.x, 0, a.z]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredCluster(id);
              }}
              onPointerOut={() => setHoveredCluster(null)}
              onClick={(e) => {
                e.stopPropagation();
                focusCluster(id);
              }}
              visible={false}
            >
              <sphereGeometry args={[1.15, 12, 12]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          );
        })}

      {/* ---- 盆视角下的单颗光斑命中区 ----
           让每颗光斑在全景下也能被单独指向并完全浮现。
           半径较小，且渲染在群级命中区之后，因此会优先命中。 */}
      {inBasin &&
        CLUSTER_ORDER.map((id) => {
          const a = anchors[id];
          const list = PROJECTS_BY_CLUSTER[id];
          const bases = moteOffsets(id, list.length);

          return list.map((proj, pi) => {
            const b = bases[pi];
            return (
              <mesh
                key={proj.id}
                position={[a.x + b.x, b.y, a.z + b.z]}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredCluster(id);
                  setHoveredProject(proj.id);
                }}
                onPointerOut={() => setHoveredProject(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  focusCluster(id);
                }}
                visible={false}
              >
                {/* 半径要够大以覆盖摆动（远景幅度 0.14），但又不能超过
                    相邻光斑最小间距的一半——绿色群最密处只有 0.207，
                    取 0.2 是覆盖与不误判之间的折中。 */}
                <sphereGeometry args={[0.2, 10, 10]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
            );
          });
        })}

      {/* ---- 项目级命中区 ---- */}
      {inCluster &&
        focusedCluster &&
        PROJECTS_BY_CLUSTER[focusedCluster].map((proj, pi, arr) => {
          const a = anchors[focusedCluster];

          // 与光斑共用同一套基准位置和外扩数学，
          // 保证命中区与肉眼所见的光斑严格重合
          const base = moteOffsets(focusedCluster, arr.length)[pi];
          const f = focusedOffset(base, 1);

          const fx = a.x + f.x;
          const fz = a.z + f.z;
          // 与 shader 中 pos.y += aOffset.z * uFocus * 0.8 对应
          const fy = f.y + base.z * 0.8;

          return (
            <mesh
              key={proj.id}
              position={[fx, fy, fz]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredProject(proj.id);
              }}
              onPointerOut={() => setHoveredProject(null)}
              onClick={(e) => {
                e.stopPropagation();
                // 拖拽切换分类时不应误触发潜入
                if (dragGuard?.current?.()) return;
                const ox = e.nativeEvent.clientX / window.innerWidth;
                const oy = e.nativeEvent.clientY / window.innerHeight;
                diveInto(proj.id, CLUSTERS[focusedCluster].color, [ox, oy]);
              }}
              visible={false}
            >
              {/* 半径需 ≥ 聚焦摆动幅度（0.3）。聚焦后光斑已外扩到
                  1.85 倍，彼此间距足够，不必担心命中区重叠。 */}
              <sphereGeometry args={[0.6, 12, 12]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          );
        })}
    </group>
  );
}
