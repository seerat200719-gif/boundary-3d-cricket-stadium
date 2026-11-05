import * as THREE from 'three';

export interface PixarCharacterOptions {
  outfit?: 'pink_polo' | 'team_blue' | 'team_gold' | 'ops_suit';
  scale?: number;
  includeLegs?: boolean;
  holdingBat?: boolean;
}

export type AvatarEmote = 'idle' | 'batting' | 'cheer' | 'cheering' | 'clap' | 'walk' | 'running' | 'wave' | 'bow' | 'flex';

export interface PixarCharacterInstance {
  group: THREE.Group;
  headGroup: THREE.Group;
  leftEyeGroup: THREE.Group;
  rightEyeGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLegGroup?: THREE.Group;
  rightLegGroup?: THREE.Group;
  batMesh?: THREE.Mesh;
  blink: (isBlinking: boolean) => void;
  lookAtTarget: (target: THREE.Vector3) => void;
  updateAnimation: (time: number, action?: AvatarEmote) => void;
  triggerEmote: (emote: AvatarEmote, durationMs?: number) => void;
  getActiveEmote: () => AvatarEmote;
  setOutfit: (outfit: 'pink_polo' | 'team_blue' | 'team_gold' | 'ops_suit') => void;
}

/**
 * Procedural 3D Pixar-style character modeler based on the reference portrait.
 * Features:
 * - Contoured peach face with cute button nose and warm smile
 * - Soulful Pixar cartoon eyes with dark brown iris, pupil, and dual catchlights
 * - Voluminous layered chestnut hair with front swoop and top cowlick tuft
 * - Pink polo shirt with folded collar, inner red shirt collar, placket, and buttons
 * - Articulated arms and optional cricket bat
 */
export function createPixarCharacter(options: PixarCharacterOptions = {}): PixarCharacterInstance {
  const {
    outfit = 'pink_polo',
    scale = 1.0,
    includeLegs = true,
    holdingBat = false,
  } = options;

  const rootGroup = new THREE.Group();
  rootGroup.name = 'PixarCharacter';

  // 1. PALETTE & MATERIALS
  const skinColor = 0xF5C4A6;
  const skinShadowColor = 0xE6AB88;
  const hairColor = 0x583424;
  const hairHighlightColor = 0x724530;
  const eyebrowColor = 0x3F2215;
  const eyeIrisColor = 0x3D1B10;
  const eyePupilColor = 0x0A0605;
  const innerShirtRed = 0xC92A2A;

  // Outfit base colors
  let shirtColor = 0xF48FB1; // Reference Pink Polo
  let collarColor = 0xF06292;
  let pantColor = 0x334155; // Dark slate pants

  if (outfit === 'team_blue') {
    shirtColor = 0x1E5EFF;
    collarColor = 0x184FD9;
    pantColor = 0x1E3A8A;
  } else if (outfit === 'team_gold') {
    shirtColor = 0xF59E0B;
    collarColor = 0xD97706;
    pantColor = 0x1E293B;
  } else if (outfit === 'ops_suit') {
    shirtColor = 0x0F172A;
    collarColor = 0x1E293B;
    pantColor = 0x090D16;
  }

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.62,
    metalness: 0.04,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.45,
    metalness: 0.08,
  });

  const hairHighlightMat = new THREE.MeshStandardMaterial({
    color: hairHighlightColor,
    roughness: 0.4,
    metalness: 0.1,
  });

  const eyebrowMat = new THREE.MeshStandardMaterial({
    color: eyebrowColor,
    roughness: 0.6,
  });

  const eyeScleraMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.15,
    metalness: 0.02,
  });

  const eyeIrisMat = new THREE.MeshStandardMaterial({
    color: eyeIrisColor,
    roughness: 0.12,
    metalness: 0.05,
  });

  const eyePupilMat = new THREE.MeshBasicMaterial({
    color: eyePupilColor,
  });

  const catchlightMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
  });

  const mouthMat = new THREE.MeshBasicMaterial({
    color: 0x993D33,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: shirtColor,
    roughness: 0.85,
    metalness: 0.02,
  });

  const collarMat = new THREE.MeshStandardMaterial({
    color: collarColor,
    roughness: 0.8,
    metalness: 0.02,
  });

  const buttonMat = new THREE.MeshStandardMaterial({
    color: 0xF8FAFC,
    roughness: 0.3,
    metalness: 0.4,
  });

  const innerShirtMat = new THREE.MeshStandardMaterial({
    color: innerShirtRed,
    roughness: 0.85,
  });

  const pantMat = new THREE.MeshStandardMaterial({
    color: pantColor,
    roughness: 0.75,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.4,
  });

  // 2. TORSO & COLLARED POLO SHIRT
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'TorsoGroup';

  // Main chest & stomach (athletic tapered capsule/cylinder)
  const chestGeo = new THREE.CylinderGeometry(0.52, 0.44, 1.15, 16);
  const chestMesh = new THREE.Mesh(chestGeo, shirtMat);
  chestMesh.position.y = 1.35;
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  torsoGroup.add(chestMesh);

  // Red inner crewneck collar peek
  const innerCrewGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.22, 16);
  const innerCrewMesh = new THREE.Mesh(innerCrewGeo, innerShirtMat);
  innerCrewMesh.position.set(0, 1.95, 0.02);
  torsoGroup.add(innerCrewMesh);

  // Folded Polo Collar Lapels (left and right wings)
  const collarWingShape = new THREE.Shape();
  collarWingShape.moveTo(0, 0);
  collarWingShape.lineTo(0.35, -0.4);
  collarWingShape.lineTo(0.18, -0.45);
  collarWingShape.lineTo(-0.05, -0.05);
  collarWingShape.closePath();

  const collarExtrudeSettings = { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
  const collarGeo = new THREE.ExtrudeGeometry(collarWingShape, collarExtrudeSettings);

  // Left collar flap
  const leftCollar = new THREE.Mesh(collarGeo, collarMat);
  leftCollar.position.set(0.04, 1.96, 0.32);
  leftCollar.rotation.set(-0.35, 0.35, -0.3);
  leftCollar.castShadow = true;

  // Right collar flap
  const rightCollar = new THREE.Mesh(collarGeo, collarMat);
  rightCollar.position.set(-0.04, 1.96, 0.32);
  rightCollar.rotation.set(-0.35, -0.35, 0.3);
  rightCollar.scale.set(-1, 1, 1);
  rightCollar.castShadow = true;

  torsoGroup.add(leftCollar, rightCollar);

  // Collar back neck band
  const neckBandGeo = new THREE.TorusGeometry(0.26, 0.06, 8, 24, Math.PI * 1.3);
  neckBandGeo.rotateX(Math.PI / 2);
  const neckBand = new THREE.Mesh(neckBandGeo, collarMat);
  neckBand.position.set(0, 2.0, -0.02);
  torsoGroup.add(neckBand);

  // Front Placket strip
  const placketGeo = new THREE.BoxGeometry(0.12, 0.48, 0.04);
  const placket = new THREE.Mesh(placketGeo, collarMat);
  placket.position.set(0, 1.68, 0.51);
  torsoGroup.add(placket);

  // Buttons on placket (2 white buttons as in image)
  const buttonGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.02, 10);
  buttonGeo.rotateX(Math.PI / 2);
  const btn1 = new THREE.Mesh(buttonGeo, buttonMat);
  btn1.position.set(0, 1.76, 0.535);
  const btn2 = new THREE.Mesh(buttonGeo, buttonMat);
  btn2.position.set(0, 1.58, 0.535);
  torsoGroup.add(btn1, btn2);

  // 3. HEAD & NECK
  const headGroup = new THREE.Group();
  headGroup.name = 'HeadGroup';
  headGroup.position.set(0, 2.08, 0);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.21, 0.23, 0.38, 16);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.y = 0.08;
  neckMesh.castShadow = true;
  headGroup.add(neckMesh);

  // Contoured Head (base sphere + jaw and chin expansion)
  const craniumGeo = new THREE.SphereGeometry(0.56, 24, 24);
  craniumGeo.scale(1.0, 1.08, 1.02);
  const headMesh = new THREE.Mesh(craniumGeo, skinMat);
  headMesh.position.set(0, 0.62, 0);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Cheeks / Jaw warmth contour
  const jawGeo = new THREE.SphereGeometry(0.42, 16, 16);
  jawGeo.scale(1.08, 0.85, 0.95);
  const jawMesh = new THREE.Mesh(jawGeo, skinMat);
  jawMesh.position.set(0, 0.44, 0.12);
  headGroup.add(jawMesh);

  // Rosy cheeks subtle blush
  const blushGeo = new THREE.SphereGeometry(0.14, 12, 12);
  blushGeo.scale(1.2, 0.6, 0.4);
  const blushMat = new THREE.MeshStandardMaterial({
    color: 0xF29B85,
    roughness: 0.8,
    transparent: true,
    opacity: 0.45,
  });
  const leftBlush = new THREE.Mesh(blushGeo, blushMat);
  leftBlush.position.set(0.34, 0.5, 0.44);
  leftBlush.rotation.y = 0.35;
  const rightBlush = new THREE.Mesh(blushGeo, blushMat);
  rightBlush.position.set(-0.34, 0.5, 0.44);
  rightBlush.rotation.y = -0.35;
  headGroup.add(leftBlush, rightBlush);

  // Cute Button Nose
  const noseGeo = new THREE.SphereGeometry(0.09, 14, 14);
  noseGeo.scale(1.08, 0.9, 1.15);
  const noseMesh = new THREE.Mesh(noseGeo, skinMat);
  noseMesh.position.set(0, 0.55, 0.56);
  headGroup.add(noseMesh);

  // Friendly curved smile (subtle tube curve)
  const smileCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.16, 0.39, 0.5),
    new THREE.Vector3(0.0, 0.34, 0.53),
    new THREE.Vector3(0.16, 0.39, 0.5)
  );
  const smileGeo = new THREE.TubeGeometry(smileCurve, 16, 0.016, 8, false);
  const smileMesh = new THREE.Mesh(smileGeo, mouthMat);
  headGroup.add(smileMesh);

  // 4. BIG PIXAR EYES (LEFT & RIGHT)
  const leftEyeGroup = new THREE.Group();
  leftEyeGroup.name = 'LeftEye';
  leftEyeGroup.position.set(0.18, 0.65, 0.46);

  const rightEyeGroup = new THREE.Group();
  rightEyeGroup.name = 'RightEye';
  rightEyeGroup.position.set(-0.18, 0.65, 0.46);

  [leftEyeGroup, rightEyeGroup].forEach((eyeG, idx) => {
    // Sclera (White of eye)
    const scleraGeo = new THREE.SphereGeometry(0.13, 20, 20);
    const sclera = new THREE.Mesh(scleraGeo, eyeScleraMat);
    sclera.scale.set(1.0, 1.15, 0.9);
    eyeG.add(sclera);

    // Large Dark Brown Iris
    const irisGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.03, 20);
    irisGeo.rotateX(Math.PI / 2);
    const iris = new THREE.Mesh(irisGeo, eyeIrisMat);
    iris.position.set(0, 0, 0.11);
    eyeG.add(iris);

    // Black Pupil
    const pupilGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.032, 16);
    pupilGeo.rotateX(Math.PI / 2);
    const pupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupil.position.set(0, 0, 0.112);
    eyeG.add(pupil);

    // Primary Catchlight / Specular gleam (top-left)
    const catch1Geo = new THREE.SphereGeometry(0.024, 10, 10);
    const catch1 = new THREE.Mesh(catch1Geo, catchlightMat);
    catch1.position.set(-0.026, 0.032, 0.124);
    eyeG.add(catch1);

    // Secondary subtle Catchlight (bottom-right)
    const catch2Geo = new THREE.SphereGeometry(0.012, 8, 8);
    const catch2 = new THREE.Mesh(catch2Geo, catchlightMat);
    catch2.position.set(0.028, -0.024, 0.124);
    eyeG.add(catch2);

    headGroup.add(eyeG);
  });

  // Soft upper eyelids / eye contour sockets
  const eyelidGeo = new THREE.TorusGeometry(0.12, 0.022, 8, 16, Math.PI);
  eyelidGeo.rotateZ(Math.PI);
  const leftEyelid = new THREE.Mesh(eyelidGeo, skinMat);
  leftEyelid.position.set(0.18, 0.76, 0.48);
  const rightEyelid = new THREE.Mesh(eyelidGeo, skinMat);
  rightEyelid.position.set(-0.18, 0.76, 0.48);
  headGroup.add(leftEyelid, rightEyelid);

  // Expressive curved Eyebrows (thick, dark brown as in image)
  const eyebrowCurveL = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.06, 0.81, 0.48),
    new THREE.Vector3(0.2, 0.86, 0.49),
    new THREE.Vector3(0.35, 0.79, 0.44)
  );
  const eyebrowGeoL = new THREE.TubeGeometry(eyebrowCurveL, 12, 0.032, 8, false);
  const leftEyebrow = new THREE.Mesh(eyebrowGeoL, eyebrowMat);

  const eyebrowCurveR = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.06, 0.81, 0.48),
    new THREE.Vector3(-0.2, 0.86, 0.49),
    new THREE.Vector3(-0.35, 0.79, 0.44)
  );
  const eyebrowGeoR = new THREE.TubeGeometry(eyebrowCurveR, 12, 0.032, 8, false);
  const rightEyebrow = new THREE.Mesh(eyebrowGeoR, eyebrowMat);

  headGroup.add(leftEyebrow, rightEyebrow);

  // 5. FRIENDLY EARS (LEFT & RIGHT)
  const earShape = new THREE.Shape();
  earShape.moveTo(0, 0);
  earShape.quadraticCurveTo(0.18, 0.12, 0.16, 0.28);
  earShape.quadraticCurveTo(0.12, 0.38, 0.02, 0.4);
  earShape.quadraticCurveTo(-0.08, 0.36, -0.06, 0.14);
  earShape.quadraticCurveTo(-0.04, 0.02, 0, 0);

  const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(0.53, 0.48, 0);
  leftEar.rotation.set(0.1, -0.2, -0.15);
  leftEar.scale.set(0.75, 0.75, 0.75);

  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(-0.53, 0.48, 0);
  rightEar.rotation.set(0.1, 0.2, 0.15);
  rightEar.scale.set(-0.75, 0.75, 0.75);

  headGroup.add(leftEar, rightEar);

  // 6. SCULPTED VOLUMINOUS HAIR (COMPOSITE OF 10 STYLIZED CHUNKS)
  const hairGroup = new THREE.Group();
  hairGroup.name = 'HairGroup';

  // Base crown cap
  const skullcapGeo = new THREE.SphereGeometry(0.58, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.65);
  skullcapGeo.scale(1.03, 1.05, 1.04);
  const skullcap = new THREE.Mesh(skullcapGeo, hairMat);
  skullcap.position.set(0, 0.66, -0.02);
  hairGroup.add(skullcap);

  // Helper to create stylized curved hair locks
  const createHairLock = (
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3,
    radius: number,
    mat: THREE.Material = hairMat
  ) => {
    const curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);
    const geo = new THREE.TubeGeometry(curve, 16, radius, 8, false);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  };

  // Lock 1: Big signature front swoop sweeping from left side across forehead to the right
  const frontSwoop1 = createHairLock(
    new THREE.Vector3(-0.35, 0.95, 0.22),
    new THREE.Vector3(-0.05, 1.18, 0.48),
    new THREE.Vector3(0.38, 0.98, 0.42),
    0.11,
    hairHighlightMat
  );
  hairGroup.add(frontSwoop1);

  // Lock 2: Secondary front swoop underneath
  const frontSwoop2 = createHairLock(
    new THREE.Vector3(-0.25, 0.88, 0.36),
    new THREE.Vector3(0.08, 1.05, 0.52),
    new THREE.Vector3(0.42, 0.86, 0.38),
    0.09
  );
  hairGroup.add(frontSwoop2);

  // Lock 3: Left side parted fringe
  const leftFringe = createHairLock(
    new THREE.Vector3(-0.15, 1.05, 0.35),
    new THREE.Vector3(-0.42, 1.08, 0.32),
    new THREE.Vector3(-0.52, 0.82, 0.25),
    0.095
  );
  hairGroup.add(leftFringe);

  // Lock 4: Signature Top Cowlick / Crest Tuft pointing playfully up and back
  const crestTuft = createHairLock(
    new THREE.Vector3(-0.06, 1.12, 0.15),
    new THREE.Vector3(0.04, 1.35, 0.08),
    new THREE.Vector3(-0.08, 1.28, -0.05),
    0.085,
    hairHighlightMat
  );
  hairGroup.add(crestTuft);

  // Lock 5: Crown top volume lock right
  const crownRight = createHairLock(
    new THREE.Vector3(0.12, 1.15, 0.18),
    new THREE.Vector3(0.42, 1.18, 0.12),
    new THREE.Vector3(0.55, 0.92, -0.05),
    0.09
  );
  hairGroup.add(crownRight);

  // Lock 6: Right sideburn lock in front of ear
  const rightSideburn = createHairLock(
    new THREE.Vector3(0.46, 0.85, 0.18),
    new THREE.Vector3(0.49, 0.65, 0.22),
    new THREE.Vector3(0.44, 0.48, 0.18),
    0.055
  );
  hairGroup.add(rightSideburn);

  // Lock 7: Left sideburn lock in front of ear
  const leftSideburn = createHairLock(
    new THREE.Vector3(-0.46, 0.85, 0.18),
    new THREE.Vector3(-0.49, 0.65, 0.22),
    new THREE.Vector3(-0.44, 0.48, 0.18),
    0.055
  );
  hairGroup.add(leftSideburn);

  // Lock 8 & 9: Back hair tapered volume
  const backTaper1 = createHairLock(
    new THREE.Vector3(-0.25, 0.95, -0.42),
    new THREE.Vector3(-0.15, 0.62, -0.56),
    new THREE.Vector3(-0.05, 0.42, -0.42),
    0.1
  );
  const backTaper2 = createHairLock(
    new THREE.Vector3(0.25, 0.95, -0.42),
    new THREE.Vector3(0.15, 0.62, -0.56),
    new THREE.Vector3(0.05, 0.42, -0.42),
    0.1
  );
  hairGroup.add(backTaper1, backTaper2);

  headGroup.add(hairGroup);
  rootGroup.add(headGroup);

  // 7. ARMS & HANDS
  // Left Arm Group
  const leftArm = new THREE.Group();
  leftArm.name = 'LeftArm';
  leftArm.position.set(0.54, 1.82, 0);

  // Sleeve with cuffed rim
  const sleeveGeo = new THREE.CylinderGeometry(0.16, 0.15, 0.42, 14);
  const leftSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  leftSleeve.position.set(0.1, -0.16, 0);
  leftSleeve.rotation.z = -0.32;
  leftSleeve.castShadow = true;

  // Sleeve cuff rim
  const cuffGeo = new THREE.TorusGeometry(0.155, 0.024, 8, 16);
  cuffGeo.rotateX(Math.PI / 2);
  const leftCuff = new THREE.Mesh(cuffGeo, collarMat);
  leftCuff.position.set(0.15, -0.34, 0);
  leftCuff.rotation.z = -0.32;
  leftArm.add(leftSleeve, leftCuff);

  // Forearm & Hand
  const armGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.52, 12);
  const leftForearm = new THREE.Mesh(armGeo, skinMat);
  leftForearm.position.set(0.22, -0.55, 0.05);
  leftForearm.rotation.z = -0.22;
  leftForearm.castShadow = true;

  const handGeo = new THREE.SphereGeometry(0.11, 10, 10);
  handGeo.scale(1.1, 1.2, 0.8);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(0.28, -0.82, 0.08);
  leftArm.add(leftForearm, leftHand);

  torsoGroup.add(leftArm);

  // Right Arm Group
  const rightArm = new THREE.Group();
  rightArm.name = 'RightArm';
  rightArm.position.set(-0.54, 1.82, 0);

  const rightSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  rightSleeve.position.set(-0.1, -0.16, 0);
  rightSleeve.rotation.z = 0.32;
  rightSleeve.castShadow = true;

  const rightCuff = new THREE.Mesh(cuffGeo, collarMat);
  rightCuff.position.set(-0.15, -0.34, 0);
  rightCuff.rotation.z = 0.32;
  rightArm.add(rightSleeve, rightCuff);

  const rightForearm = new THREE.Mesh(armGeo, skinMat);
  rightForearm.position.set(-0.22, -0.55, 0.05);
  rightForearm.rotation.z = 0.22;
  rightForearm.castShadow = true;

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(-0.28, -0.82, 0.08);
  rightArm.add(rightForearm, rightHand);

  torsoGroup.add(rightArm);

  // 8. OPTIONAL LEGS & CRICKET CLEATS WITH ARTICULATED HIP JOINTS
  let leftLegGroup: THREE.Group | undefined;
  let rightLegGroup: THREE.Group | undefined;

  if (includeLegs) {
    const legsGroup = new THREE.Group();
    legsGroup.name = 'LegsGroup';

    const legGeo = new THREE.CylinderGeometry(0.18, 0.15, 1.15, 12);
    const shoeGeo = new THREE.BoxGeometry(0.24, 0.18, 0.52);

    // Left Hip Joint Group
    leftLegGroup = new THREE.Group();
    leftLegGroup.name = 'LeftLegGroup';
    leftLegGroup.position.set(0.24, 1.15, 0);

    const leftLeg = new THREE.Mesh(legGeo, pantMat);
    leftLeg.position.set(0, -0.53, 0);
    leftLeg.castShadow = true;

    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -1.06, 0.08);
    leftShoe.castShadow = true;
    leftLegGroup.add(leftLeg, leftShoe);

    // Right Hip Joint Group
    rightLegGroup = new THREE.Group();
    rightLegGroup.name = 'RightLegGroup';
    rightLegGroup.position.set(-0.24, 1.15, 0);

    const rightLeg = new THREE.Mesh(legGeo, pantMat);
    rightLeg.position.set(0, -0.53, 0);
    rightLeg.castShadow = true;

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -1.06, 0.08);
    rightShoe.castShadow = true;
    rightLegGroup.add(rightLeg, rightShoe);

    legsGroup.add(leftLegGroup, rightLegGroup);
    torsoGroup.add(legsGroup);
  }

  // 9. CRICKET BAT ACCESSORY (IF REQUESTED)
  let batMesh: THREE.Mesh | undefined;
  if (holdingBat) {
    const batGroup = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.22, 1.15, 0.09);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xD7B899, roughness: 0.65 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.55;
    blade.castShadow = true;

    const handleGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.52, 10);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x1E5EFF, roughness: 0.4 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 1.25;

    batGroup.add(blade, handle);
    batGroup.position.set(0.38, 0.2, 0.35);
    batGroup.rotation.set(0.3, 0.2, -0.4);
    torsoGroup.add(batGroup);
    batMesh = blade;
  }

  rootGroup.add(torsoGroup);
  rootGroup.scale.set(scale, scale, scale);

  // Emote state variables
  let timedEmote: AvatarEmote | null = null;
  let emoteEndTime = 0;

  // Return animated controller instance
  return {
    group: rootGroup,
    headGroup,
    leftEyeGroup,
    rightEyeGroup,
    leftArm,
    rightArm,
    leftLegGroup,
    rightLegGroup,
    batMesh,
    blink: (isBlinking: boolean) => {
      const scaleY = isBlinking ? 0.08 : 1.0;
      leftEyeGroup.scale.y = scaleY;
      rightEyeGroup.scale.y = scaleY;
    },
    lookAtTarget: (target: THREE.Vector3) => {
      const localTarget = target.clone();
      headGroup.worldToLocal(localTarget);
      leftEyeGroup.lookAt(localTarget);
      rightEyeGroup.lookAt(localTarget);
    },
    triggerEmote: (emote: AvatarEmote, durationMs = 3500) => {
      timedEmote = emote;
      emoteEndTime = performance.now() + durationMs;
    },
    getActiveEmote: () => {
      if (timedEmote && performance.now() < emoteEndTime) {
        return timedEmote;
      }
      return 'idle';
    },
    updateAnimation: (time: number, action?: AvatarEmote) => {
      // Determine effective emote action
      let currentAction: AvatarEmote = 'idle';
      if (timedEmote && performance.now() < emoteEndTime) {
        currentAction = timedEmote;
      } else {
        timedEmote = null;
        currentAction = action || 'idle';
      }

      // Base breathing idle
      const breath = Math.sin(time * 2.2) * 0.015;
      torsoGroup.position.y = breath;
      headGroup.position.y = 2.08 + breath * 0.8;
      torsoGroup.rotation.set(0, 0, 0);

      // Natural eye blinking every ~4 seconds
      const blinkCycle = time % 4.2;
      const isBlinking = blinkCycle > 4.05 && blinkCycle < 4.18;
      leftEyeGroup.scale.y = isBlinking ? 0.08 : 1.0;
      rightEyeGroup.scale.y = isBlinking ? 0.08 : 1.0;

      // Reset head tilt defaults
      headGroup.rotation.set(
        Math.sin(time * 1.1) * 0.02,
        Math.sin(time * 0.8) * 0.06,
        Math.cos(time * 1.1) * 0.03
      );

      // Reset legs
      if (leftLegGroup && rightLegGroup) {
        leftLegGroup.rotation.set(0, 0, 0);
        rightLegGroup.rotation.set(0, 0, 0);
      }

      // KINEMATICS PER EMOTE
      switch (currentAction) {
        case 'cheer':
        case 'cheering': {
          // Both arms raised high, pumping the air with joyful jumps!
          const jumpBounce = Math.abs(Math.sin(time * 8)) * 0.22;
          torsoGroup.position.y = breath + jumpBounce;
          leftArm.rotation.set(0.15, 0.1, 2.45 + Math.sin(time * 8) * 0.35);
          rightArm.rotation.set(0.15, -0.1, -2.45 - Math.sin(time * 8) * 0.35);
          headGroup.rotation.x = -0.18 + Math.sin(time * 8) * 0.08;
          headGroup.rotation.y = Math.sin(time * 4) * 0.12;
          break;
        }

        case 'clap': {
          // Arms brought in front of chest, hands clapping rhythmically
          const clapPhase = Math.sin(time * 14);
          leftArm.rotation.set(-0.75, -0.65 + clapPhase * 0.32, 0.45);
          rightArm.rotation.set(-0.75, 0.65 - clapPhase * 0.32, -0.45);
          headGroup.rotation.x = clapPhase * 0.06;
          break;
        }

        case 'walk':
        case 'running': {
          // Confident batsman stride or bowler run with alternating leg and arm swing
          const speedMultiplier = currentAction === 'running' ? 1.5 : 1.0;
          const strideCycle = Math.sin(time * 6 * speedMultiplier);
          if (leftLegGroup && rightLegGroup) {
            leftLegGroup.rotation.x = strideCycle * 0.55;
            rightLegGroup.rotation.x = -strideCycle * 0.55;
          }
          leftArm.rotation.set(-strideCycle * 0.5, 0, 0.08);
          rightArm.rotation.set(strideCycle * 0.5, 0, -0.08);
          torsoGroup.position.y = Math.abs(strideCycle) * 0.08;
          headGroup.rotation.y = Math.sin(time * 3) * 0.08;
          break;
        }

        case 'wave': {
          // Right arm raised high in friendly wave to the crowd
          const waveSwing = Math.sin(time * 9);
          rightArm.rotation.set(0, Math.cos(time * 9) * 0.28, -2.4 + waveSwing * 0.35);
          leftArm.rotation.set(0, 0, 0.1);
          headGroup.rotation.z = -0.14 + Math.sin(time * 4) * 0.04;
          headGroup.rotation.y = 0.12;
          break;
        }

        case 'flex': {
          // Champion bicep muscle flex
          leftArm.rotation.set(0, -0.4, 1.85 + Math.sin(time * 4) * 0.08);
          rightArm.rotation.set(0, 0.4, -1.85 - Math.sin(time * 4) * 0.08);
          headGroup.rotation.x = -0.15;
          break;
        }

        case 'bow': {
          // Respectful gentleman's cap bow
          torsoGroup.rotation.x = 0.32;
          rightArm.rotation.set(-1.0, 0.65, -0.45);
          leftArm.rotation.set(0, 0, 0.1);
          headGroup.rotation.x = 0.25;
          break;
        }

        case 'batting': {
          // Professional ready stance & bat swing
          leftArm.rotation.set(-0.8, 0.4, -0.4 + Math.sin(time * 3) * 0.2);
          rightArm.rotation.set(-0.9, -0.4, 0.4 - Math.sin(time * 3) * 0.2);
          if (leftLegGroup && rightLegGroup) {
            leftLegGroup.rotation.x = 0.12;
            rightLegGroup.rotation.x = -0.12;
          }
          break;
        }

        case 'idle':
        default: {
          leftArm.rotation.set(0, 0, Math.sin(time * 1.5) * 0.04);
          rightArm.rotation.set(0, 0, -Math.sin(time * 1.5) * 0.04);
          break;
        }
      }
    },
    setOutfit: (newOutfit) => {
      let sc = 0xF48FB1;
      let cc = 0xF06292;
      let pc = 0x334155;

      if (newOutfit === 'team_blue') {
        sc = 0x1E5EFF;
        cc = 0x184FD9;
        pc = 0x1E3A8A;
      } else if (newOutfit === 'team_gold') {
        sc = 0xF59E0B;
        cc = 0xD77706;
        pc = 0x1E293B;
      } else if (newOutfit === 'ops_suit') {
        sc = 0x0F172A;
        cc = 0x1E293B;
        pc = 0x090D16;
      }

      shirtMat.color.setHex(sc);
      collarMat.color.setHex(cc);
      pantMat.color.setHex(pc);
    },
  };
}
