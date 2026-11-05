import * as THREE from 'three';
import { CricketMatchState } from '../../types/stadium';
import { audioEngine } from '../AudioEngine';
import { CrowdSystem } from './CrowdSystem';
import { createPixarCharacter, PixarCharacterInstance, AvatarEmote } from './PixarCharacterBuilder';

export class MatchSimulator {
  public matchState: CricketMatchState;
  private scene: THREE.Group;
  private crowd: CrowdSystem;
  private scoreboardCanvas: HTMLCanvasElement;
  private scoreboardTexture: THREE.CanvasTexture;

  // 3D Player Meshes & Pixar Character Controllers
  public bowlerGroup: THREE.Group;
  public batterGroup: THREE.Group;
  public nonStrikerGroup: THREE.Group;
  public keeperGroup: THREE.Group;
  public batterPixar?: PixarCharacterInstance;
  public bowlerPixar?: PixarCharacterInstance;
  public nonStrikerPixar?: PixarCharacterInstance;
  public keeperPixar?: PixarCharacterInstance;
  public fielders: { group: THREE.Group; basePos: THREE.Vector3; name: string }[] = [];
  public cricketBall: THREE.Mesh;
  public ballTrail: THREE.Line;

  // Ball & animation kinematics
  private phase: 'runup' | 'delivery' | 'shot' | 'chase' | 'reset' = 'runup';
  private phaseTime: number = 0;
  private ballPos: THREE.Vector3 = new THREE.Vector3(0, 1.8, -12);
  private ballVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private currentShotType: 'dot' | 'single' | 'four' | 'six' = 'single';
  private targetFielderIdx: number = 0;
  private shotEventText: string = 'MATCH IN PROGRESS';
  public onScoreUpdate?: (state: CricketMatchState) => void;

  constructor(
    scene: THREE.Group,
    crowd: CrowdSystem,
    scoreboardCanvas: HTMLCanvasElement,
    scoreboardTexture: THREE.CanvasTexture
  ) {
    this.scene = scene;
    this.crowd = crowd;
    this.scoreboardCanvas = scoreboardCanvas;
    this.scoreboardTexture = scoreboardTexture;

    this.matchState = {
      battingTeam: 'IND',
      bowlingTeam: 'AUS',
      runs: 184,
      wickets: 3,
      overs: 17,
      ballsInOver: 4,
      targetRuns: 199,
      currentRunRate: 10.41,
      requiredRunRate: 10.71,
      batter1: { name: 'V. Kohli', runs: 78, balls: 44, fours: 6, sixes: 3, onStrike: true },
      batter2: { name: 'H. Pandya', runs: 28, balls: 14, fours: 2, sixes: 2, onStrike: false },
      bowler: { name: 'P. Cummins', overs: 3.4, runs: 38, wickets: 1, economy: 10.36 },
      lastAction: 'FOUR! Slashed through backward point!',
      isPausedForRain: false,
    };

    // Build 3D Players using Pixar Character Models
    const ausJerseyMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.5 });
    const pantMat = new THREE.MeshStandardMaterial({ color: 0x1E3A8A, roughness: 0.7 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xEDB892, roughness: 0.8 });

    // 1. Bowler (Pixar Character with Gold Jersey)
    this.bowlerPixar = createPixarCharacter({ outfit: 'team_gold', scale: 0.65, includeLegs: true });
    this.bowlerGroup = this.bowlerPixar.group;
    this.bowlerGroup.position.set(0.6, 0.7, -18);
    this.scene.add(this.bowlerGroup);

    // 2. Batter on strike (Pixar Character with Team Blue Jersey & Bat)
    this.batterPixar = createPixarCharacter({ outfit: 'team_blue', scale: 0.65, includeLegs: true, holdingBat: true });
    this.batterGroup = this.batterPixar.group;
    this.batterGroup.position.set(0, 0.7, 8.8);
    this.batterGroup.rotation.y = Math.PI;
    this.scene.add(this.batterGroup);

    // 3. Non-striker (Pixar Character)
    this.nonStrikerPixar = createPixarCharacter({ outfit: 'team_blue', scale: 0.65, includeLegs: true, holdingBat: true });
    this.nonStrikerGroup = this.nonStrikerPixar.group;
    this.nonStrikerGroup.position.set(-1.4, 0.7, -8.8);
    this.scene.add(this.nonStrikerGroup);

    // 4. Wicketkeeper (Pixar Character)
    this.keeperPixar = createPixarCharacter({ outfit: 'team_gold', scale: 0.65, includeLegs: true });
    this.keeperGroup = this.keeperPixar.group;
    this.keeperGroup.position.set(0, 0.7, 12.8);
    this.keeperGroup.rotation.y = Math.PI;
    this.scene.add(this.keeperGroup);

    // 5. Fielders stationed around the oval
    const fielderPositions = [
      { name: 'Slip', pos: new THREE.Vector3(4, 0.7, 13) },
      { name: 'Point', pos: new THREE.Vector3(26, 0.7, 8) },
      { name: 'Cover', pos: new THREE.Vector3(28, 0.7, -6) },
      { name: 'Mid-Off', pos: new THREE.Vector3(12, 0.7, -16) },
      { name: 'Mid-On', pos: new THREE.Vector3(-12, 0.7, -16) },
      { name: 'Mid-Wicket', pos: new THREE.Vector3(-28, 0.7, -4) },
      { name: 'Square Leg', pos: new THREE.Vector3(-24, 0.7, 10) },
      { name: 'Fine Leg', pos: new THREE.Vector3(-18, 0.7, 34) },
      { name: 'Long-On', pos: new THREE.Vector3(-15, 0.7, -48) },
    ];

    fielderPositions.forEach((fp) => {
      const fGroup = this.createPlayerMesh(ausJerseyMat, pantMat, skinMat, fp.name);
      fGroup.position.copy(fp.pos);
      fGroup.lookAt(0, 0.7, 0);
      this.scene.add(fGroup);
      this.fielders.push({ group: fGroup, basePos: fp.pos.clone(), name: fp.name });
    });

    // 6. Cricket Ball (white ball for day/night match)
    const ballGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.3,
      emissive: 0x333333,
    });
    this.cricketBall = new THREE.Mesh(ballGeo, ballMat);
    this.cricketBall.castShadow = true;
    this.scene.add(this.cricketBall);

    // Ball motion trail
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(40 * 3);
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    this.ballTrail = new THREE.Line(
      trailGeo,
      new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.6 })
    );
    this.scene.add(this.ballTrail);

    this.renderScoreboard();
  }

  private createPlayerMesh(
    jerseyMat: THREE.Material,
    pantMat: THREE.Material,
    skinMat: THREE.Material,
    name: string
  ): THREE.Group {
    const player = new THREE.Group();
    player.name = name;

    // Legs / Pants
    const legGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.85, 8);
    const legL = new THREE.Mesh(legGeo, pantMat);
    legL.position.set(-0.16, 0.42, 0);
    legL.castShadow = true;
    const legR = new THREE.Mesh(legGeo, pantMat);
    legR.position.set(0.16, 0.42, 0);
    legR.castShadow = true;

    // Torso / Jersey
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.8, 8);
    const torso = new THREE.Mesh(torsoGeo, jerseyMat);
    torso.position.y = 1.15;
    torso.castShadow = true;

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.7;

    // Cap / Helmet
    const capGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.12, 8);
    const cap = new THREE.Mesh(capGeo, jerseyMat);
    cap.position.y = 1.82;

    player.add(legL, legR, torso, head, cap);
    return player;
  }

  /**
   * Main simulation tick called from animation loop
   */
  public update(delta: number) {
    if (this.matchState.isPausedForRain) {
      this.cricketBall.visible = false;
      return;
    }
    this.cricketBall.visible = true;
    this.phaseTime += delta;

    // Animate Pixar Character models
    const animTime = performance.now() * 0.001;
    this.batterPixar?.updateAnimation(
      animTime,
      this.currentShotType === 'six' && this.phase === 'shot' ? 'cheering' : 'batting'
    );
    this.bowlerPixar?.updateAnimation(animTime, this.phase === 'runup' ? 'running' : 'idle');
    this.nonStrikerPixar?.updateAnimation(animTime, 'idle');
    this.keeperPixar?.updateAnimation(animTime, 'idle');

    switch (this.phase) {
      case 'runup': {
        // Bowler running in from -18 Z to -9.5 Z
        const runProgress = Math.min(1, this.phaseTime / 1.6);
        const zPos = THREE.MathUtils.lerp(-18, -9.5, runProgress);
        const runBounce = Math.abs(Math.sin(runProgress * 14)) * 0.2;
        this.bowlerGroup.position.set(0.6, 0.7 + runBounce, zPos);

        // Ball follows bowler's hand
        this.ballPos.set(0.6, 1.8 + runBounce, zPos + 0.3);
        this.cricketBall.position.copy(this.ballPos);

        if (runProgress >= 1) {
          this.phase = 'delivery';
          this.phaseTime = 0;
          // Set delivery trajectory towards pitch landing
          this.ballVel.set((Math.random() - 0.5) * 0.4, -4.2, 28);
        }
        break;
      }

      case 'delivery': {
        // Ball flying towards pitch bounce (~ +2 Z) and towards batter (+8.8 Z)
        this.ballPos.addScaledVector(this.ballVel, delta);
        // Gravity
        this.ballVel.y -= 9.8 * delta;

        // Bounce on pitch
        if (this.ballPos.y <= 0.78 && this.ballPos.z < 6) {
          this.ballPos.y = 0.78;
          this.ballVel.y = Math.abs(this.ballVel.y) * 0.85; // bounce up
        }

        this.cricketBall.position.copy(this.ballPos);

        // When ball reaches batter
        if (this.ballPos.z >= 8.4) {
          this.phase = 'shot';
          this.phaseTime = 0;

          // Decide shot outcome
          const roll = Math.random();
          if (roll < 0.25) {
            this.currentShotType = 'dot';
            this.ballVel.set(12, 1.5, -4); // pushed to cover
            this.targetFielderIdx = 2; // Cover
            audioEngine.playBatHit('single');
          } else if (roll < 0.55) {
            this.currentShotType = 'single';
            this.ballVel.set(-14, 2.5, -12); // single to mid-wicket
            this.targetFielderIdx = 5;
            audioEngine.playBatHit('single');
          } else if (roll < 0.75) {
            this.currentShotType = 'four';
            this.ballVel.set(28, 2.2, 14); // crack through point boundary
            this.targetFielderIdx = 1;
            audioEngine.playBatHit('boundary');
            audioEngine.playCrowdCheer('medium');
          } else {
            this.currentShotType = 'six';
            // Massive 6 soaring over long-on into the stands!
            this.ballVel.set(-18, 24, -36);
            this.targetFielderIdx = 8; // Long-on
            audioEngine.playBatHit('six');
            audioEngine.playCrowdCheer('huge');
            this.crowd.triggerSixCelebration();
          }

          // Animate bat swing
          const bat = this.batterGroup.getObjectByName('Bat');
          if (bat) {
            bat.rotation.x = -1.2;
            bat.rotation.y = 0.8;
          }
        }
        break;
      }

      case 'shot': {
        // Ball flight after the bat hit
        this.ballPos.addScaledVector(this.ballVel, delta);
        this.ballVel.y -= 12 * delta; // strong gravity arc

        // Ground roll
        if (this.ballPos.y <= 0.78) {
          this.ballPos.y = 0.78;
          this.ballVel.y = -this.ballVel.y * 0.45;
          this.ballVel.x *= 0.94;
          this.ballVel.z *= 0.94;
        }

        this.cricketBall.position.copy(this.ballPos);

        // Fielders chase ball
        const chaser = this.fielders[this.targetFielderIdx];
        if (chaser && this.currentShotType !== 'six') {
          chaser.group.position.lerp(this.ballPos, delta * 2.2);
          chaser.group.position.y = 0.7;
          chaser.group.lookAt(this.ballPos.x, 0.7, this.ballPos.z);
        }

        if (this.phaseTime > 2.8) {
          this.phase = 'chase';
          this.phaseTime = 0;
          this.applyScoreUpdate();
        }
        break;
      }

      case 'chase': {
        // Return fielders & reset bat position
        const bat = this.batterGroup.getObjectByName('Bat');
        if (bat) {
          bat.rotation.x = 0.4;
          bat.rotation.y = 0;
        }

        this.fielders.forEach((f) => {
          f.group.position.lerp(f.basePos, delta * 3);
          f.group.lookAt(0, 0.7, 0);
        });

        if (this.phaseTime > 1.8) {
          this.phase = 'reset';
          this.phaseTime = 0;
        }
        break;
      }

      case 'reset': {
        // Bowler walking back to mark
        this.bowlerGroup.position.lerp(new THREE.Vector3(0.6, 0.7, -18), delta * 4);
        if (this.phaseTime > 0.8) {
          this.phase = 'runup';
          this.phaseTime = 0;
        }
        break;
      }
    }
  }

  private applyScoreUpdate() {
    let addedRuns = 0;
    if (this.currentShotType === 'dot') {
      addedRuns = 0;
      this.shotEventText = 'DOT BALL • Straight to fielder';
    } else if (this.currentShotType === 'single') {
      addedRuns = 1;
      this.shotEventText = '1 RUN • Quick single taken';
    } else if (this.currentShotType === 'four') {
      addedRuns = 4;
      this.shotEventText = 'FOUR! • Driven past the diving boundary rider';
    } else if (this.currentShotType === 'six') {
      addedRuns = 6;
      this.shotEventText = 'MAXIMUM SIX! • 104m into the Pavilion Stand!';
    }

    this.matchState.runs += addedRuns;
    this.matchState.batter1.runs += addedRuns;
    this.matchState.batter1.balls += 1;
    if (addedRuns === 4) this.matchState.batter1.fours += 1;
    if (addedRuns === 6) this.matchState.batter1.sixes += 1;

    this.matchState.ballsInOver += 1;
    if (this.matchState.ballsInOver >= 6) {
      this.matchState.overs += 1;
      this.matchState.ballsInOver = 0;
    }

    const totalBalls = this.matchState.overs * 6 + this.matchState.ballsInOver;
    this.matchState.currentRunRate = Number(((this.matchState.runs / Math.max(1, totalBalls)) * 6).toFixed(2));
    const ballsRemaining = Math.max(1, 120 - totalBalls);
    const runsRemaining = Math.max(0, this.matchState.targetRuns - this.matchState.runs);
    this.matchState.requiredRunRate = Number(((runsRemaining / ballsRemaining) * 6).toFixed(2));
    this.matchState.lastAction = this.shotEventText;

    this.renderScoreboard();
    if (this.onScoreUpdate) {
      this.onScoreUpdate({ ...this.matchState });
    }
  }

  /**
   * Render high-visibility LED Scoreboard texture
   */
  public renderScoreboard() {
    const ctx = this.scoreboardCanvas.getContext('2d')!;
    const w = this.scoreboardCanvas.width;
    const h = this.scoreboardCanvas.height;

    // Dark sleek display background
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, w, h);

    // Matrix LED dot grid styling
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 0; x < w; x += 12) {
      for (let y = 0; y < h; y += 12) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Top Header Banner
    ctx.fillStyle = '#1E5EFF';
    ctx.fillRect(0, 0, w, 70);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ICC MATCH DAY • T20 INTERNATIONAL FINAL', 30, 48);

    ctx.textAlign = 'right';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('TARGET: ' + this.matchState.targetRuns, w - 30, 48);

    // Main Score Display (Runs / Wickets & Overs)
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.font = 'bold 110px monospace';
    ctx.fillText(`${this.matchState.battingTeam} ${this.matchState.runs}/${this.matchState.wickets}`, 30, 195);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 50px monospace';
    ctx.fillText(`OVERS ${this.matchState.overs}.${this.matchState.ballsInOver} / 20`, 580, 155);

    // Run Rates
    ctx.fillStyle = '#94A3B8';
    ctx.font = '30px sans-serif';
    ctx.fillText(`CRR: ${this.matchState.currentRunRate}   RRR: ${this.matchState.requiredRunRate}`, 580, 205);

    // Divider Line
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(30, 240);
    ctx.lineTo(w - 30, 240);
    ctx.stroke();

    // Batters & Bowler stats
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#FACC15';
    ctx.fillText(`* ${this.matchState.batter1.name}`, 30, 300);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${this.matchState.batter1.runs} (${this.matchState.batter1.balls}b)`, 340, 300);

    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(`  ${this.matchState.batter2.name}`, 30, 355);
    ctx.fillText(`${this.matchState.batter2.runs} (${this.matchState.batter2.balls}b)`, 340, 355);

    // Bowler on right
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('BOWLING', 620, 295);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${this.matchState.bowler.name}  ${this.matchState.overs}.${this.matchState.ballsInOver}-0-${this.matchState.runs}-1`, 620, 345);

    // Bottom Event Ticker
    ctx.fillStyle = this.currentShotType === 'six' ? '#1E5EFF' : this.currentShotType === 'four' ? '#10B981' : '#1E293B';
    ctx.fillRect(0, h - 85, w, 85);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.shotEventText.toUpperCase(), w / 2, h - 30);

    this.scoreboardTexture.needsUpdate = true;
  }

  public setBatterOutfit(outfit: 'pink_polo' | 'team_blue' | 'team_gold' | 'ops_suit') {
    this.batterPixar?.setOutfit(outfit);
  }

  public triggerPlayerEmote(emote: AvatarEmote, durationMs = 3800) {
    this.batterPixar?.triggerEmote(emote, durationMs);
    if (emote === 'cheer') {
      audioEngine.playWhistle();
      audioEngine.playCrowdCheer('medium');
      this.crowd.triggerSixCelebration();
    } else if (emote === 'clap') {
      audioEngine.playClap();
      setTimeout(() => audioEngine.playClap(), 200);
      setTimeout(() => audioEngine.playClap(), 400);
    } else if (emote === 'wave') {
      audioEngine.playCrowdCheer('medium');
    }
  }
}
