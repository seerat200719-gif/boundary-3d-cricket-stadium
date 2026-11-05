import * as THREE from 'three';
import { GateData, StallData } from '../../types/stadium';

// Pre-allocated scratch objects to ensure ZERO GC in render loop (as required by threejs skill)
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _vec3 = new THREE.Vector3();

export interface PedestrianPath {
  points: THREE.Vector3[];
  t: number;
  speed: number;
  meshIndex: number;
}

export class CrowdSystem {
  public standsFanMesh: THREE.InstancedMesh;
  public totalFans: number = 3200;
  private fanBasePositions: Float32Array;
  private fanAngles: Float32Array;
  private isCelebrating: boolean = false;
  private celebrateStartTime: number = 0;

  // Moving pedestrians (metro/parking -> gates)
  public pedestrianMesh: THREE.InstancedMesh;
  public totalPeds: number = 220;
  private peds: PedestrianPath[] = [];

  // Queue fans at gates and stalls
  public queueMesh: THREE.InstancedMesh;
  public totalQueuePax: number = 400;

  constructor(scene: THREE.Group, ovalRadiusX: number, ovalRadiusZ: number) {
    // 1. INSTANCED FANS IN THE STANDS
    // Low-poly capsule fan (torso + head combo)
    const fanGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.9, 6);
    fanGeo.translate(0, 0.45, 0);
    const fanMat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.1,
    });

    this.standsFanMesh = new THREE.InstancedMesh(fanGeo, fanMat, this.totalFans);
    this.standsFanMesh.castShadow = true;
    this.standsFanMesh.receiveShadow = false;
    this.standsFanMesh.frustumCulled = false;

    this.fanBasePositions = new Float32Array(this.totalFans * 3);
    this.fanAngles = new Float32Array(this.totalFans);

    // Populate fans across lower & upper tiers
    let idx = 0;
    const tier1InnerR = ovalRadiusX + 2.5;
    const tier1Steps = 8;
    const tier2InnerR = ovalRadiusX + 22.5;
    const tier2Steps = 9;

    // Palette: 50% Royal Blue (#1E5EFF), 25% Gold/Yellow (#F59E0B), 15% White, 10% Red
    const colors = [
      new THREE.Color(0x1E5EFF),
      new THREE.Color(0x1E5EFF),
      new THREE.Color(0x3B82F6),
      new THREE.Color(0xF59E0B),
      new THREE.Color(0xFBBF24),
      new THREE.Color(0xF8FAFC),
      new THREE.Color(0xEF4444),
      new THREE.Color(0x64748B),
    ];

    // Distribute into Tier 1
    for (let step = 0; step < tier1Steps && idx < this.totalFans * 0.55; step++) {
      const r = tier1InnerR + step * 2.2 + 0.8;
      const countInRing = Math.floor(r * 2.2);
      const y = 1.3 + step * 0.9;
      for (let i = 0; i < countInRing && idx < this.totalFans; i++) {
        // Leave gaps for stairs / aisles
        if (i % 18 === 0 || i % 18 === 1) continue;
        const angle = (i / countInRing) * Math.PI * 2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r * (ovalRadiusZ / ovalRadiusX);

        _dummy.position.set(x, y, z);
        _dummy.lookAt(0, y, 0); // fans face pitch
        _dummy.scale.set(0.9 + Math.random() * 0.2, 0.9 + Math.random() * 0.2, 0.9 + Math.random() * 0.2);
        _dummy.updateMatrix();

        this.standsFanMesh.setMatrixAt(idx, _dummy.matrix);
        this.fanBasePositions[idx * 3] = x;
        this.fanBasePositions[idx * 3 + 1] = y;
        this.fanBasePositions[idx * 3 + 2] = z;
        this.fanAngles[idx] = angle;

        const col = colors[Math.floor(Math.random() * colors.length)];
        this.standsFanMesh.setColorAt(idx, col);
        idx++;
      }
    }

    // Distribute into Tier 2
    for (let step = 0; step < tier2Steps && idx < this.totalFans; step++) {
      const r = tier2InnerR + step * 2.4 + 1.0;
      const countInRing = Math.floor(r * 2.0);
      const y = 10.9 + step * 1.1;
      for (let i = 0; i < countInRing && idx < this.totalFans; i++) {
        if (i % 20 === 0 || i % 20 === 1) continue;
        const angle = (i / countInRing) * Math.PI * 2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r * (ovalRadiusZ / ovalRadiusX);

        _dummy.position.set(x, y, z);
        _dummy.lookAt(0, y, 0);
        _dummy.scale.set(0.9 + Math.random() * 0.2, 0.9 + Math.random() * 0.2, 0.9 + Math.random() * 0.2);
        _dummy.updateMatrix();

        this.standsFanMesh.setMatrixAt(idx, _dummy.matrix);
        this.fanBasePositions[idx * 3] = x;
        this.fanBasePositions[idx * 3 + 1] = y;
        this.fanBasePositions[idx * 3 + 2] = z;
        this.fanAngles[idx] = angle;

        const col = colors[Math.floor(Math.random() * colors.length)];
        this.standsFanMesh.setColorAt(idx, col);
        idx++;
      }
    }

    this.standsFanMesh.instanceMatrix.needsUpdate = true;
    if (this.standsFanMesh.instanceColor) this.standsFanMesh.instanceColor.needsUpdate = true;
    this.standsFanMesh.computeBoundingSphere();
    scene.add(this.standsFanMesh);

    // 2. PEDESTRIANS STREAMING OUTSIDE STADIUM
    const pedGeo = new THREE.CylinderGeometry(0.25, 0.28, 1.1, 6);
    pedGeo.translate(0, 0.55, 0);
    this.pedestrianMesh = new THREE.InstancedMesh(pedGeo, fanMat, this.totalPeds);
    this.pedestrianMesh.frustumCulled = false;
    this.pedestrianMesh.castShadow = true;

    // Define stream routes:
    // Route A: Metro (128, 0, 0) -> East Gate (95, 0, 0) -> North Gate (0, 0, -90)
    // Route B: Parking (-128, 0, 0) -> West VIP (-95, 0, 0) -> South Gate (0, 0, 90)
    for (let p = 0; p < this.totalPeds; p++) {
      const isFromMetro = p % 2 === 0;
      let pathPoints: THREE.Vector3[];

      if (isFromMetro) {
        // Metro to Gate paths
        const targetGate = (p % 4 === 0) ? new THREE.Vector3(0, 0.4, -92) : new THREE.Vector3(94, 0.4, (p % 8 - 4) * 4);
        pathPoints = [
          new THREE.Vector3(126 + Math.random() * 4, 0.4, (Math.random() - 0.5) * 16),
          new THREE.Vector3(110 + (Math.random() - 0.5) * 4, 0.4, (Math.random() - 0.5) * 18),
          targetGate,
        ];
      } else {
        // Parking to Gate paths
        const targetGate = (p % 4 === 1) ? new THREE.Vector3(0, 0.4, 92) : new THREE.Vector3(-94, 0.4, (p % 8 - 4) * 4);
        pathPoints = [
          new THREE.Vector3(-126 - Math.random() * 4, 0.4, (Math.random() - 0.5) * 20),
          new THREE.Vector3(-110 + (Math.random() - 0.5) * 4, 0.4, (Math.random() - 0.5) * 18),
          targetGate,
        ];
      }

      this.peds.push({
        points: pathPoints,
        t: Math.random(),
        speed: 0.04 + Math.random() * 0.03,
        meshIndex: p,
      });

      const col = colors[Math.floor(Math.random() * colors.length)];
      this.pedestrianMesh.setColorAt(p, col);
    }
    if (this.pedestrianMesh.instanceColor) this.pedestrianMesh.instanceColor.needsUpdate = true;
    scene.add(this.pedestrianMesh);

    // 3. QUEUE CROWDS AT GATES AND STALLS
    this.queueMesh = new THREE.InstancedMesh(fanGeo, fanMat, this.totalQueuePax);
    this.queueMesh.frustumCulled = false;
    this.queueMesh.castShadow = true;
    for (let q = 0; q < this.totalQueuePax; q++) {
      _dummy.position.set(0, -50, 0); // initially hidden underground
      _dummy.updateMatrix();
      this.queueMesh.setMatrixAt(q, _dummy.matrix);
      this.queueMesh.setColorAt(q, colors[Math.floor(Math.random() * colors.length)]);
    }
    this.queueMesh.instanceMatrix.needsUpdate = true;
    if (this.queueMesh.instanceColor) this.queueMesh.instanceColor.needsUpdate = true;
    scene.add(this.queueMesh);
  }

  /**
   * Update queue crowd instances based on dynamic gate & stall queue data
   */
  public updateQueues(gates: GateData[], stalls: StallData[]) {
    let qIdx = 0;

    // Gate queues
    gates.forEach((gate) => {
      const waitWeight = Math.max(2, Math.min(16, Math.floor(gate.waitTimeMin * 2.2)));
      for (let lane = -2; lane <= 2; lane++) {
        for (let row = 1; row <= waitWeight && qIdx < this.totalQueuePax; row++) {
          const offsetX = gate.position[0] > 40 ? row * 1.4 : gate.position[0] < -40 ? -row * 1.4 : lane * 1.8;
          const offsetZ = gate.position[2] > 40 ? row * 1.4 : gate.position[2] < -40 ? -row * 1.4 : (gate.position[0] > 40 || gate.position[0] < -40 ? lane * 1.8 : 0);

          _dummy.position.set(
            gate.position[0] + offsetX,
            0.4,
            gate.position[2] + offsetZ
          );
          _dummy.lookAt(gate.position[0], 0.4, gate.position[2]);
          _dummy.scale.set(0.9, 0.9, 0.9);
          _dummy.updateMatrix();
          this.queueMesh.setMatrixAt(qIdx, _dummy.matrix);
          qIdx++;
        }
      }
    });

    // Stall queues
    stalls.forEach((stall) => {
      const inLine = Math.min(18, stall.queueLength);
      for (let i = 0; i < inLine && qIdx < this.totalQueuePax; i++) {
        _dummy.position.set(
          stall.position[0] + (Math.random() - 0.5) * 0.4,
          0.4,
          stall.position[2] + 2.8 + i * 1.3
        );
        _dummy.lookAt(stall.position[0], 0.4, stall.position[2]);
        _dummy.scale.set(0.9, 0.9, 0.9);
        _dummy.updateMatrix();
        this.queueMesh.setMatrixAt(qIdx, _dummy.matrix);
        qIdx++;
      }
    });

    // Hide remaining unused queue instances
    while (qIdx < this.totalQueuePax) {
      _dummy.position.set(0, -50, 0);
      _dummy.updateMatrix();
      this.queueMesh.setMatrixAt(qIdx, _dummy.matrix);
      qIdx++;
    }

    this.queueMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Trigger the crowd jump wave celebration when a boundary or six is hit
   */
  public triggerSixCelebration() {
    this.isCelebrating = true;
    this.celebrateStartTime = performance.now();
  }

  /**
   * Per-frame update in animation loop
   */
  public update(delta: number, elapsed: number) {
    // 1. Fans celebration wave
    if (this.isCelebrating) {
      const celebrateDuration = 3200; // 3.2s
      const elapsedSince = performance.now() - this.celebrateStartTime;

      if (elapsedSince > celebrateDuration) {
        this.isCelebrating = false;
        // Reset fans to resting position
        for (let i = 0; i < this.totalFans; i++) {
          const x = this.fanBasePositions[i * 3];
          const y = this.fanBasePositions[i * 3 + 1];
          const z = this.fanBasePositions[i * 3 + 2];
          _dummy.position.set(x, y, z);
          _dummy.lookAt(0, y, 0);
          _dummy.updateMatrix();
          this.standsFanMesh.setMatrixAt(i, _dummy.matrix);
        }
        this.standsFanMesh.instanceMatrix.needsUpdate = true;
      } else {
        const decay = 1 - elapsedSince / celebrateDuration;
        for (let i = 0; i < this.totalFans; i++) {
          const x = this.fanBasePositions[i * 3];
          const y = this.fanBasePositions[i * 3 + 1];
          const z = this.fanBasePositions[i * 3 + 2];
          const angle = this.fanAngles[i];

          // Mexican wave + bouncy jumping
          const jumpPhase = elapsed * 12 + angle * 3;
          const jumpHeight = Math.max(0, Math.sin(jumpPhase)) * 0.75 * decay;

          _dummy.position.set(x, y + jumpHeight, z);
          _dummy.lookAt(0, y, 0);
          _dummy.updateMatrix();
          this.standsFanMesh.setMatrixAt(i, _dummy.matrix);
        }
        this.standsFanMesh.instanceMatrix.needsUpdate = true;
      }
    }

    // 2. Pedestrian stream movements
    for (let p = 0; p < this.peds.length; p++) {
      const ped = this.peds[p];
      ped.t += ped.speed * delta * 0.35;
      if (ped.t > 1) {
        ped.t = 0; // loop back
      }

      // Interpolate along waypoints
      const p1 = ped.points[0];
      const p2 = ped.points[1];
      const p3 = ped.points[2];

      if (ped.t < 0.5) {
        const segT = ped.t * 2;
        _vec3.lerpVectors(p1, p2, segT);
      } else {
        const segT = (ped.t - 0.5) * 2;
        _vec3.lerpVectors(p2, p3, segT);
      }

      // Add gentle walking bounce
      const walkBounce = Math.abs(Math.sin(elapsed * 8 + p)) * 0.12;
      _dummy.position.set(_vec3.x, _vec3.y + walkBounce, _vec3.z);
      _dummy.lookAt(p3.x, _vec3.y, p3.z);
      _dummy.updateMatrix();

      this.pedestrianMesh.setMatrixAt(ped.meshIndex, _dummy.matrix);
    }
    this.pedestrianMesh.instanceMatrix.needsUpdate = true;
  }
}
