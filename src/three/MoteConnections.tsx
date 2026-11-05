import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import type { ClusterId } from '@/data/types';
import { CLUSTERS, CLUSTER_ORDER } from '@/data/clusters';
import { PROJECTS_BY_CLUSTER } from '@/data/projects';
import { useArchive } from '@/store/archive';
import { moteOffsets } from './layout';

export type MoteMaterials = Map<ClusterId, THREE.ShaderMaterial>;

/** Mirror motesVertexShader steps 1, 4 and 5 for the head (aTrail = 0).
 * Read the point material's interpolated uniforms, so links share its exact
 * focus/dive timing rather than running a second animation state machine. */
function centerAt(offset: THREE.Vector3, seed: number, material: THREE.ShaderMaterial, out: THREE.Vector3) {
  const u = material.uniforms;
  const anchor = u.uClusterPos.value as THREE.Vector3;
  const focus = u.uFocus.value as number;
  const dim = u.uDim.value as number;
  const dive = u.uDive.value as number;
  const t = (u.uTime.value as number) * 0.62;
  const ph = seed * 6.283;
  const r = offset.length();
  let cx = offset.x, cy = offset.y, cz = offset.z;

  if (r > 0.0001) {
    let expanded = Math.pow(Math.min(r / 0.75, 1.6), 1 - 0.45 * focus) * 0.75;
    expanded = Math.max(expanded, 0.2 * focus) * (1 + 0.85 * focus);
    const scale = (expanded + (seed - 0.5) * 0.16 * focus) / r;
    cx *= scale; cy *= scale; cz *= scale;
  }

  const amp = 0.11 + 0.21 * focus;
  const sx = Math.sin(t * 0.83 + ph) * 0.52 + Math.sin(t * 0.41 + ph * 1.7) * 0.33 + Math.sin(t * 0.23 + ph * 2.9) * 0.15;
  const sy = Math.sin(t * 0.67 + ph * 2.1) * 0.52 + Math.sin(t * 0.29 + ph) * 0.33 + Math.sin(t * 0.19 + ph * 1.4) * 0.15;
  const sz = Math.sin(t * 0.75 + ph * 1.3) * 0.52 + Math.sin(t * 0.37 + ph * 2.4) * 0.33 + Math.sin(t * 0.21 + ph * 0.8) * 0.15;
  const pull = 1 - dive * 0.09 * focus;
  out.set(
    (anchor.x + cx * pull + sx * amp) * (1 + 0.38 * dim),
    anchor.y + cy * pull + sy * amp + offset.z * focus * 0.8 - dim * 0.42,
    (anchor.z + cz * pull + sz * amp) * (1 + 0.38 * dim)
  );
}

/** Three branching clusters joined by a Y-shaped trunk.
 * Decorative endpoints are visual only: they never enter project data or HitZones. */
export function MoteConnections({ materials }: { materials: MoteMaterials }) {
  const graph = useMemo(() => {
    type Node = { id: ClusterId; offset: THREE.Vector3; seed: number; center: THREE.Vector3; decorative: boolean };
    const nodes: Node[] = [];
    const hubs: number[] = [];
    const edges: [number, number][] = [];
    const tips: number[] = [];
    // The central junction has no glow or interaction.
    nodes.push({ id: 'green', offset: new THREE.Vector3(), seed: 0, center: new THREE.Vector3(), decorative: false });

    CLUSTER_ORDER.forEach((id) => {
      const seedOffset = { green: 0, purple: 0.37, yellow: 0.71 }[id];
      const hub = nodes.length;
      hubs.push(hub);
      nodes.push({ id, offset: new THREE.Vector3(), seed: seedOffset, center: new THREE.Vector3(), decorative: false });
      edges.push([0, hub]);
      const realOffsets = moteOffsets(id, PROJECTS_BY_CLUSTER[id].length);
      const angles = realOffsets.map((o) => (Math.atan2(o.z, o.x) + Math.PI * 2) % (Math.PI * 2));
      const addNode = (offset: THREE.Vector3, seed: number, decorative: boolean) => {
        offset.set(Math.fround(offset.x), Math.fround(offset.y), Math.fround(offset.z));
        const index = nodes.length;
        nodes.push({ id, offset, seed: Math.fround(seed), center: new THREE.Vector3(), decorative });
        edges.push([hub, index]);
        // Mark every leaf: real sphere centers and decorative branch ends.
        tips.push(index);
      };
      realOffsets.forEach((offset, index) => addNode(offset, (index * 0.6180339887 + seedOffset) % 1, false));

      // Fill angular gaps to give sparse yellow/purple groups the same branching
      // density. Real project positions and clickable regions stay untouched.
      const decorations = Math.max(0, 5 - realOffsets.length);
      for (let i = 0; i < decorations; i++) {
        angles.sort((a, b) => a - b);
        let gapStart = 0, largestGap = -1;
        angles.forEach((a, index) => {
          const next = angles[(index + 1) % angles.length] + (index === angles.length - 1 ? Math.PI * 2 : 0);
          if (next - a > largestGap) { largestGap = next - a; gapStart = a; }
        });
        const angle = angles.length ? (gapStart + largestGap * 0.5) % (Math.PI * 2) : i * 2.399963;
        angles.push(angle);
        const radius = 0.76 + (i % 2) * 0.16;
        addNode(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius), (seedOffset + 0.23 + i * 0.31) % 1, true);
      }
    });

    const positions = new Float32Array(edges.length * 6);
    const geometry = new LineSegmentsGeometry().setPositions(positions);
    const colors = new Float32Array(edges.length * 6);
    const clusterColors = Object.fromEntries(CLUSTER_ORDER.map((id) => [id, new THREE.Color(CLUSTERS[id].color)])) as Record<ClusterId, THREE.Color>;
    const junctionColor = new THREE.Color('#f6f4fa');
    edges.forEach(([a, b], index) => {
      (a === 0 ? junctionColor : clusterColors[nodes[a].id]).toArray(colors, index * 6);
      clusterColors[nodes[b].id].toArray(colors, index * 6 + 3);
    });
    geometry.setColors(colors);
    const instanceBuffer = (geometry.getAttribute('instanceStart') as THREE.InterleavedBufferAttribute).data;
    instanceBuffer.setUsage(THREE.DynamicDrawUsage);
    const material = new LineMaterial({
      color: '#ffffff', vertexColors: true, linewidth: 1.35, transparent: true, opacity: 0,
      depthWrite: false, depthTest: false, toneMapped: false,
    });
    const lines = new LineSegments2(geometry, material);
    lines.frustumCulled = false;
    lines.renderOrder = 1;
    lines.raycast = () => {};

    const tipGeometry = new THREE.BufferGeometry();
    tipGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tips.length * 3), 3).setUsage(THREE.DynamicDrawUsage));
    const tipColors = new Float32Array(tips.length * 3);
    tips.forEach((nodeIndex, index) => clusterColors[nodes[nodeIndex].id].toArray(tipColors, index * 3));
    tipGeometry.setAttribute('aColor', new THREE.BufferAttribute(tipColors, 3));
    const tipMaterial = new THREE.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
      uniforms: { uOpacity: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: `
        uniform float uPixelRatio;
        attribute vec3 aColor;
        varying vec3 vDotColor;
        void main() {
          vDotColor = aColor;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 8.0 * uPixelRatio;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vDotColor;
        void main() {
          float r = length(gl_PointCoord - 0.5) * 2.0;
          float disc = 1.0 - smoothstep(0.82, 0.98, r);
          if (disc < 0.01) discard;
          gl_FragColor = vec4(vDotColor, disc * uOpacity);
          #include <colorspace_fragment>
        }
      `,
    });
    return { nodes, hubs, edges, tips, positions, geometry, instanceBuffer, material, lines, tipGeometry, tipMaterial };
  }, []);

  useEffect(() => () => {
    graph.geometry.dispose(); graph.material.dispose();
    graph.tipGeometry.dispose(); graph.tipMaterial.dispose();
  }, [graph]);

  useFrame((state, delta) => {
    if (materials.size !== CLUSTER_ORDER.length) return;
    graph.nodes.forEach((node, index) => {
      if (index) centerAt(node.offset, node.seed, materials.get(node.id)!, node.center);
    });
    const junction = graph.nodes[0].center.set(0, 0, 0);
    graph.hubs.forEach((index) => junction.add(graph.nodes[index].center));
    junction.divideScalar(graph.hubs.length);
    graph.edges.forEach(([a, b], index) => {
      graph.nodes[a].center.toArray(graph.positions, index * 6);
      graph.nodes[b].center.toArray(graph.positions, index * 6 + 3);
    });
    graph.instanceBuffer.needsUpdate = true;
    graph.material.resolution.set(state.size.width, state.size.height);
    const tipPosition = graph.tipGeometry.getAttribute('position') as THREE.BufferAttribute;
    graph.tips.forEach((nodeIndex, index) => {
      const p = graph.nodes[nodeIndex].center;
      tipPosition.setXYZ(index, p.x, p.y, p.z);
    });
    tipPosition.needsUpdate = true;
    const { depth, awakened } = useArchive.getState();
    const visible = awakened && (depth === 'basin' || depth === 'cluster' || depth === 'surfacing');
    graph.material.opacity = THREE.MathUtils.damp(graph.material.opacity, visible ? 0.62 : 0, 3, Math.min(delta, 0.05));
    graph.tipMaterial.uniforms.uOpacity.value = graph.material.opacity;
    graph.tipMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  });

  return <>
    <primitive object={graph.lines} />
    <points geometry={graph.tipGeometry} material={graph.tipMaterial} frustumCulled={false} renderOrder={3} raycast={() => {}} />
  </>;
}
