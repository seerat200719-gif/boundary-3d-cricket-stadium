import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { X, Sparkles, User, RotateCcw, Eye, Play, Shirt, Flame, Check, Radio, ArrowRight, Volume2 } from 'lucide-react';
import { createPixarCharacter, PixarCharacterInstance, AvatarEmote } from '../three/PixarCharacterBuilder';
import { audioEngine } from '../AudioEngine';

interface CharacterStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsAvatar?: (outfit: string) => void;
  onTriggerStadiumEmote?: (emote: AvatarEmote) => void;
  onFocusStadiumPitch?: () => void;
}

export const CharacterStudioModal: React.FC<CharacterStudioModalProps> = ({
  isOpen,
  onClose,
  onSelectAsAvatar,
  onTriggerStadiumEmote,
  onFocusStadiumPitch,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeOutfit, setActiveOutfit] = useState<'pink_polo' | 'team_blue' | 'team_gold' | 'ops_suit'>('pink_polo');
  const [activeAnim, setActiveAnim] = useState<AvatarEmote>('idle');
  const [currentEmotePlaying, setCurrentEmotePlaying] = useState<AvatarEmote | null>(null);
  const [trackPointer, setTrackPointer] = useState<boolean>(true);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const characterRef = useRef<PixarCharacterInstance | null>(null);
  const pointerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.2, 3));

  useEffect(() => {
    if (!isOpen) return;
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFDF2F8); // Gentle warm pink studio tint matching reference

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 1.85, 3.8);

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

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Studio Lighting matching the portrait
    const keyLight = new THREE.DirectionalLight(0xFFF1E8, 2.8);
    keyLight.position.set(2.5, 3.8, 3.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xF472B6, 1.4); // soft pink rim fill
    fillLight.position.set(-2.8, 2.2, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xFFFFFF, 2.0); // crisp rim highlight on hair
    rimLight.position.set(0, 4.2, -2.8);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFCE7F3, 0.8);
    scene.add(hemiLight);

    // Soft circular shadow disc on ground
    const shadowGeo = new THREE.CircleGeometry(1.1, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0xE7A7B8,
      transparent: true,
      opacity: 0.35,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // Pedestal stand
    const standGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.2, 32);
    const standMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.3,
    });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = -0.1;
    stand.receiveShadow = true;
    scene.add(stand);

    // Build Character
    const character = createPixarCharacter({
      outfit: activeOutfit,
      scale: 1.0,
      includeLegs: true,
      holdingBat: true,
    });
    scene.add(character.group);
    characterRef.current = character;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.45, 0);
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 1.8;
    controls.maxDistance = 6.0;

    // Pointer move listener for dynamic eye/head tracking
    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerPosRef.current.set(nx * 1.6, 1.9 + ny * 1.2, 2.5);
    };
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      if (character) {
        character.updateAnimation(elapsed, activeAnim);

        // Smooth eye and head tracking if enabled
        if (trackPointer) {
          character.lookAtTarget(pointerPosRef.current);
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isOpen]);

  // Update outfit when state changes
  useEffect(() => {
    if (characterRef.current) {
      characterRef.current.setOutfit(activeOutfit);
    }
  }, [activeOutfit]);

  if (!isOpen) return null;

  const outfits: { id: 'pink_polo' | 'team_blue' | 'team_gold' | 'ops_suit'; label: string; desc: string; color: string }[] = [
    { id: 'pink_polo', label: '🌸 Classic Pink Polo', desc: 'Exact match from portrait reference with folded collar', color: '#F48FB1' },
    { id: 'team_blue', label: '🏏 India Match Kit', desc: 'Star Batter jersey #18 with royal blue accents', color: '#1E5EFF' },
    { id: 'team_gold', label: '⚡ Australia Gold Kit', desc: 'Canary gold away jersey with navy trim', color: '#F59E0B' },
    { id: 'ops_suit', label: '👔 Operations Director', desc: 'Executive midnight slate venue coordinator', color: '#1E293B' },
  ];

  const emotes: { id: AvatarEmote; label: string; icon: string; desc: string }[] = [
    { id: 'clap', label: 'Clap', icon: '👏', desc: 'Rhythmic applause for the fans' },
    { id: 'wave', label: 'Wave', icon: '🙋‍♂️', desc: 'Friendly wave to the pavilions' },
    { id: 'cheer', label: 'Cheer', icon: '🎉', desc: 'Jumping celebration with crowd roar' },
    { id: 'walk', label: 'Walk', icon: '🚶', desc: 'Confident batsman stride' },
    { id: 'flex', label: 'Flex', icon: '💪', desc: 'Champion power & victory pose' },
    { id: 'bow', label: 'Bow', icon: '🙇', desc: 'Respectful cap tip to the arena' },
  ];

  const handleTriggerEmote = (emote: AvatarEmote) => {
    if (characterRef.current) {
      characterRef.current.triggerEmote(emote, 4200);
    }
    setCurrentEmotePlaying(emote);

    // Audio feedback
    if (emote === 'clap') {
      audioEngine.playClap();
      setTimeout(() => audioEngine.playClap(), 220);
      setTimeout(() => audioEngine.playClap(), 440);
    } else if (emote === 'cheer') {
      audioEngine.playWhistle();
      audioEngine.playCrowdCheer('huge');
    } else if (emote === 'wave') {
      audioEngine.playCrowdCheer('medium');
    }

    // Trigger on the 3D avatar on the stadium field
    if (onTriggerStadiumEmote) {
      onTriggerStadiumEmote(emote);
    }

    setTimeout(() => {
      setCurrentEmotePlaying(null);
    }, 4200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Left: Interactive 3D Three.js Studio Viewport */}
        <div className="relative flex-1 bg-gradient-to-b from-pink-50 to-rose-100/50 min-h-[380px] md:min-h-[540px] flex items-center justify-center overflow-hidden">
          {/* Three.js mount */}
          <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Reference Image Comparison Card in Corner */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 bg-white/95 px-3 py-2 rounded-2xl border border-pink-200/80 shadow-md">
            <img
              src="/assets/aistudio/image_fc2286fe.png"
              alt="Uploaded Reference"
              className="w-12 h-12 rounded-xl object-cover border border-pink-300 shadow-xs"
            />
            <div className="text-left">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">
                Reference Model
              </span>
              <div className="text-xs font-bold text-slate-800">Pixar 3D Stylized</div>
              <div className="text-[10px] text-slate-500">Procedural 3D Recreation</div>
            </div>
          </div>

          {/* Active Emote Broadcast Notification Overlay */}
          {currentEmotePlaying && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 text-white px-3.5 py-2 rounded-2xl shadow-lg border border-pink-400/50 animate-in fade-in zoom-in-95 duration-150">
              <Radio className="w-4 h-4 text-pink-400 animate-pulse" />
              <div className="text-left text-xs">
                <div className="font-bold capitalize flex items-center gap-1.5">
                  Playing "{currentEmotePlaying}"
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-300">Broadcasting live to Stadium View</div>
              </div>
            </div>
          )}

          {/* Viewport hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/75 text-white text-[11px] font-medium px-3 py-1 rounded-full pointer-events-none flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-pink-300" />
            Drag to rotate • Scroll to zoom • Eyes follow pointer
          </div>
        </div>

        {/* Right: Studio Customization, Outfits & Emotes */}
        <div className="w-full md:w-96 p-5 flex flex-col justify-between overflow-y-auto bg-white border-t md:border-t-0 md:border-l border-slate-100">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  3D Character Studio
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  Leo • Star Player & Avatar
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SELECTION PANEL: AVATAR EMOTES (STADIUM VIEW) */}
            <div className="p-3 bg-gradient-to-br from-pink-50/70 via-blue-50/40 to-slate-50 rounded-2xl border border-pink-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-sm">🎭</span>
                  Stadium View Emotes
                </label>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-blue-600" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2.5 leading-snug">
                Trigger short animated emotes on your 3D avatar on the cricket pitch.
              </p>

              {/* Grid of Emote Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                {emotes.map((emote) => {
                  const isPlaying = currentEmotePlaying === emote.id;
                  return (
                    <button
                      key={emote.id}
                      onClick={() => handleTriggerEmote(emote.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        isPlaying
                          ? 'bg-pink-600 text-white border-pink-600 shadow-md scale-95'
                          : 'bg-white hover:bg-pink-50/80 border-slate-200 text-slate-800 hover:border-pink-300'
                      }`}
                      title={emote.desc}
                    >
                      <span className="text-lg leading-none mb-1">{emote.icon}</span>
                      <span className="text-xs font-bold leading-tight">{emote.label}</span>
                      <span className={`text-[9px] mt-0.5 ${isPlaying ? 'text-pink-100' : 'text-slate-400'}`}>
                        {isPlaying ? 'Active...' : 'Trigger'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Watch In Stadium Pitch Button */}
              {onFocusStadiumPitch && (
                <button
                  onClick={() => {
                    onFocusStadiumPitch();
                    onClose();
                  }}
                  className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white/80 hover:bg-white text-[#1E5EFF] text-[11px] font-bold border border-blue-200 shadow-2xs transition"
                >
                  <span>Watch Avatar on Pitch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Outfits Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Shirt className="w-3.5 h-3.5 text-slate-400" />
                Outfit & Style
              </label>
              <div className="space-y-1.5">
                {outfits.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setActiveOutfit(opt.id)}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl border text-left transition ${
                      activeOutfit === opt.id
                        ? 'border-pink-500 bg-pink-50/50 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full mt-0.5 shrink-0 border border-black/10 shadow-xs"
                      style={{ backgroundColor: opt.color }}
                    />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 leading-snug">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Eye Tracking Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs">
                <div className="font-bold text-slate-800">Dynamic Eye Tracking</div>
                <div className="text-[10px] text-slate-500">Eyes follow cursor in real-time</div>
              </div>
              <button
                onClick={() => setTrackPointer(!trackPointer)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  trackPointer ? 'bg-pink-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {trackPointer ? 'Active' : 'Off'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            {appliedNotice && (
              <div className="text-[11px] font-bold text-emerald-600 text-center flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {appliedNotice}
              </div>
            )}
            <button
              onClick={() => {
                if (onSelectAsAvatar) onSelectAsAvatar(activeOutfit);
                setAppliedNotice('Avatar updated & deployed to Stadium operations!');
                setTimeout(() => setAppliedNotice(null), 3000);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E5EFF] text-white text-xs font-bold hover:bg-blue-600 transition shadow-sm flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Set as Ops Avatar & Star Batter
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
            >
              Back to Stadium Overview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
