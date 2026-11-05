import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraArea, CricketMatchState, GateData, SelectedEntity, StallData, WeatherType } from '../../types/stadium';
import { audioEngine } from '../AudioEngine';
import { CrowdSystem } from './CrowdSystem';
import { MatchSimulator } from './MatchSimulator';
import { buildStadiumWorld, StadiumMaterials } from './StadiumBuilder';
import { AvatarEmote } from './PixarCharacterBuilder';

interface StadiumCanvasProps {
  weather: WeatherType;
  activeArea: CameraArea;
  gates: GateData[];
  stalls: StallData[];
  onSelectEntity: (entity: SelectedEntity) => void;
  onScoreUpdate: (state: CricketMatchState) => void;
  selectedEntityId?: string;
  avatarOutfit?: 'pink_polo' | 'team_blue' | 'team_gold' | 'ops_suit';
  activeAvatarEmote?: { emote: AvatarEmote; timestamp: number } | null;
}

export const StadiumCanvas: React.FC<StadiumCanvasProps> = ({
  weather,
  activeArea,
  gates,
  stalls,
  onSelectEntity,
  onScoreUpdate,
  selectedEntityId,
  avatarOutfit,
  activeAvatarEmote,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    matchSim?: MatchSimulator;
    crowd?: CrowdSystem;
    pitchCoverGroup?: THREE.Group;
    floodlightTowers?: { group: THREE.Group; spotLight: THREE.SpotLight; bulbs: THREE.Mesh[] }[];
    selectionRing?: THREE.Mesh;
    selectionRingInner?: THREE.Mesh;
    cameraTarget: THREE.Vector3;
    cameraPosTarget: THREE.Vector3;
    isTransitioning: boolean;
    weatherPreset: WeatherType;
    dirLight?: THREE.DirectionalLight;
    hemiLight?: THREE.HemisphereLight;
    scene?: THREE.Scene;
    rainParticles?: THREE.Points;
  }>({
    cameraTarget: new THREE.Vector3(0, 0, 0),
    cameraPosTarget: new THREE.Vector3(95, 115, 145),
    isTransitioning: false,
    weatherPreset: weather,
  });

  const callbacksRef = useRef({ onSelectEntity, onScoreUpdate });
  useEffect(() => {
    callbacksRef.current = { onSelectEntity, onScoreUpdate };
  });

  // Handle Camera Area glide
  useEffect(() => {
    const s = sceneRef.current;
    s.isTransitioning = true;
    switch (activeArea) {
      case 'field':
        s.cameraTarget.set(0, 1.2, 0);
        s.cameraPosTarget.set(0, 22, 54);
        break;
      case 'stands':
        s.cameraTarget.set(0, 14, -50);
        s.cameraPosTarget.set(0, 42, -95);
        break;
      case 'gates':
        s.cameraTarget.set(0, 3, 90);
        s.cameraPosTarget.set(40, 32, 130);
        break;
      case 'parking':
        s.cameraTarget.set(-130, 2, 0);
        s.cameraPosTarget.set(-175, 42, 45);
        break;
      case 'metro':
        s.cameraTarget.set(130, 2, 0);
        s.cameraPosTarget.set(175, 42, -45);
        break;
      case 'all':
      default:
        s.cameraTarget.set(0, 0, 0);
        s.cameraPosTarget.set(95, 115, 145);
        break;
    }
  }, [activeArea]);

  // Handle Weather change
  useEffect(() => {
    const s = sceneRef.current;
    s.weatherPreset = weather;

    if (s.matchSim) {
      s.matchSim.matchState.isPausedForRain = weather === 'rain';
      s.matchSim.renderScoreboard();
    }
    if (s.pitchCoverGroup) {
      s.pitchCoverGroup.visible = weather === 'rain';
    }

    audioEngine.toggleRainSound(weather === 'rain');

    if (s.dirLight && s.hemiLight && s.scene && s.floodlightTowers) {
      const fog = s.scene.fog as THREE.Fog;
      if (weather === 'night') {
        s.scene.background = new THREE.Color(0x070B14);
        if (fog) { fog.color.set(0x070B14); fog.near = 120; fog.far = 420; }
        s.dirLight.intensity = 0.2;
        s.dirLight.color.set(0x4361EE);
        s.hemiLight.intensity = 0.35;
        s.hemiLight.color.set(0x1E293B);
        s.hemiLight.groundColor.set(0x0F172A);

        // Power up 4 floodlight towers in sequence
        s.floodlightTowers.forEach((tower, idx) => {
          setTimeout(() => {
            tower.spotLight.intensity = 4.2;
            tower.bulbs.forEach((b) => {
              (b.material as THREE.MeshStandardMaterial).emissive.set(0xFFFFFF);
              (b.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.5;
            });
          }, idx * 280);
        });
      } else if (weather === 'dew') {
        s.scene.background = new THREE.Color(0xFDE68A);
        if (fog) { fog.color.set(0xFDE68A); fog.near = 140; fog.far = 460; }
        s.dirLight.intensity = 1.9;
        s.dirLight.color.set(0xFBBF24);
        s.hemiLight.intensity = 0.8;
        s.hemiLight.color.set(0xFED7AA);
        s.hemiLight.groundColor.set(0xCBD5E1);

        s.floodlightTowers.forEach((tower) => {
          tower.spotLight.intensity = 1.2;
          tower.bulbs.forEach((b) => {
            (b.material as THREE.MeshStandardMaterial).emissive.set(0xFFD6A5);
            (b.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
          });
        });
      } else if (weather === 'rain') {
        s.scene.background = new THREE.Color(0x64748B);
        if (fog) { fog.color.set(0x64748B); fog.near = 90; fog.far = 320; }
        s.dirLight.intensity = 0.7;
        s.dirLight.color.set(0x94A3B8);
        s.hemiLight.intensity = 0.6;
        s.hemiLight.color.set(0x64748B);
        s.hemiLight.groundColor.set(0x334155);

        s.floodlightTowers.forEach((tower) => {
          tower.spotLight.intensity = 1.8;
          tower.bulbs.forEach((b) => {
            (b.material as THREE.MeshStandardMaterial).emissive.set(0xFFFFFF);
            (b.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2;
          });
        });
      } else {
        // Clear daylight
        s.scene.background = new THREE.Color(0xE2E8F0);
        if (fog) { fog.color.set(0xE2E8F0); fog.near = 150; fog.far = 480; }
        s.dirLight.intensity = 2.4;
        s.dirLight.color.set(0xFFFAF0);
        s.hemiLight.intensity = 0.9;
        s.hemiLight.color.set(0xF1F5F9);
        s.hemiLight.groundColor.set(0xE2E8F0);

        s.floodlightTowers.forEach((tower) => {
          tower.spotLight.intensity = 0;
          tower.bulbs.forEach((b) => {
            (b.material as THREE.MeshStandardMaterial).emissive.set(0x000000);
            (b.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
          });
        });
      }
    }
  }, [weather]);

  // Update queues in crowd system when props change
  useEffect(() => {
    if (sceneRef.current.crowd) {
      sceneRef.current.crowd.updateQueues(gates, stalls);
    }
  }, [gates, stalls]);

  // Update Batter character outfit when user customizes
  useEffect(() => {
    if (sceneRef.current.matchSim && avatarOutfit) {
      sceneRef.current.matchSim.setBatterOutfit(avatarOutfit);
    }
  }, [avatarOutfit]);

  // Trigger short emotes for 3D avatar in stadium view
  useEffect(() => {
    if (activeAvatarEmote && sceneRef.current.matchSim) {
      sceneRef.current.matchSim.triggerPlayerEmote(activeAvatarEmote.emote);

      // Highlight batter at crease with 3D selection ring
      if (sceneRef.current.selectionRing) {
        sceneRef.current.selectionRing.position.set(0, 0.72, 8.8);
        sceneRef.current.selectionRing.scale.set(2.0, 2.0, 2.0);
      }
    }
  }, [activeAvatarEmote]);

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE2E8F0);
    scene.fog = new THREE.Fog(0xE2E8F0, 150, 480);
    sceneRef.current.scene = scene;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 1000);
    camera.position.set(95, 115, 145);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Environment Map (PMREM + RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xF8FAFC, 0xCBD5E1, 0.9);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);
    sceneRef.current.hemiLight = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xFFFBEB, 2.4);
    dirLight.position.set(90, 140, 80);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 20;
    dirLight.shadow.camera.far = 320;
    const d = 135;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0004;
    dirLight.shadow.normalBias = 0.02;
    scene.add(dirLight);
    sceneRef.current.dirLight = dirLight;

    // 4. OrbitControls with smooth damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // don't go below horizon
    controls.minDistance = 15;
    controls.maxDistance = 340;
    controls.target.set(0, 0, 0);

    // Cancel automated camera transition when user drags
    controls.addEventListener('start', () => {
      sceneRef.current.isTransitioning = false;
    });

    // 5. Build Stadium World
    const materials = new StadiumMaterials();
    const stadium = buildStadiumWorld(materials, gates, stalls);
    scene.add(stadium.rootGroup);
    sceneRef.current.pitchCoverGroup = stadium.pitchCoverGroup;
    sceneRef.current.floodlightTowers = stadium.floodlightTowers;

    // 6. Build Crowd System
    const crowd = new CrowdSystem(stadium.rootGroup, 66, 58);
    crowd.updateQueues(gates, stalls);
    sceneRef.current.crowd = crowd;

    // 7. Match Simulator on Pitch
    const matchSim = new MatchSimulator(
      stadium.rootGroup,
      crowd,
      stadium.scoreboardCanvas,
      stadium.scoreboardTexture
    );
    matchSim.onScoreUpdate = (state) => {
      callbacksRef.current.onScoreUpdate(state);
    };
    sceneRef.current.matchSim = matchSim;

    // 8. 3D Selection Ring Marker
    const ringGeo = new THREE.RingGeometry(3.5, 4.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1E5EFF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.position.set(0, -100, 0); // start hidden

    const innerPulseGeo = new THREE.RingGeometry(0.2, 3.2, 32);
    innerPulseGeo.rotateX(-Math.PI / 2);
    const innerPulseMat = new THREE.MeshBasicMaterial({
      color: 0x60A5FA,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const selectionRingInner = new THREE.Mesh(innerPulseGeo, innerPulseMat);
    selectionRing.add(selectionRingInner);

    scene.add(selectionRing);
    sceneRef.current.selectionRing = selectionRing;
    sceneRef.current.selectionRingInner = selectionRingInner;

    // 9. Rain Particle System
    const rainCount = 1800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 260;
      rainPositions[i * 3 + 1] = Math.random() * 80;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 260;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0xBAE6FD,
      size: 0.45,
      transparent: true,
      opacity: 0.7,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.visible = weather === 'rain';
    scene.add(rainParticles);
    sceneRef.current.rainParticles = rainParticles;

    // 10. Moving Perimeter Traffic Loop
    const movingCars: { mesh: THREE.Group; angle: number; speed: number; laneR: number }[] = [];
    const roadCars = [
      { color: 0x1E5EFF, speed: 0.35, laneR: 135 },
      { color: 0xEF4444, speed: 0.28, laneR: 135 },
      { color: 0xF59E0B, speed: 0.32, laneR: 145 },
      { color: 0x10B981, speed: 0.25, laneR: 145 },
      { color: 0xFFFFFF, speed: 0.38, laneR: 135 },
    ];
    roadCars.forEach((rc, i) => {
      const carGroup = new THREE.Group();
      const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 4.2), new THREE.MeshStandardMaterial({ color: rc.color, roughness: 0.4 }));
      carBody.position.y = 0.55;
      carBody.castShadow = true;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.65, 2.2), new THREE.MeshStandardMaterial({ color: 0x0F172A }));
      cabin.position.set(0, 1.2, -0.2);
      carGroup.add(carBody, cabin);

      const angle = (i / roadCars.length) * Math.PI * 2;
      carGroup.position.set(Math.cos(angle) * rc.laneR, 0.25, Math.sin(angle) * rc.laneR);
      scene.add(carGroup);
      movingCars.push({ mesh: carGroup, angle, speed: rc.speed, laneR: rc.laneR });
    });

    // 11. Raycasting for Click Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      // Ignore if user was dragging to pan/rotate
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(stadium.interactiveObjects, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.id && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData?.id) {
          const u = hitObj.userData;
          audioEngine.playTurnstile();

          // Move selection ring
          if (sceneRef.current.selectionRing) {
            sceneRef.current.selectionRing.position.set(u.position[0], 0.72, u.position[2]);
            if (u.type === 'pitch') {
              sceneRef.current.selectionRing.scale.set(3.5, 3.5, 3.5);
            } else if (u.type === 'stands') {
              sceneRef.current.selectionRing.scale.set(6, 6, 6);
            } else {
              sceneRef.current.selectionRing.scale.set(1.5, 1.5, 1.5);
            }
          }

          // Camera glide towards object
          sceneRef.current.cameraTarget.set(u.position[0], 2, u.position[2]);
          sceneRef.current.cameraPosTarget.set(
            u.position[0] + 28,
            Math.max(22, u.position[1] + 26),
            u.position[2] + 42
          );
          sceneRef.current.isTransitioning = true;

          // Build selected entity stats for Right Detail Inspector
          let detailStats: SelectedEntity['stats'] = [];
          let opsActions: SelectedEntity['operationalActions'] = [];

          if (u.type === 'gate') {
            const gate = gates.find((g) => g.id === u.id);
            detailStats = [
              { label: 'Open Lanes', value: `${gate?.openLanes || 8} / ${gate?.totalLanes || 10}`, change: '+2 lanes', positive: true },
              { label: 'Average Wait', value: `${gate?.waitTimeMin || 4.2} mins`, change: '-1.4m', positive: true },
              { label: 'Scanned Today', value: (gate?.scannedCount || 14200).toLocaleString() },
              { label: 'Flow Rate', value: `${gate?.flowRate || 310} pax/min` },
            ];
            opsActions = [
              { label: 'Open Overflow Turnstile', actionId: 'open_lane' },
              { label: 'Deploy Fast-Track Security', actionId: 'deploy_security' },
              { label: 'Broadcast Gate Notice', actionId: 'broadcast' },
            ];
          } else if (u.type === 'stall') {
            const stall = stalls.find((s) => s.id === u.id);
            detailStats = [
              { label: 'Queue Length', value: `${stall?.queueLength || 12} fans` },
              { label: 'Wait Time', value: `${stall?.waitMinutes || 6} mins` },
              { label: 'Inventory Level', value: `${stall?.stockLevelPercent || 85}%` },
              { label: 'Match Revenue', value: `$${(stall?.revenueK || 45).toFixed(1)}k`, change: '+18%', positive: true },
            ];
            opsActions = [
              { label: 'Restock Inventory', actionId: 'restock' },
              { label: 'Add Express Register', actionId: 'express_pos' },
              { label: 'Trigger Digital Promo', actionId: 'promo' },
            ];
          } else if (u.type === 'pitch') {
            detailStats = [
              { label: 'Pitch Strip', value: '#3 Center' },
              { label: 'Soil Moisture', value: '14.2% (Dry)' },
              { label: 'Pace & Bounce', value: 'Good Carry' },
              { label: 'Boundary Size', value: '72m Straight • 66m Square' },
            ];
            opsActions = [
              { label: '✨ Open 3D Star Batter Studio', actionId: 'inspect_character' },
              { label: 'Deploy Pitch Covers', actionId: 'pitch_covers' },
              { label: 'Inspect Crease Markings', actionId: 'inspect_crease' },
              { label: 'Check Hawk-Eye Calibration', actionId: 'calibrate_drs' },
            ];
          } else if (u.type === 'metro') {
            detailStats = [
              { label: 'Current Headway', value: '3.5 mins' },
              { label: 'Passenger Flow', value: '18,400 / hr' },
              { label: 'Next Arrival', value: '1 min (Train 104)' },
              { label: 'Station Crowd Level', value: 'Normal (Tier 1)' },
            ];
            opsActions = [
              { label: 'Request Special Post-Match Express', actionId: 'extra_train' },
              { label: 'Activate Gate Flow Metering', actionId: 'flow_meter' },
            ];
          } else if (u.type === 'bus') {
            detailStats = [
              { label: 'Convoy Status', value: 'Arrived at VIP Bay' },
              { label: 'Escort Level', value: 'Class A Motorcade' },
              { label: 'Security Clearance', value: 'All Verified' },
              { label: 'Departure Schedule', value: 'Post-Match (23:15)' },
            ];
            opsActions = [
              { label: 'Open VIP Green Corridor', actionId: 'open_corridor' },
              { label: 'Coordinate Escort Departure', actionId: 'coord_escort' },
            ];
          } else {
            detailStats = [
              { label: 'System Health', value: 'Optimal (100%)' },
              { label: 'Telemetry Link', value: 'Low Latency (4ms)' },
              { label: 'Power Consumption', value: '42.8 kW' },
            ];
            opsActions = [
              { label: 'Run Diagnostic Test', actionId: 'diag' },
            ];
          }

          callbacksRef.current.onSelectEntity({
            id: u.id,
            type: u.type,
            title: u.title,
            subtitle: u.subtitle,
            position: u.position,
            stats: detailStats,
            description: `Live tactical telemetry feed from Boundary Operations Center. Monitored in real-time with automated queue alerts and crowd safety thresholds.`,
            operationalActions: opsActions,
          });
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // 12. Main Render Loop (paced for software WebGL if needed)
    let frameId = 0;
    const clock = new THREE.Clock();

    function tick() {
      const delta = Math.min(0.1, clock.getDelta());
      const elapsed = clock.getElapsedTime();

      // Camera smooth glide interpolation with exponential damping
      const s = sceneRef.current;
      if (s.isTransitioning) {
        controls.target.lerp(s.cameraTarget, delta * 3.5);
        camera.position.lerp(s.cameraPosTarget, delta * 3.5);

        if (
          controls.target.distanceTo(s.cameraTarget) < 0.2 &&
          camera.position.distanceTo(s.cameraPosTarget) < 0.3
        ) {
          s.isTransitioning = false;
        }
      }

      controls.update();

      // Update match simulation
      if (s.matchSim) {
        s.matchSim.update(delta);
      }

      // Update crowds
      if (s.crowd) {
        s.crowd.update(delta, elapsed);
      }

      // Selection ring gentle animation
      if (s.selectionRing && s.selectionRingInner) {
        s.selectionRing.rotation.y = elapsed * 0.5;
        const scalePulse = 1 + Math.sin(elapsed * 4) * 0.08;
        s.selectionRingInner.scale.set(scalePulse, scalePulse, scalePulse);
      }

      // Animate Metro Train shuttling
      if (stadium.metroTrain) {
        // Shuttling back and forth along tracks
        const trainCycle = (elapsed * 0.2) % 2;
        const trainZ = (trainCycle < 1 ? trainCycle * 2 - 1 : (2 - trainCycle) * 2 - 1) * 22;
        stadium.metroTrain.position.z = trainZ;
      }

      // Animate Police Escort Flashing Lights
      if (stadium.busConvoy) {
        const sirenPhase = (elapsed * 10) % 2;
        stadium.busConvoy.traverse((obj) => {
          if (obj instanceof THREE.Mesh && obj.material && (obj.material as THREE.MeshStandardMaterial).emissive) {
            const mat = obj.material as THREE.MeshStandardMaterial;
            if (mat.color.getHex() === 0xEF4444) {
              mat.emissiveIntensity = sirenPhase < 1 ? 4.0 : 0.2;
            } else if (mat.color.getHex() === 0x3B82F6) {
              mat.emissiveIntensity = sirenPhase >= 1 ? 4.0 : 0.2;
            }
          }
        });
      }

      // Animate Moving Cars along perimeter road
      movingCars.forEach((c) => {
        c.angle += c.speed * delta * 0.15;
        c.mesh.position.set(Math.cos(c.angle) * c.laneR, 0.25, Math.sin(c.angle) * c.laneR);
        c.mesh.rotation.y = -c.angle + Math.PI / 2;
      });

      // Animate Rain Particles
      if (s.rainParticles && s.weatherPreset === 'rain') {
        s.rainParticles.visible = true;
        const posAttr = s.rainParticles.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < rainCount; i++) {
          let y = posAttr.getY(i) - 60 * delta;
          if (y < 0.2) y = 75;
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      } else if (s.rainParticles) {
        s.rainParticles.visible = false;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        // Paused software-WebGL loop using fenceSync / timeout
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
        gl.flush();
        const poll = () => {
          if (!sync) {
            frameId = window.setTimeout(tick, 60);
            return;
          }
          const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 6);
          } else {
            gl.deleteSync(sync);
            frameId = window.setTimeout(tick, 60);
          }
        };
        frameId = window.setTimeout(poll, 6);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
    />
  );
};
