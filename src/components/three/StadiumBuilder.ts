import * as THREE from 'three';
import { GateData, StallData } from '../../types/stadium';

// Theme colors: Clean toy-like clay look, warm white base, #1E5EFF electric accent
export const COLORS = {
  accent: 0x1E5EFF, // Royal Blue accent
  accentLight: 0x4B84FF,
  clayWhite: 0xF4F1EA, // Warm white clay
  clayCream: 0xEAE5DC,
  groundPlaza: 0xE2DDD3,
  turfGreen: 0x388E3C, // Lush outfield
  turfGreenLight: 0x4CAF50,
  pitchClay: 0xD7B899, // Clay cricket pitch
  pitchCrease: 0xFFFFFF,
  stumpsWood: 0xB5885C,
  concreteRoad: 0x5D646F,
  roadMarking: 0xE5E9F0,
  curbStone: 0xC5CCD6,
  steelLattice: 0x2C333D,
  standRoof: 0xFAF8F5,
  seatNavy: 0x1E5EFF,
  seatGold: 0xF59E0B,
  seatRed: 0xEF4444,
  seatWhite: 0xE2E8F0,
  busBody: 0x1E3A8A,
  busGold: 0xFBBF24,
  policeBlue: 0x0284C7,
  policeRed: 0xDC2626,
  metroSilver: 0xCBD5E1,
  treeFoliage: 0x2E7D32,
  treeTrunk: 0x6D4C41,
  glassCyan: 0x8BE9FD,
};

// Procedural materials cache
export class StadiumMaterials {
  public groundMat: THREE.MeshStandardMaterial;
  public roadMat: THREE.MeshStandardMaterial;
  public plazaMat: THREE.MeshStandardMaterial;
  public turfMat: THREE.MeshStandardMaterial;
  public pitchMat: THREE.MeshStandardMaterial;
  public creaseMat: THREE.MeshBasicMaterial;
  public standConcreteMat: THREE.MeshStandardMaterial;
  public standRoofMat: THREE.MeshStandardMaterial;
  public accentMat: THREE.MeshStandardMaterial;
  public steelMat: THREE.MeshStandardMaterial;
  public woodMat: THREE.MeshStandardMaterial;
  public glassMat: THREE.MeshPhysicalMaterial;
  public tarpMat: THREE.MeshStandardMaterial;
  public treeMat: THREE.MeshStandardMaterial;
  public trunkMat: THREE.MeshStandardMaterial;
  public floodlightHeadMat: THREE.MeshStandardMaterial;
  public floodlightBulbMat: THREE.MeshStandardMaterial;

  constructor() {
    this.groundMat = new THREE.MeshStandardMaterial({
      color: 0xDFD9CE,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.roadMat = new THREE.MeshStandardMaterial({
      color: COLORS.concreteRoad,
      roughness: 0.8,
      metalness: 0.1,
    });

    this.plazaMat = new THREE.MeshStandardMaterial({
      color: COLORS.groundPlaza,
      roughness: 0.85,
      metalness: 0.05,
    });

    // Create outfield turf texture with mower rings
    const turfCanvas = document.createElement('canvas');
    turfCanvas.width = 512;
    turfCanvas.height = 512;
    const ctx = turfCanvas.getContext('2d')!;
    ctx.fillStyle = '#328336';
    ctx.fillRect(0, 0, 512, 512);
    // Concentric mower rings
    for (let r = 250; r > 10; r -= 28) {
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.fillStyle = (r % 56 === 0) ? '#388E3C' : '#2E7D32';
      ctx.fill();
    }
    const turfTexture = new THREE.CanvasTexture(turfCanvas);
    turfTexture.colorSpace = THREE.SRGBColorSpace;
    turfTexture.wrapS = THREE.RepeatWrapping;
    turfTexture.wrapT = THREE.RepeatWrapping;

    this.turfMat = new THREE.MeshStandardMaterial({
      map: turfTexture,
      roughness: 0.8,
      metalness: 0.02,
    });

    this.pitchMat = new THREE.MeshStandardMaterial({
      color: COLORS.pitchClay,
      roughness: 0.95,
      metalness: 0.0,
    });

    this.creaseMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

    this.standConcreteMat = new THREE.MeshStandardMaterial({
      color: COLORS.clayWhite,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.standRoofMat = new THREE.MeshStandardMaterial({
      color: COLORS.standRoof,
      roughness: 0.5,
      metalness: 0.1,
    });

    this.accentMat = new THREE.MeshStandardMaterial({
      color: COLORS.accent,
      roughness: 0.4,
      metalness: 0.25,
    });

    this.steelMat = new THREE.MeshStandardMaterial({
      color: COLORS.steelLattice,
      roughness: 0.55,
      metalness: 0.6,
    });

    this.woodMat = new THREE.MeshStandardMaterial({
      color: COLORS.stumpsWood,
      roughness: 0.7,
      metalness: 0.0,
    });

    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xE0F2FE,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.9,
      ior: 1.5,
    });

    this.tarpMat = new THREE.MeshStandardMaterial({
      color: 0x1E5EFF,
      roughness: 0.65,
      metalness: 0.1,
    });

    this.treeMat = new THREE.MeshStandardMaterial({
      color: COLORS.treeFoliage,
      roughness: 0.8,
      metalness: 0.0,
    });

    this.trunkMat = new THREE.MeshStandardMaterial({
      color: COLORS.treeTrunk,
      roughness: 0.9,
      metalness: 0.0,
    });

    this.floodlightHeadMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.5,
      metalness: 0.5,
    });

    this.floodlightBulbMat = new THREE.MeshStandardMaterial({
      color: 0xFFFBEB,
      emissive: 0x000000,
      roughness: 0.2,
      metalness: 0.1,
    });
  }
}

export interface InteractiveMeshUserData {
  id: string;
  type: 'gate' | 'stall' | 'pitch' | 'bus' | 'stand' | 'metro' | 'scoreboard' | 'tower';
  title: string;
  subtitle: string;
  position: [number, number, number];
}

export function buildStadiumWorld(
  materials: StadiumMaterials,
  gates: GateData[],
  stalls: StallData[]
) {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'StadiumWorld';
  const interactiveObjects: THREE.Object3D[] = [];

  // 1. BASE PLAZA & BOUNDING TERRAIN
  // Ground slab
  const baseGeo = new THREE.CylinderGeometry(185, 195, 3, 48);
  const baseMesh = new THREE.Mesh(baseGeo, materials.groundMat);
  baseMesh.position.y = -1.5;
  baseMesh.receiveShadow = true;
  rootGroup.add(baseMesh);

  // Outer plaza ring
  const plazaGeo = new THREE.CylinderGeometry(175, 175, 0.4, 48);
  const plazaMesh = new THREE.Mesh(plazaGeo, materials.plazaMat);
  plazaMesh.position.y = 0.2;
  plazaMesh.receiveShadow = true;
  rootGroup.add(plazaMesh);

  // Circular Perimeter Road
  const roadRingGeo = new THREE.RingGeometry(125, 155, 64);
  roadRingGeo.rotateX(-Math.PI / 2);
  const roadMesh = new THREE.Mesh(roadRingGeo, materials.roadMat);
  roadMesh.position.y = 0.22;
  roadMesh.receiveShadow = true;
  rootGroup.add(roadMesh);

  // Road lane divider dashes
  const roadDashesGroup = new THREE.Group();
  const dashCount = 48;
  const dashGeo = new THREE.PlaneGeometry(1.2, 5);
  dashGeo.rotateX(-Math.PI / 2);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  for (let i = 0; i < dashCount; i++) {
    const angle = (i / dashCount) * Math.PI * 2;
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(Math.cos(angle) * 140, 0.23, Math.sin(angle) * 140);
    dash.rotation.y = -angle + Math.PI / 2;
    roadDashesGroup.add(dash);
  }
  rootGroup.add(roadDashesGroup);

  // 2. CRICKET GROUND (OVAL & PITCH)
  const ovalRadiusX = 66;
  const ovalRadiusZ = 58;

  // Outfield ground mesh (elliptical cylinder)
  const outfieldGeo = new THREE.CylinderGeometry(1, 1, 0.6, 64);
  outfieldGeo.scale(ovalRadiusX, 1, ovalRadiusZ);
  const outfieldMesh = new THREE.Mesh(outfieldGeo, materials.turfMat);
  outfieldMesh.position.y = 0.3;
  outfieldMesh.receiveShadow = true;
  rootGroup.add(outfieldMesh);

  // Boundary Rope with foam wedges
  const boundaryPoints: THREE.Vector3[] = [];
  const boundaryCount = 80;
  for (let i = 0; i <= boundaryCount; i++) {
    const a = (i / boundaryCount) * Math.PI * 2;
    boundaryPoints.push(new THREE.Vector3(Math.cos(a) * (ovalRadiusX - 1.5), 0.65, Math.sin(a) * (ovalRadiusZ - 1.5)));
  }
  const boundaryCurve = new THREE.CatmullRomCurve3(boundaryPoints, true);
  const boundaryTubeGeo = new THREE.TubeGeometry(boundaryCurve, 120, 0.28, 6, true);
  const boundaryRopeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 });
  const boundaryRope = new THREE.Mesh(boundaryTubeGeo, boundaryRopeMat);
  rootGroup.add(boundaryRope);

  // 30-yard inner circle dotted line
  const innerCircleGeo = new THREE.RingGeometry(27.8, 28.2, 64);
  innerCircleGeo.rotateX(-Math.PI / 2);
  const innerCircleMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, opacity: 0.65, transparent: true });
  const innerCircle = new THREE.Mesh(innerCircleGeo, innerCircleMat);
  innerCircle.position.y = 0.62;
  rootGroup.add(innerCircle);

  // Center Pitch Strip (22 yards = 20.12m approx, width ~3.05m)
  const pitchLength = 20;
  const pitchWidth = 3.6;
  const pitchGeo = new THREE.BoxGeometry(pitchWidth, 0.12, pitchLength);
  const pitchMesh = new THREE.Mesh(pitchGeo, materials.pitchMat);
  pitchMesh.position.set(0, 0.65, 0);
  pitchMesh.receiveShadow = true;
  pitchMesh.castShadow = true;
  pitchMesh.userData = {
    id: 'pitch',
    type: 'pitch',
    title: 'Match Pitch - Turf Strip #3',
    subtitle: 'Wankhede Grade • Good carry & bounce',
    position: [0, 0.8, 0],
  } as InteractiveMeshUserData;
  interactiveObjects.push(pitchMesh);
  rootGroup.add(pitchMesh);

  // Pitch Creases (Bowling & Popping Creases)
  const creaseLinesGroup = new THREE.Group();
  [-pitchLength / 2 + 1.2, pitchLength / 2 - 1.2].forEach((zPos) => {
    // Popping crease
    const popGeo = new THREE.PlaneGeometry(pitchWidth, 0.1);
    popGeo.rotateX(-Math.PI / 2);
    const popMesh = new THREE.Mesh(popGeo, materials.creaseMat);
    popMesh.position.set(0, 0.72, zPos);
    creaseLinesGroup.add(popMesh);

    // Return creases
    const retGeo = new THREE.PlaneGeometry(0.1, 2.2);
    retGeo.rotateX(-Math.PI / 2);
    const ret1 = new THREE.Mesh(retGeo, materials.creaseMat);
    ret1.position.set(-pitchWidth / 2 + 0.3, 0.72, zPos - (zPos > 0 ? 0.9 : -0.9));
    const ret2 = ret1.clone();
    ret2.position.x = pitchWidth / 2 - 0.3;
    creaseLinesGroup.add(ret1, ret2);
  });
  rootGroup.add(creaseLinesGroup);

  // Wooden Stumps + Bails at both ends
  const stumpsGroup = new THREE.Group();
  [-pitchLength / 2 + 1.2, pitchLength / 2 - 1.2].forEach((zPos) => {
    const stumpGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8);
    const bailGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6);
    bailGeo.rotateZ(Math.PI / 2);

    [-0.1, 0, 0.1].forEach((xOff) => {
      const stump = new THREE.Mesh(stumpGeo, materials.woodMat);
      stump.position.set(xOff, 0.7 + 0.375, zPos);
      stump.castShadow = true;
      stumpsGroup.add(stump);
    });

    const bail1 = new THREE.Mesh(bailGeo, materials.woodMat);
    bail1.position.set(-0.05, 0.7 + 0.76, zPos);
    const bail2 = new THREE.Mesh(bailGeo, materials.woodMat);
    bail2.position.set(0.05, 0.7 + 0.76, zPos);
    stumpsGroup.add(bail1, bail2);
  });
  rootGroup.add(stumpsGroup);

  // Pitch Rain Cover Group (tarp rolled / unrolled)
  const pitchCoverGroup = new THREE.Group();
  pitchCoverGroup.name = 'PitchCoverGroup';
  const tarpPlaneGeo = new THREE.PlaneGeometry(16, 26);
  tarpPlaneGeo.rotateX(-Math.PI / 2);
  const tarpMesh = new THREE.Mesh(tarpPlaneGeo, materials.tarpMat);
  tarpMesh.position.set(0, 0.75, 0);
  tarpMesh.castShadow = true;
  pitchCoverGroup.add(tarpMesh);

  // Rolling tube cylinders along sides
  const rollerGeo = new THREE.CylinderGeometry(0.35, 0.35, 26, 16);
  rollerGeo.rotateX(Math.PI / 2);
  const roller1 = new THREE.Mesh(rollerGeo, materials.steelMat);
  roller1.position.set(-8.2, 0.8, 0);
  const roller2 = new THREE.Mesh(rollerGeo, materials.steelMat);
  roller2.position.set(8.2, 0.8, 0);
  pitchCoverGroup.add(roller1, roller2);

  // Ground staff pushing the tarp (low poly workers with caps)
  const workerPositions = [
    [-8.8, 0.6, -8], [-8.8, 0.6, 0], [-8.8, 0.6, 8],
    [8.8, 0.6, -8], [8.8, 0.6, 0], [8.8, 0.6, 8],
  ];
  const workerMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.6 });
  workerPositions.forEach((pos) => {
    const worker = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), workerMat);
    body.position.y = 0.4;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0xFFD1B2 }));
    head.position.y = 0.95;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 8), materials.accentMat);
    cap.position.y = 1.05;
    worker.add(body, head, cap);
    worker.position.set(pos[0], pos[1], pos[2]);
    pitchCoverGroup.add(worker);
  });

  pitchCoverGroup.visible = false; // toggled when weather === 'rain'
  rootGroup.add(pitchCoverGroup);

  // 3. TIERED STADIUM STANDS (LOWER, UPPER, VIP CORPORATE BOXES, CANOPY ROOF)
  const standsGroup = new THREE.Group();
  standsGroup.name = 'StadiumStands';

  // Tier 1 (Lower Bowl)
  const tier1InnerR = ovalRadiusX + 2;
  const tier1OuterR = tier1InnerR + 18;
  const tier1Steps = 8;
  for (let s = 0; s < tier1Steps; s++) {
    const rIn = tier1InnerR + s * 2.2;
    const rOut = rIn + 2.3;
    const h = 0.8 + s * 0.9;
    const stepGeo = new THREE.CylinderGeometry(1, 1, 0.95, 64, 1, true);
    stepGeo.scale((rIn + rOut) / 2, 1, ((rIn + rOut) / 2) * (ovalRadiusZ / ovalRadiusX));
    const stepMesh = new THREE.Mesh(stepGeo, materials.standConcreteMat);
    stepMesh.position.y = h;
    stepMesh.receiveShadow = true;
    standsGroup.add(stepMesh);
  }

  // VIP Corporate Suites Glass Ring
  const vipGeo = new THREE.CylinderGeometry(1, 1, 2.8, 64, 1, true);
  vipGeo.scale(tier1OuterR + 1, 1, (tier1OuterR + 1) * (ovalRadiusZ / ovalRadiusX));
  const vipMesh = new THREE.Mesh(vipGeo, materials.glassMat);
  vipMesh.position.y = 8.5;
  standsGroup.add(vipMesh);

  // Tier 2 (Upper Bowl)
  const tier2InnerR = tier1OuterR + 2.5;
  const tier2Steps = 9;
  for (let s = 0; s < tier2Steps; s++) {
    const rIn = tier2InnerR + s * 2.4;
    const rOut = rIn + 2.5;
    const h = 10.2 + s * 1.1;
    const stepGeo = new THREE.CylinderGeometry(1, 1, 1.15, 64, 1, true);
    stepGeo.scale((rIn + rOut) / 2, 1, ((rIn + rOut) / 2) * (ovalRadiusZ / ovalRadiusX));
    const stepMesh = new THREE.Mesh(stepGeo, materials.standConcreteMat);
    stepMesh.position.y = h;
    stepMesh.receiveShadow = true;
    standsGroup.add(stepMesh);
  }

  // Outer Facade Wall
  const outerWallR = tier2InnerR + tier2Steps * 2.4 + 2;
  const facadeGeo = new THREE.CylinderGeometry(1, 1, 22, 64, 1, true);
  facadeGeo.scale(outerWallR, 1, outerWallR * (ovalRadiusZ / ovalRadiusX));
  const facadeMesh = new THREE.Mesh(facadeGeo, materials.standConcreteMat);
  facadeMesh.position.y = 11;
  facadeMesh.castShadow = true;
  standsGroup.add(facadeMesh);

  // Blue Accent Ring around top facade
  const blueBandGeo = new THREE.CylinderGeometry(1, 1, 1.8, 64, 1, true);
  blueBandGeo.scale(outerWallR + 0.15, 1, (outerWallR + 0.15) * (ovalRadiusZ / ovalRadiusX));
  const blueBandMesh = new THREE.Mesh(blueBandGeo, materials.accentMat);
  blueBandMesh.position.y = 21.2;
  standsGroup.add(blueBandMesh);

  // Grand Cantilevered Roof Canopies (Segmented petals in clean white with blue trims)
  const roofSegments = 16;
  for (let i = 0; i < roofSegments; i++) {
    const startA = (i / roofSegments) * Math.PI * 2 + 0.04;
    const endA = ((i + 1) / roofSegments) * Math.PI * 2 - 0.04;

    const roofShape = new THREE.Shape();
    const rxOuter = outerWallR + 2;
    const rzOuter = (outerWallR + 2) * (ovalRadiusZ / ovalRadiusX);
    const rxInner = outerWallR - 26;
    const rzInner = (outerWallR - 26) * (ovalRadiusZ / ovalRadiusX);

    roofShape.absellipse(0, 0, rxOuter, rzOuter, startA, endA, false, 0);
    roofShape.absellipse(0, 0, rxInner, rzInner, endA, startA, true, 0);

    const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
      depth: 0.6,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    });
    roofGeo.rotateX(-Math.PI / 2);
    const roofMesh = new THREE.Mesh(roofGeo, materials.standRoofMat);
    roofMesh.position.y = 23.5;
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    standsGroup.add(roofMesh);

    // Structural support cantilever arms
    const midA = (startA + endA) / 2;
    const armGeo = new THREE.BoxGeometry(1.2, 0.8, 28);
    const armMesh = new THREE.Mesh(armGeo, materials.steelMat);
    armMesh.position.set(
      Math.cos(midA) * (outerWallR - 12),
      24.2,
      Math.sin(midA) * (outerWallR - 12) * (ovalRadiusZ / ovalRadiusX)
    );
    armMesh.rotation.y = -midA + Math.PI / 2;
    armMesh.rotation.x = 0.06;
    standsGroup.add(armMesh);
  }

  // Interactive Stands Object
  const standsTrigger = new THREE.Mesh(
    new THREE.RingGeometry(ovalRadiusX + 5, outerWallR, 32),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  standsTrigger.rotation.x = -Math.PI / 2;
  standsTrigger.position.y = 10;
  standsTrigger.userData = {
    id: 'stands',
    type: 'stand',
    title: 'Grandstand & Pavilions',
    subtitle: 'Capacity 65,000 • 92% Seated',
    position: [0, 14, -ovalRadiusZ - 10],
  } as InteractiveMeshUserData;
  interactiveObjects.push(standsTrigger);
  standsGroup.add(standsTrigger);

  rootGroup.add(standsGroup);

  // 4. FOUR GIANT FLOODLIGHT TOWERS
  const floodlightTowers: {
    group: THREE.Group;
    spotLight: THREE.SpotLight;
    bulbs: THREE.Mesh[];
  }[] = [];

  const towerCorners = [
    { x: 92, z: 75, angle: Math.PI * 0.75, name: 'North-East Tower' },
    { x: -92, z: 75, angle: Math.PI * 0.25, name: 'North-West Tower' },
    { x: 92, z: -75, angle: -Math.PI * 0.75, name: 'South-East Tower' },
    { x: -92, z: -75, angle: -Math.PI * 0.25, name: 'South-West Tower' },
  ];

  towerCorners.forEach((corner, idx) => {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(corner.x, 0, corner.z);

    // 4 steel legs tapered
    const legHeight = 44;
    const legGeo = new THREE.CylinderGeometry(0.25, 0.45, legHeight, 8);
    const legOffsets = [
      [-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]
    ];
    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, materials.steelMat);
      leg.position.set(lx * 0.6, legHeight / 2, lz * 0.6);
      towerGroup.add(leg);
    });

    // Horizontal & diagonal lattice braces
    for (let h = 4; h < legHeight; h += 4.5) {
      const ringFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 3.6), materials.steelMat);
      ringFrame.position.y = h;
      towerGroup.add(ringFrame);
    }

    // Top Platform with safety railings
    const platform = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 4.5), materials.steelMat);
    platform.position.y = legHeight;
    platform.rotation.y = corner.angle;
    towerGroup.add(platform);

    // Rectangular Floodlight Array Head
    const headFrame = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 1.2), materials.floodlightHeadMat);
    headFrame.position.set(0, legHeight + 3.2, 0);
    headFrame.rotation.y = corner.angle;
    headFrame.rotation.x = 0.35; // tilted down towards pitch
    towerGroup.add(headFrame);

    // Matrix of light bulbs
    const bulbs: THREE.Mesh[] = [];
    const bulbGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12);
    bulbGeo.rotateX(Math.PI / 2);
    for (let row = -1.6; row <= 1.6; row += 1.05) {
      for (let col = -4; col <= 4; col += 1.3) {
        const bulb = new THREE.Mesh(bulbGeo, materials.floodlightBulbMat);
        bulb.position.set(col, row, 0.65);
        headFrame.add(bulb);
        bulbs.push(bulb);
      }
    }

    // Three.js Spotlight pointing toward pitch center
    const spot = new THREE.SpotLight(0xFFFBF0, 0, 160, Math.PI / 5, 0.4, 1.2);
    spot.position.set(corner.x, legHeight + 3, corner.z);
    spot.target.position.set(0, 0, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.width = 1024;
    spot.shadow.mapSize.height = 1024;
    spot.shadow.bias = -0.0008;
    rootGroup.add(spot);
    rootGroup.add(spot.target);

    // Interactive tower trigger
    const towerTrigger = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, legHeight, 8), new THREE.MeshBasicMaterial({ visible: false }));
    towerTrigger.position.y = legHeight / 2;
    towerTrigger.userData = {
      id: `tower-${idx}`,
      type: 'tower',
      title: `${corner.name}`,
      subtitle: '3.2 MW High-Output LED Bank • Phase ' + (idx + 1),
      position: [corner.x, legHeight, corner.z],
    } as InteractiveMeshUserData;
    interactiveObjects.push(towerTrigger);
    towerGroup.add(towerTrigger);

    rootGroup.add(towerGroup);
    floodlightTowers.push({ group: towerGroup, spotLight: spot, bulbs });
  });

  // 5. GIANT SCOREBOARD
  const scoreboardGroup = new THREE.Group();
  scoreboardGroup.position.set(0, 0, -ovalRadiusZ - 18);
  scoreboardGroup.name = 'Scoreboard';

  // Support twin lattice masts
  const sbMastGeo = new THREE.BoxGeometry(1.4, 28, 1.4);
  const sbMast1 = new THREE.Mesh(sbMastGeo, materials.steelMat);
  sbMast1.position.set(-10, 14, 0);
  const sbMast2 = new THREE.Mesh(sbMastGeo, materials.steelMat);
  sbMast2.position.set(10, 14, 0);
  scoreboardGroup.add(sbMast1, sbMast2);

  // Bezel Box
  const sbBezelGeo = new THREE.BoxGeometry(26, 12, 1.6);
  const sbBezel = new THREE.Mesh(sbBezelGeo, new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.4, metalness: 0.7 }));
  sbBezel.position.set(0, 26, 0);
  scoreboardGroup.add(sbBezel);

  // Live Screen Canvas Texture
  const sbCanvas = document.createElement('canvas');
  sbCanvas.width = 1024;
  sbCanvas.height = 512;
  const sbTexture = new THREE.CanvasTexture(sbCanvas);
  sbTexture.colorSpace = THREE.SRGBColorSpace;
  const sbScreenMat = new THREE.MeshBasicMaterial({ map: sbTexture });
  const sbScreen = new THREE.Mesh(new THREE.PlaneGeometry(24, 10.4), sbScreenMat);
  sbScreen.position.set(0, 26, 0.85);
  scoreboardGroup.add(sbScreen);

  // Interactive Scoreboard trigger
  const sbTrigger = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 4), new THREE.MeshBasicMaterial({ visible: false }));
  sbTrigger.position.set(0, 26, 0);
  sbTrigger.userData = {
    id: 'scoreboard',
    type: 'scoreboard',
    title: 'Main LED Scoreboard',
    subtitle: 'UltraHD P3.9mm Screen • Hawk-Eye & DRS Sync',
    position: [0, 26, -ovalRadiusZ - 18],
  } as InteractiveMeshUserData;
  interactiveObjects.push(sbTrigger);
  scoreboardGroup.add(sbTrigger);

  rootGroup.add(scoreboardGroup);

  // 6. ENTRY GATES & TURNSTILES
  const gateMeshes: THREE.Group[] = [];
  gates.forEach((gate) => {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(gate.position[0], gate.position[1], gate.position[2]);

    // Canopy Roof in Accent Blue & warm white
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 6), materials.standRoofMat);
    canopy.position.y = 4.2;
    canopy.castShadow = true;
    gateGroup.add(canopy);

    const canopyTrim = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.3, 6.2), materials.accentMat);
    canopyTrim.position.y = 4.6;
    gateGroup.add(canopyTrim);

    // Support pillars
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 4.2, 12);
    [-6, 6].forEach((px) => {
      [-2.4, 2.4].forEach((pz) => {
        const pillar = new THREE.Mesh(pillarGeo, materials.steelMat);
        pillar.position.set(px, 2.1, pz);
        pillar.castShadow = true;
        gateGroup.add(pillar);
      });
    });

    // Bank of turnstiles
    const turnstileBodyGeo = new THREE.BoxGeometry(0.7, 1.1, 1.8);
    const turnstileMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.3, metalness: 0.8 });
    const indicatorMat = new THREE.MeshBasicMaterial({ color: gate.status === 'optimal' ? 0x22C55E : 0xEF4444 });
    for (let t = -4.5; t <= 4.5; t += 1.8) {
      const tsBody = new THREE.Mesh(turnstileBodyGeo, turnstileMat);
      tsBody.position.set(t, 0.55, 0);
      tsBody.castShadow = true;
      gateGroup.add(tsBody);

      // Status LED light on turnstile
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), indicatorMat);
      led.position.set(t, 1.15, 0.5);
      gateGroup.add(led);
    }

    // Gate Identification Signboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#1E5EFF';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.fillStyle = '#FFFFFF';
    sCtx.font = 'bold 54px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText(gate.name.toUpperCase(), 256, 64);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.colorSpace = THREE.SRGBColorSpace;
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: signTexture }));
    signMesh.position.set(0, 4.2, 3.05);
    gateGroup.add(signMesh);

    // Interactive Trigger
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(16, 5, 8), new THREE.MeshBasicMaterial({ visible: false }));
    trigger.position.y = 2.5;
    trigger.userData = {
      id: gate.id,
      type: 'gate',
      title: `${gate.name} (${gate.zone})`,
      subtitle: `${gate.openLanes}/${gate.totalLanes} Lanes • Wait: ${gate.waitTimeMin}m`,
      position: gate.position,
    } as InteractiveMeshUserData;
    interactiveObjects.push(trigger);
    gateGroup.add(trigger);

    rootGroup.add(gateGroup);
    gateMeshes.push(gateGroup);
  });

  // 7. FOOD & MERCHANDISE STALLS
  stalls.forEach((stall) => {
    const stallGroup = new THREE.Group();
    stallGroup.position.set(stall.position[0], stall.position[1], stall.position[2]);

    // Kiosk Base
    const kioskGeo = new THREE.BoxGeometry(6, 3, 4);
    const kioskMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.6 });
    const kioskMesh = new THREE.Mesh(kioskGeo, kioskMat);
    kioskMesh.position.y = 1.5;
    kioskMesh.castShadow = true;
    stallGroup.add(kioskMesh);

    // Counter shelf
    const counterGeo = new THREE.BoxGeometry(6.4, 0.25, 1.2);
    const counter = new THREE.Mesh(counterGeo, materials.woodMat);
    counter.position.set(0, 1.2, 2.1);
    stallGroup.add(counter);

    // Striped Awning canopy
    const awningGeo = new THREE.BoxGeometry(6.6, 0.3, 3);
    const awningMat = new THREE.MeshStandardMaterial({
      color: stall.category === 'Merch' ? 0x1E5EFF : stall.category === 'Beverages' ? 0x0284C7 : 0xF97316,
      roughness: 0.5,
    });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 3.2, 1.2);
    awning.rotation.x = 0.25;
    awning.castShadow = true;
    stallGroup.add(awning);

    // Stall Banner
    const stallCanvas = document.createElement('canvas');
    stallCanvas.width = 512;
    stallCanvas.height = 128;
    const ctx = stallCanvas.getContext('2d')!;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stall.name, 256, 64);
    const stallTex = new THREE.CanvasTexture(stallCanvas);
    stallTex.colorSpace = THREE.SRGBColorSpace;
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), new THREE.MeshBasicMaterial({ map: stallTex }));
    banner.position.set(0, 3.6, 2.4);
    stallGroup.add(banner);

    // Interactive Trigger
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), new THREE.MeshBasicMaterial({ visible: false }));
    trigger.position.y = 2.5;
    trigger.userData = {
      id: stall.id,
      type: 'stall',
      title: stall.name,
      subtitle: `${stall.category} • Queue: ${stall.queueLength} fans (~${stall.waitMinutes}m)`,
      position: stall.position,
    } as InteractiveMeshUserData;
    interactiveObjects.push(trigger);
    stallGroup.add(trigger);

    rootGroup.add(stallGroup);
  });

  // 8. METRO STATION & TRAIN TRACKS
  const metroGroup = new THREE.Group();
  metroGroup.position.set(130, 0, 0);
  metroGroup.name = 'MetroStation';

  // Station Platform concrete deck
  const platformGeo = new THREE.BoxGeometry(18, 1.4, 52);
  const platformMesh = new THREE.Mesh(platformGeo, materials.standConcreteMat);
  platformMesh.position.y = 0.7;
  platformMesh.receiveShadow = true;
  metroGroup.add(platformMesh);

  // Twin Arched Canopies with glass roofs
  const canopyArchGeo = new THREE.CylinderGeometry(10, 10, 48, 16, 1, true, 0, Math.PI);
  canopyArchGeo.rotateZ(Math.PI / 2);
  canopyArchGeo.rotateY(Math.PI / 2);
  const metroCanopy = new THREE.Mesh(canopyArchGeo, materials.glassMat);
  metroCanopy.position.set(0, 4.5, 0);
  metroGroup.add(metroCanopy);

  // Metro sign totem
  const totem = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 1.2), materials.accentMat);
  totem.position.set(-8, 4.5, 22);
  const metroSymbol = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 16), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
  metroSymbol.rotation.z = Math.PI / 2;
  metroSymbol.position.set(-8, 9.4, 22);
  metroGroup.add(totem, metroSymbol);

  // Metro Tracks
  const trackBedGeo = new THREE.BoxGeometry(6, 0.3, 70);
  const trackBed = new THREE.Mesh(trackBedGeo, new THREE.MeshStandardMaterial({ color: 0x475569 }));
  trackBed.position.set(7, 0.2, 0);
  metroGroup.add(trackBed);

  // Metro Train (Animated group with locomotive + passenger cars)
  const metroTrain = new THREE.Group();
  metroTrain.name = 'MetroTrain';
  metroTrain.position.set(7, 0.6, 0);

  const trainCarGeo = new THREE.BoxGeometry(3.2, 3.2, 18);
  const trainCarMat = new THREE.MeshStandardMaterial({ color: COLORS.metroSilver, roughness: 0.3, metalness: 0.6 });
  const trainStripeMat = new THREE.MeshStandardMaterial({ color: COLORS.accent, roughness: 0.4 });

  [-10, 10].forEach((zPos) => {
    const car = new THREE.Mesh(trainCarGeo, trainCarMat);
    car.position.set(0, 1.6, zPos);
    car.castShadow = true;

    // Accent Stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.5, 18), trainStripeMat);
    stripe.position.set(0, 1.6, 0);
    car.add(stripe);

    // Windows
    const winGeo = new THREE.BoxGeometry(3.32, 0.9, 14);
    const winMesh = new THREE.Mesh(winGeo, new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.1 }));
    winMesh.position.set(0, 2.1, 0);
    car.add(winMesh);

    metroTrain.add(car);
  });
  metroGroup.add(metroTrain);

  // Interactive Metro trigger
  const metroTrigger = new THREE.Mesh(new THREE.BoxGeometry(26, 8, 56), new THREE.MeshBasicMaterial({ visible: false }));
  metroTrigger.position.y = 4;
  metroTrigger.userData = {
    id: 'metro',
    type: 'metro',
    title: 'Stadium Metro Interchange',
    subtitle: 'Blue Line Express • 4 min headway • 18k pax/hr',
    position: [130, 4, 0],
  } as InteractiveMeshUserData;
  interactiveObjects.push(metroTrigger);
  metroGroup.add(metroTrigger);

  rootGroup.add(metroGroup);

  // 9. PARKING LOT & VEHICLES
  const parkingGroup = new THREE.Group();
  parkingGroup.position.set(-130, 0, 0);
  parkingGroup.name = 'ParkingLot';

  const parkingAsphaltGeo = new THREE.BoxGeometry(45, 0.3, 65);
  const parkingAsphalt = new THREE.Mesh(parkingAsphaltGeo, materials.roadMat);
  parkingAsphalt.position.y = 0.2;
  parkingAsphalt.receiveShadow = true;
  parkingGroup.add(parkingAsphalt);

  // Painted parking bays
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  for (let z = -28; z <= 28; z += 5) {
    const pLine = new THREE.Mesh(new THREE.PlaneGeometry(16, 0.2), lineMat);
    pLine.rotateX(-Math.PI / 2);
    pLine.position.set(-10, 0.36, z);
    parkingGroup.add(pLine);

    const pLine2 = pLine.clone();
    pLine2.position.x = 10;
    parkingGroup.add(pLine2);
  }

  // Parked Low-Poly Cars
  const carColors = [0x3B82F6, 0xEF4444, 0x10B981, 0xF59E0B, 0x64748B, 0xFFFFFF, 0x1E293B];
  for (let r = -25; r <= 25; r += 5) {
    if (Math.random() > 0.15) { // 85% full
      const car = createLowPolyCar(carColors[Math.floor(Math.random() * carColors.length)]);
      car.position.set(-10, 0.35, r);
      parkingGroup.add(car);
    }
    if (Math.random() > 0.2) {
      const car = createLowPolyCar(carColors[Math.floor(Math.random() * carColors.length)]);
      car.position.set(10, 0.35, r);
      car.rotation.y = Math.PI;
      parkingGroup.add(car);
    }
  }

  // Parking Barrier Gate
  const barrierPost = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 0.6), materials.accentMat);
  barrierPost.position.set(20, 1, 0);
  const barrierArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6, 8), new THREE.MeshStandardMaterial({ color: 0xEF4444 }));
  barrierArm.rotation.z = Math.PI / 2;
  barrierArm.position.set(17, 1.2, 0);
  parkingGroup.add(barrierPost, barrierArm);

  // Interactive Parking trigger
  const parkingTrigger = new THREE.Mesh(new THREE.BoxGeometry(50, 6, 70), new THREE.MeshBasicMaterial({ visible: false }));
  parkingTrigger.position.y = 3;
  parkingTrigger.userData = {
    id: 'parking',
    type: 'bus',
    title: 'North-West Transit & Parking',
    subtitle: 'Capacity 1,850 • 88% Occupied • 220 Bays Free',
    position: [-130, 3, 0],
  } as InteractiveMeshUserData;
  interactiveObjects.push(parkingTrigger);
  parkingGroup.add(parkingTrigger);

  rootGroup.add(parkingGroup);

  // 10. TEAM BUS CONVOY (LUXURY COACH + POLICE ESCORT SUVS)
  const busConvoy = new THREE.Group();
  busConvoy.name = 'TeamBusConvoy';
  busConvoy.position.set(0, 0.3, 138);

  // Luxury Team Bus
  const bus = createTeamCoach();
  busConvoy.add(bus);

  // Police Escort Lead SUV
  const policeLead = createPoliceEscort();
  policeLead.position.set(0, 0, 16);
  busConvoy.add(policeLead);

  // Police Escort Rear SUV
  const policeRear = createPoliceEscort();
  policeRear.position.set(0, 0, -16);
  busConvoy.add(policeRear);

  // Interactive Convoy trigger
  const busTrigger = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 38), new THREE.MeshBasicMaterial({ visible: false }));
  busTrigger.position.y = 2;
  busTrigger.userData = {
    id: 'bus',
    type: 'bus',
    title: 'India Team Motorcade',
    subtitle: 'Arrived via Police Green Corridor • VIP Gate Access',
    position: [0, 2, 138],
  } as InteractiveMeshUserData;
  interactiveObjects.push(busTrigger);
  busConvoy.add(busTrigger);

  rootGroup.add(busConvoy);

  // 11. TREES & SURROUNDING GREENERY
  const treesGroup = new THREE.Group();
  const treeCount = 60;
  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + Math.random() * 0.05;
    const dist = 162 + Math.random() * 18;
    const tx = Math.cos(angle) * dist;
    const tz = Math.sin(angle) * dist;

    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.5, 8), materials.trunkMat);
    trunk.position.y = 1.25;
    trunk.castShadow = true;

    // Foliage (low poly octahedron or icosahedron)
    const folGeo = new THREE.IcosahedronGeometry(1.8 + Math.random() * 0.6, 1);
    const fol = new THREE.Mesh(folGeo, materials.treeMat);
    fol.position.y = 3.4;
    fol.castShadow = true;

    tree.add(trunk, fol);
    tree.position.set(tx, 0.2, tz);
    treesGroup.add(tree);
  }
  rootGroup.add(treesGroup);

  return {
    rootGroup,
    interactiveObjects,
    pitchCoverGroup,
    scoreboardCanvas: sbCanvas,
    scoreboardTexture: sbTexture,
    floodlightTowers,
    busConvoy,
    metroTrain,
  };
}

// Low poly passenger car builder (composite 4 parts)
function createLowPolyCar(colorHex: number): THREE.Group {
  const car = new THREE.Group();
  const bodyGeo = new THREE.BoxGeometry(2.4, 0.8, 4.4);
  const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4, metalness: 0.2 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6;
  body.castShadow = true;

  const cabinGeo = new THREE.BoxGeometry(2.1, 0.7, 2.4);
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.2 });
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 1.3, -0.3);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 8);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 });
  [
    [-1.2, 0.36, -1.3], [1.2, 0.36, -1.3],
    [-1.2, 0.36, 1.3], [1.2, 0.36, 1.3]
  ].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(wx, wy, wz);
    car.add(wheel);
  });

  car.add(body, cabin);
  return car;
}

// Luxury team coach (composite 6 parts)
function createTeamCoach(): THREE.Group {
  const bus = new THREE.Group();
  const busBodyGeo = new THREE.BoxGeometry(3.4, 3.2, 12);
  const busMat = new THREE.MeshStandardMaterial({ color: COLORS.busBody, roughness: 0.3, metalness: 0.3 });
  const body = new THREE.Mesh(busBodyGeo, busMat);
  body.position.y = 2;
  body.castShadow = true;

  // Gold livery stripe
  const stripeGeo = new THREE.BoxGeometry(3.45, 0.4, 12);
  const stripe = new THREE.Mesh(stripeGeo, new THREE.MeshStandardMaterial({ color: COLORS.busGold, roughness: 0.3, metalness: 0.6 }));
  stripe.position.y = 1.8;

  // Windshield & Panoramic Windows
  const glassGeo = new THREE.BoxGeometry(3.44, 1.1, 10);
  const glass = new THREE.Mesh(glassGeo, new THREE.MeshStandardMaterial({ color: 0x0A0F1D, roughness: 0.1 }));
  glass.position.set(0, 2.5, 0.5);

  // Roof AC units
  const acGeo = new THREE.BoxGeometry(2.4, 0.4, 4);
  const ac = new THREE.Mesh(acGeo, new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.5 }));
  ac.position.set(0, 3.8, -1.5);

  // Wheels (6 wheels for coach)
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 10);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8 });
  [
    [-1.7, 0.5, 4], [1.7, 0.5, 4],
    [-1.7, 0.5, -2.5], [1.7, 0.5, -2.5],
    [-1.7, 0.5, -4], [1.7, 0.5, -4]
  ].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(wx, wy, wz);
    bus.add(wheel);
  });

  bus.add(body, stripe, glass, ac);
  return bus;
}

// Police Escort SUV with flashing siren lights
function createPoliceEscort(): THREE.Group {
  const suv = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.2, 5),
    new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.4 })
  );
  body.position.y = 0.9;
  body.castShadow = true;

  // Dark Windows
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.9, 3),
    new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.1 })
  );
  cabin.position.set(0, 1.8, -0.4);

  // Police Blue door decal
  const decal = new THREE.Mesh(
    new THREE.BoxGeometry(2.44, 0.4, 3.2),
    new THREE.MeshStandardMaterial({ color: 0x0284C7 })
  );
  decal.position.set(0, 0.8, -0.2);

  // Rooftop Lightbar with red & blue emissive beacons
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.4), new THREE.MeshStandardMaterial({ color: 0x1E293B }));
  bar.position.set(0, 2.35, -0.4);

  const redLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xFF0000, emissiveIntensity: 2 }));
  redLight.position.set(-0.5, 2.45, -0.4);
  const blueLight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0x3B82F6, emissive: 0x0066FF, emissiveIntensity: 2 }));
  blueLight.position.set(0.5, 2.45, -0.4);

  suv.add(body, cabin, decal, bar, redLight, blueLight);
  return suv;
}
