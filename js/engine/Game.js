/**
 * Game — หัวใจของเกม เชื่อมทุกส่วนเข้าด้วยกัน
 *
 *   Input   → บอกว่าผู้เล่นแตะช่องไหน
 *   Board   → เก็บข้อมูลกระดาน/ลูกกวาด
 *   Animation → tween ค่าให้นุ่ม
 *   Renderer  → วาดทุกอย่าง
 *   Systems   → กติกาเกม (v0.2.0 ยังเป็นโครงเปล่า)
 *
 * ลูปหลัก: requestAnimationFrame → update(dt) → draw
 */
import { Renderer } from './Renderer.js?v=044';
import { Input } from './Input.js';
import { Animation, Easing } from './Animation.js';
import { Effects } from './Effects.js?v=044';
import { Sfx } from './Sfx.js';
import { Board } from '../board/Board.js';
import { Candy } from '../board/Candy.js';
import { MatchSystem } from '../systems/MatchSystem.js?v=037';
import { GravitySystem } from '../systems/GravitySystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js?v=047';
import { LevelSystem } from '../systems/LevelSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { FIRST_PLANET, starsForScore } from '../systems/LevelCatalog.js';

/** สถานะของเกม */
const State = {
  IDLE: 'idle',       // รออินพุต
  ANIMATING: 'animating', // กำลังเล่นอนิเมชัน ห้ามรับอินพุต
};

export class Game {
  /** ระยะเวลาอนิเมชันสลับ (ms) */
  static SWAP_DURATION = 160;
  /** ระยะเวลาอนิเมชันแตก (ms) */
  static POP_DURATION = 180;
  /** ระยะเวลาอนิเมชันหล่น (ms) — เหลือไว้เป็นค่าอ้างอิง (TASK 001: ใช้เวลาตามระยะจริงใน dropAndRefill) */
  static FALL_DURATION = 260;
  /** คะแนนต่อ Move ที่เหลือ เมื่อทำครบ 3 ดาวแล้ว */
  static MOVE_BONUS = 50;

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.renderer = new Renderer(canvas);
    this.animation = new Animation();
    this.effects = new Effects();
    this.board = new Board();

    // ---- Systems ----
    this.matchSystem = new MatchSystem(this.board);
    this.gravitySystem = new GravitySystem(this.board);
    this.scoreSystem = new ScoreSystem();
    this.currentLevel = FIRST_PLANET.levels[0];
    this.levelSystem = new LevelSystem(this.currentLevel);
    this.saveSystem = new SaveSystem();
    this.progress = this.saveSystem.load() || { unlocked: 1, levels: {}, tutorials: {} };
    this.progress.levels ||= {};
    this.progress.tutorials ||= {};
    this.sfx = new Sfx();

    // ---- Input ----
    this.input = new Input(canvas, this.renderer);
    this.input.onTap = (pos) => this.handleTap(pos);
    this.input.onSwipe = (from, to) => this.handleSwipe(from, to);

    /** @type {import('../board/Cell.js').Cell|null} ช่องที่เลือกอยู่ */
    this.selected = null;
    this.state = State.IDLE;
    this.lastTime = 0;

    /** hit-stop: หยุดอนิเมชัน/เอฟเฟกต์สั้นๆ ตอนอิมแพกต์ใหญ่ (ยังวาดต่อ) — จูซคลาสสิก */
    this.freezeTime = 0;
    this.gameplayActive = false;
    this.idleMs = 0;
    this.hintMove = null;
    this.lastMoveBonus = 0;

    // ---- HUD (DOM) ----
    this.scoreEl = document.getElementById('score');
    this.multEl = document.getElementById('mult');
    this.movesEl = document.getElementById('moves');
    this.targetEl = document.getElementById('target');
    this.currentLevelEl = document.getElementById('current-level');
    this.lessonEl = document.getElementById('lesson');
    this.starProgressFillEl = document.getElementById('star-progress-fill');
    this.playStarEls = [1, 2, 3].map((i) => document.getElementById(`play-star-${i}`));
    this.nextStarScoreEl = document.getElementById('next-star-score');
    this.resultEl = document.getElementById('level-result');
    this.resultTitleEl = document.getElementById('result-title');
    this.resultIconEl = document.getElementById('result-icon');
    this.resultMessageEl = document.getElementById('result-message');
    this.resultScoreEl = document.getElementById('result-score');
    this.resultGoalsEl = document.getElementById('result-goals');
    this.resultStarsEl = document.getElementById('result-stars');
    this.retryBtn = document.getElementById('retry');
    this.nextLevelBtn = document.getElementById('next-level');
    this.levelSelectBtn = document.getElementById('level-select');
    this.tutorialEl = document.getElementById('tutorial-overlay');
    this.tutorialIconEl = document.getElementById('tutorial-icon');
    this.tutorialTitleEl = document.getElementById('tutorial-title');
    this.tutorialBodyEl = document.getElementById('tutorial-body');
    this.settingsBtn = document.getElementById('settings');
    this.settingsEl = document.getElementById('settings-overlay');
    this.soundToggleBtn = document.getElementById('sound-toggle');
    this.settingsBtn?.addEventListener('click', () => this.toggleSettings(true));
    document.getElementById('close-settings')?.addEventListener('click', () => this.toggleSettings(false));
    this.settingsEl?.addEventListener('click', (event) => {
      if (event.target === this.settingsEl) this.toggleSettings(false);
    });
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        const muted = this.sfx.toggleMute();
        this.soundToggleBtn.textContent = muted ? 'OFF' : 'ON';
        this.soundToggleBtn.classList.toggle('off', muted);
      });
    }
    if (this.retryBtn) this.retryBtn.addEventListener('click', () => this.restartLevel());
    if (this.nextLevelBtn) this.nextLevelBtn.addEventListener('click', () => this.startNextLevel());
    if (this.levelSelectBtn) this.levelSelectBtn.addEventListener('click', () => this.showLevelSelect());
    const openPlanet = () => this.showLevelSelect();
    document.getElementById('open-planet')?.addEventListener('click', openPlanet);
    document.getElementById('enter-planet')?.addEventListener('click', openPlanet);
    document.getElementById('back-to-space')?.addEventListener('click', () => this.showPlanetMap());
    document.getElementById('back-to-levels')?.addEventListener('click', () => this.showLevelSelect());
    document.getElementById('start-level')?.addEventListener('click', () => this.beginSelectedLevel());
    document.getElementById('tutorial-ok')?.addEventListener('click', () => this.dismissTutorial());
    this.renderLevelMap();
    this.updateHUD(null);
    this.updateLevelHUD();
  }

  toggleSettings(open) {
    this.settingsEl?.classList.toggle('show', open);
    this.settingsEl?.setAttribute('aria-hidden', String(!open));
    this.settingsBtn?.setAttribute('aria-expanded', String(open));
  }

  /**
   * อัปเดต HUD คะแนน
   * @param {{chips:number, mult:number, gained:number}|null} result ผลสเต็ปล่าสุด (null = ว่าง)
   */
  updateHUD(result) {
    if (this.scoreEl) this.scoreEl.textContent = this.scoreSystem.score;
    if (this.multEl) {
      this.multEl.textContent = result ? 'x' + result.mult.toFixed(1) : 'x1.0';
      this.multEl.classList.toggle('hot', !!result && result.mult > 1);
    }
    this.updateStarProgress();
  }

  updateStarProgress() {
    const thresholds = this.currentLevel.stars;
    const score = this.scoreSystem.score;
    const max = thresholds[2];
    if (this.starProgressFillEl) this.starProgressFillEl.style.width = `${Math.min(100, score / max * 100)}%`;
    this.playStarEls.forEach((star, index) => {
      if (!star) return;
      const earned = score >= thresholds[index];
      star.textContent = earned ? '★' : '☆';
      star.classList.toggle('earned', earned);
      star.style.left = `${thresholds[index] / max * 100}%`;
      star.setAttribute('aria-label', `${index + 1} ดาว ที่ ${thresholds[index]} คะแนน${earned ? ' ได้แล้ว' : ''}`);
    });
    if (this.nextStarScoreEl) {
      const nextIndex = thresholds.findIndex((threshold) => score < threshold);
      this.nextStarScoreEl.textContent = nextIndex < 0
        ? 'เก็บครบ 3 ดาวแล้ว!'
        : `อีก ${thresholds[nextIndex] - score} คะแนน → ${'⭐'.repeat(nextIndex + 1)}`;
    }
  }

  updateLevelHUD() {
    if (this.movesEl) this.movesEl.textContent = this.levelSystem.moves;
    if (this.targetEl) this.targetEl.textContent = this.currentLevel.target;
    if (this.currentLevelEl) this.currentLevelEl.textContent = this.currentLevel.id;
    if (this.lessonEl) this.lessonEl.textContent = this.currentLevel.lesson;
  }

  renderLevelMap() {
    const grid = document.getElementById('level-grid');
    if (!grid) return;
    grid.replaceChildren();
    let totalStars = 0;
    for (const level of FIRST_PLANET.levels) {
      const saved = this.progress.levels[level.id] || { stars: 0, bestScore: 0 };
      totalStars += saved.stars || 0;
      const unlocked = level.id <= this.progress.unlocked;
      const button = document.createElement('button');
      button.className = `level-node${unlocked ? '' : ' locked'}${level.id === this.progress.unlocked ? ' current' : ''}`;
      button.disabled = !unlocked;
      button.setAttribute('aria-label', unlocked ? `ด่าน ${level.id} ได้ ${saved.stars || 0} ดาว` : `ด่าน ${level.id} ยังไม่ปลดล็อก`);
      button.innerHTML = `<span class="number">${unlocked ? level.id : '🔒'}</span><span class="stars">${'★'.repeat(saved.stars || 0)}${'☆'.repeat(3 - (saved.stars || 0))}</span>`;
      if (unlocked) button.addEventListener('click', () => this.selectLevel(level.id));
      grid.appendChild(button);
    }
    const totalEl = document.getElementById('level-stars-total');
    const planetEl = document.getElementById('planet-stars');
    if (totalEl) totalEl.textContent = totalStars;
    if (planetEl) planetEl.textContent = totalStars;
  }

  showPlanetMap() {
    this.gameplayActive = false;
    document.getElementById('planet-screen')?.classList.add('show');
    document.getElementById('level-screen')?.classList.remove('show');
    document.getElementById('mission-screen')?.classList.remove('show');
  }

  showLevelSelect() {
    this.gameplayActive = false;
    this.renderLevelMap();
    document.getElementById('planet-screen')?.classList.remove('show');
    document.getElementById('level-screen')?.classList.add('show');
    document.getElementById('mission-screen')?.classList.remove('show');
    this.resultEl?.classList.remove('show', 'win', 'lose');
  }

  selectLevel(levelId) {
    const level = FIRST_PLANET.levels.find((item) => item.id === levelId);
    if (!level || levelId > this.progress.unlocked) return;
    this.currentLevel = level;
    document.getElementById('level-screen')?.classList.remove('show');
    document.getElementById('planet-screen')?.classList.remove('show');
    document.getElementById('mission-screen')?.classList.add('show');
    document.getElementById('brief-level').textContent = level.id;
    document.getElementById('brief-lesson').textContent = level.lesson;
    document.getElementById('brief-target').textContent = level.target;
    document.getElementById('brief-moves').textContent = level.moves;
    level.stars.forEach((score, index) => {
      document.getElementById(`brief-star-${index + 1}`).textContent = score;
    });
  }

  beginSelectedLevel() {
    document.getElementById('mission-screen')?.classList.remove('show');
    this.restartLevel();
    this.showTutorialIfNeeded();
  }

  showTutorialIfNeeded() {
    const tutorial = this.currentLevel.tutorial;
    if (!tutorial || this.progress.tutorials[this.currentLevel.id]) return;
    this.gameplayActive = false;
    this.resetMoveHint();
    if (this.tutorialIconEl) this.tutorialIconEl.textContent = tutorial.icon;
    if (this.tutorialTitleEl) this.tutorialTitleEl.textContent = tutorial.title;
    if (this.tutorialBodyEl) this.tutorialBodyEl.textContent = tutorial.body;
    this.tutorialEl?.classList.add('show');
    this.tutorialEl?.setAttribute('aria-hidden', 'false');
  }

  dismissTutorial() {
    this.tutorialEl?.classList.remove('show');
    this.tutorialEl?.setAttribute('aria-hidden', 'true');
    this.progress.tutorials[this.currentLevel.id] = true;
    this.saveSystem.save(this.progress);
    this.gameplayActive = true;
    this.resetMoveHint();
  }

  showLevelResult() {
    const earnedThreeStars = starsForScore(this.currentLevel, this.scoreSystem.score) === 3;
    if (!this.levelSystem.finished && earnedThreeStars) {
      const remainingMoves = this.levelSystem.cashOutMoves();
      this.lastMoveBonus = this.scoreSystem.addBonus(remainingMoves * Game.MOVE_BONUS);
      this.levelSystem.recordScore(this.scoreSystem.score);
      this.updateHUD(null);
      this.updateLevelHUD();
    }
    if (!this.levelSystem.finished) return;
    const won = this.levelSystem.goalMet;
    if (!this.resultEl) return;
    this.gameplayActive = false;
    this.resetMoveHint();
    const stars = won ? starsForScore(this.currentLevel, this.scoreSystem.score) : 0;
    this.resultEl.classList.toggle('win', won);
    this.resultEl.classList.toggle('lose', !won);
    this.resultEl.classList.add('show');
    this.resultEl.setAttribute('aria-hidden', 'false');
    if (this.resultTitleEl) this.resultTitleEl.textContent = won ? 'MISSION COMPLETE' : 'MISSION FAILED';
    if (this.resultIconEl) this.resultIconEl.textContent = won ? '✨' : '🛠️';
    if (this.resultMessageEl) this.resultMessageEl.textContent = won
      ? (this.lastMoveBonus > 0 ? `3 STARS! • MOVES BONUS +${this.lastMoveBonus}` : 'ขุดคริสตัลเป้าหมายครบแล้ว!')
      : 'Moves หมดแล้ว ลองวางแผนคอมโบใหม่อีกครั้ง';
    if (this.resultScoreEl) this.resultScoreEl.textContent = this.scoreSystem.score;
    if (this.resultGoalsEl) this.resultGoalsEl.textContent = this.currentLevel.target;
    if (this.resultStarsEl) this.resultStarsEl.textContent = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
    if (this.nextLevelBtn) this.nextLevelBtn.hidden = !won || this.currentLevel.id >= FIRST_PLANET.levels.length;
    if (won) {
      const previous = this.progress.levels[this.currentLevel.id] || { stars: 0, bestScore: 0 };
      this.progress.levels[this.currentLevel.id] = {
        stars: Math.max(previous.stars || 0, stars),
        bestScore: Math.max(previous.bestScore || 0, this.scoreSystem.score),
      };
      this.progress.unlocked = Math.max(this.progress.unlocked, Math.min(this.currentLevel.id + 1, FIRST_PLANET.levels.length));
      this.saveSystem.save(this.progress);
      this.renderLevelMap();
    }
  }

  restartLevel() {
    this.levelSystem = new LevelSystem(this.currentLevel);
    this.scoreSystem.reset();
    this.lastMoveBonus = 0;
    this.board.fillRandom();
    let guard = 0;
    while (!this.matchSystem.hasPossibleMove() && ++guard < 20) this.board.fillRandom();
    this.animation = new Animation();
    this.effects = new Effects();
    this.selected = null;
    this.freezeTime = 0;
    this.gameplayActive = true;
    this.resetMoveHint();
    this.state = State.IDLE;
    if (this.resultEl) {
      this.resultEl.classList.remove('show', 'win', 'lose');
      this.resultEl.setAttribute('aria-hidden', 'true');
    }
    this.updateHUD(null);
    this.updateLevelHUD();
  }

  startNextLevel() {
    const next = Math.min(this.currentLevel.id + 1, FIRST_PLANET.levels.length);
    this.selectLevel(next);
  }

  /** เริ่มลูปหลัก */
  start() {
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(time) {
    const dt = Math.min(32, time - this.lastTime); // กันเฟรมกระโดดตอนสลับแท็บ
    this.lastTime = time;

    if (this.freezeTime > 0) {
      this.freezeTime -= dt; // hit-stop: โลกหยุดชั่วขณะ แต่ยังวาดเฟรมค้างไว้
    } else {
      this.animation.update(dt);
      this.effects.update(dt);
    }
    if (this.gameplayActive && this.state === State.IDLE && this.levelSystem.canMove) {
      this.idleMs += dt;
      if (!this.hintMove && this.idleMs >= 6500) this.hintMove = this.matchSystem.findPossibleMove();
    }
    if (this.hintMove) this.applyHintMotion(time);
    this.renderer.draw(this.board, this.selected, time, this.effects, this.hintMove);

    requestAnimationFrame((t) => this.loop(t));
  }

  /** หยุดโลกสั้นๆ ตอนอิมแพกต์ — ของแรงกว่าทับของเบากว่า */
  hitStop(ms) {
    this.freezeTime = Math.max(this.freezeTime, ms);
  }

  resetMoveHint() {
    if (this.hintMove) {
      for (const cell of [this.hintMove.from, this.hintMove.to]) {
        if (cell.candy) { cell.candy.offsetX = 0; cell.candy.offsetY = 0; }
      }
    }
    this.idleMs = 0;
    this.hintMove = null;
  }

  applyHintMotion(time) {
    const { from, to } = this.hintMove;
    if (!from.candy || !to.candy) return this.resetMoveHint();
    const dx = Math.sign(to.col - from.col), dy = Math.sign(to.row - from.row);
    const nudge = 1.5 + 1.5 * Math.sin(time / 240);
    from.candy.offsetX = dx * nudge; from.candy.offsetY = dy * nudge;
    to.candy.offsetX = -dx * nudge; to.candy.offsetY = -dy * nudge;
  }

  // =====================================================
  // การเลือก + สลับ
  // =====================================================

  /** ผู้เล่นแตะช่อง (col,row) */
  handleTap(pos) {
    this.resetMoveHint();
    this.sfx.ensureCtx(); // ปลุก AudioContext (ต้องทำหลัง gesture ผู้ใช้เท่านั้น) — เรียกซ้ำได้ ราคาถูก
    if (this.state !== State.IDLE || !this.levelSystem.canMove) return;
    const cell = this.board.getCell(pos.col, pos.row);
    if (!cell || cell.isEmpty) return;

    // แตะไอเทมพิเศษครั้งเดียว = ใช้ทันที (หากต้องการคอมโบกับไอเทมข้างๆ ยังใช้การปัดได้)
    if (cell.candy.special) {
      this.selected = null;
      this.activateSpecialTap(cell);
      return;
    }

    // ยังไม่ได้เลือกอะไร → เลือกช่องนี้
    if (!this.selected) {
      this.selected = cell;
      this.sfx.select();
      const C = this.renderer.constructor.CELL;
      this.effects.burst(cell.col * C + C / 2, cell.row * C + C / 2, '#ffffff', 5);
      return;
    }
    // แตะช่องเดิม → ยกเลิกการเลือก
    if (this.selected === cell) {
      this.selected = null;
      return;
    }
    // แตะช่องติดกัน → สลับ
    if (this.selected.isAdjacentTo(cell)) {
      const from = this.selected;
      this.selected = null;
      this.swap(from, cell);
      return;
    }
    // แตะช่องไกล → ย้ายการเลือกมาช่องใหม่ (spec: ไม่ติดกัน = ไม่สลับ)
    this.selected = cell;
  }

  /** ผู้เล่นปัดจากช่อง (col,row) ไปทิศติดกัน — สลับทันทีโดยไม่ต้องแตะ 2 ครั้ง */
  handleSwipe(fromPos, toPos) {
    this.resetMoveHint();
    this.sfx.ensureCtx();
    if (this.state !== State.IDLE || !this.levelSystem.canMove) return;
    const from = this.board.getCell(fromPos.col, fromPos.row);
    const to = this.board.getCell(toPos.col, toPos.row);
    if (!from || !to || from.isEmpty || to.isEmpty) return;

    this.selected = null; // ปัดตัดการเลือกค้างจากแท็บก่อนหน้าทิ้ง
    this.swap(from, to);
  }

  /** แตะใช้ไอเทมพิเศษจากช่องเดิม โดยไม่ต้องสลับกับเจมข้างเคียง */
  async activateSpecialTap(cell) {
    if (this.state !== State.IDLE || !cell.candy || !cell.candy.special) return;
    this.state = State.ANIMATING;
    this.levelSystem.useMove();
    this.updateLevelHUD();
    const clear = new Set([cell]);

    const info = this.matchSystem.expandClears(clear);
    await this.animateRocketFlights(info.rocketFlights);
    await this.clearStep(clear, [], {
      chain: 1,
      bombs: info.bombs,
      novas: info.novas,
      comets: info.comets,
      rockets: info.rockets,
    });
    await this.dropAndRefill();
    await this.resolveCascade(this.matchSystem.findMatches(), null, 2);

    if (!this.matchSystem.hasPossibleMove()) {
      let guard = 0;
      do {
        this.board.fillRandom();
      } while (!this.matchSystem.hasPossibleMove() && ++guard < 20);
    }
    this.state = State.IDLE;
    this.showLevelResult();
  }

  /**
   * สลับลูกกวาด 2 ช่องพร้อมอนิเมชัน
   * โนวา → ล้างสีทันที | มี match → resolve cascade | ไม่มี → สลับกลับ
   */
  async swap(a, b) {
    this.state = State.ANIMATING;

    this.sfx.swap();
    await this.animateSwap(a, b);
    // หลังสลับ ตัวพิเศษย้ายไปอยู่ที่ cell a,b (สลับกัน)
    const sa = a.candy && a.candy.special, sb = b.candy && b.candy.special;

    if (sa && sb) {
      this.levelSystem.useMove(); this.updateLevelHUD();
      // ตัวพิเศษ 2 ตัวชนกัน = คอมโบรวมร่าง
      await this.activateSpecialSwap(a, b);
    } else if (sa === 'nova' || sb === 'nova') {
      this.levelSystem.useMove(); this.updateLevelHUD();
      // โนวาเดี่ยว + เม็ดปกติ = ล้างสีของอีกฝั่ง
      await this.activateNovaSwap(a, b);
    } else if (sa || sb) {
      this.levelSystem.useMove(); this.updateLevelHUD();
      // จรวด/ระเบิดเดี่ยว + เม็ดปกติ = จุดชนวนในที่
      await this.activateSpecialSwap(a, b);
    } else {
      const matches = this.matchSystem.findMatches();
      if (matches.length === 0) {
        // ไม่เกิด match → สลับกลับเร็วกว่าขาไป + สั่นจอเบาๆ บอกว่า "ไม่ได้นะ"
        this.sfx.invalid();
        this.effects.shake(2.5, 130);
        await this.animateSwap(a, b, Game.SWAP_DURATION * 0.75);
        this.state = State.IDLE;
        return;
      }
      // ตัวพิเศษเกิดตรงช่องปลายทางที่ผู้เล่นสลับไป (b)
      this.levelSystem.useMove(); this.updateLevelHUD();
      await this.resolveCascade(matches, b);
    }

    // กันเกมตัน: ถ้าไม่เหลือตาเดิน สับกระดานใหม่จนเดินได้
    if (!this.matchSystem.hasPossibleMove()) {
      let guard = 0;
      do {
        this.board.fillRandom();
      } while (!this.matchSystem.hasPossibleMove() && ++guard < 20);
    }

    this.state = State.IDLE;
    this.showLevelResult();
  }

  /** สลับข้อมูล + เลื่อนภาพนุ่มๆ แบบ ease-in-out พร้อมบีบ/ยืดตามแนวสลับ (เรียกซ้ำ = สลับกลับ) */
  animateSwap(a, b, duration = Game.SWAP_DURATION) {
    const C = Renderer.CELL;
    const dx = (b.col - a.col) * C;
    const dy = (b.row - a.row) * C;
    const horizontal = dx !== 0;

    // สลับข้อมูลทันที แล้วตั้ง offset ให้ "ภาพ" ยังอยู่ที่เดิม จากนั้น tween เข้า 0
    this.board.swapCandies(a, b);
    b.candy.offsetX = -dx; b.candy.offsetY = -dy;
    a.candy.offsetX = dx;  a.candy.offsetY = dy;

    // ยืดตามแนวเคลื่อนที่ + บีบตามขวางเล็กน้อย (squash & stretch แบบการ์ตูนคลาสสิก)
    const stretchPeak = horizontal ? { scaleX: 0.16, scaleY: -0.12 } : { scaleX: -0.12, scaleY: 0.16 };

    return Promise.all([
      this.animation.tween(a.candy, { offsetX: 0, offsetY: 0 }, duration, Easing.easeInOutQuad),
      this.animation.tween(b.candy, { offsetX: 0, offsetY: 0 }, duration, Easing.easeInOutQuad),
      this.animation.bump(a.candy, stretchPeak, duration),
      this.animation.bump(b.candy, stretchPeak, duration),
    ]);
  }

  /**
   * ลูป cascade: วางแผนเคลียร์ → ขยาย (ระเบิด/โนวา) → แตก → หล่น → เติม → วนจนนิ่ง
   * @param {Array} matches ผลจาก findMatches() รอบแรก
   * @param {import('../board/Cell.js').Cell|null} swapCell ช่องที่ผู้เล่นสลับ (ให้ตัวพิเศษเกิดตรงนั้น)
   * @param {number} startChain ลำดับชั้นเริ่มต้น (nova swap ต่อที่ชั้น 2)
   */
  async resolveCascade(matches, swapCell = null, startChain = 1) {
    let chain = startChain;

    while (matches.length > 0) {
      const { clear, spawns } = this.matchSystem.planClears(matches, chain === startChain ? swapCell : null);
      const info = this.matchSystem.expandClears(clear);
      await this.animateRocketFlights(info.rocketFlights);
      await this.clearStep(clear, spawns, { chain, bombs: info.bombs, novas: info.novas, comets: info.comets, rockets: info.rockets });
      await this.dropAndRefill();

      matches = this.matchSystem.findMatches();
      chain++;
    }
  }

  /**
   * สลับโนวา: ล้างสีของอีกฝั่งทั้งกระดาน (โนวา + โนวา = ล้างทั้งกระดาน!)
   * หลัง swap แล้ว a ถือลูกกวาดเดิมของ b และกลับกัน
   */
  async activateNovaSwap(a, b) {
    const novaCell = a.candy.special === 'nova' ? a : b;
    const otherCell = novaCell === a ? b : a;
    const clear = new Set([novaCell]);

    if (otherCell.candy.special === 'nova') {
      // โนวาคู่ = ล้างทั้งกระดาน
      this.board.forEachCell((c) => { if (c.candy) clear.add(c); });
    } else {
      const target = otherCell.candy.type;
      this.board.forEachCell((c) => {
        if (c.candy && c.candy.type === target && !c.candy.special) clear.add(c);
      });
    }

    // ซ่อนไอเทมก่อนปิด special กันเฟรมที่วาดกลับเป็นเจมธรรมดาระหว่างเตรียมเอฟเฟกต์
    novaCell.candy.scale = 0;
    // ตั้ง special ของโนวาเป็น null ก่อนขยาย — กันโนวาตัวเองยิงล้างสีสุ่มซ้ำ
    novaCell.candy.special = null;
    const info = this.matchSystem.expandClears(clear);
    await this.animateRocketFlights(info.rocketFlights);
    await this.clearStep(clear, [], { chain: 1, bombs: info.bombs, novas: info.novas + 1, comets: info.comets, rockets: info.rockets,
      novaOrigins: [[novaCell.col * Renderer.CELL + Renderer.CELL / 2, novaCell.row * Renderer.CELL + Renderer.CELL / 2]] });
    await this.dropAndRefill();

    // ต่อ cascade ตามปกติ (นับเป็นชั้น 2 ขึ้นไป)
    await this.resolveCascade(this.matchSystem.findMatches(), null, 2);
  }

  /**
   * สลับตัวพิเศษ 2 ตัว = ท่ารวมร่าง (ประยุกต์จาก Shopee/Candy Crush)
   * หรือ ตัวพิเศษเดี่ยว + เม็ดปกติ = จุดชนวนในที่
   * ศูนย์กลางเอฟเฟกต์อยู่ที่ cell b (ช่องปลายทางที่ผู้เล่นสลับไป)
   */
  async activateSpecialSwap(a, b) {
    const N = this.board.size;
    const clear = new Set();
    const sp1 = a.candy && a.candy.special, sp2 = b.candy && b.candy.special;
    const both = sp1 && sp2;
    const isNova = sp1 === 'nova' || sp2 === 'nova';
    const isComet = (s) => s === 'cometH' || s === 'cometV';
    const comets = [sp1, sp2].filter(isComet).length;
    const bombs = [sp1, sp2].filter((s) => s === 'bomb').length;
    const rocketCount = [sp1, sp2].filter((s) => s === 'rocket').length;
    const pivot = b;
    const add = (c, r) => { const cc = this.board.getCell(c, r); if (cc && cc.candy) clear.add(cc); };
    const addRow = (r) => { for (let i = 0; i < N; i++) add(i, r); };
    const addCol = (c) => { for (let i = 0; i < N; i++) add(c, i); };
    const point = (cell) => [cell.col * Renderer.CELL + Renderer.CELL / 2, cell.row * Renderer.CELL + Renderer.CELL / 2];
    let rocketsFired = 0;
    const rocketFlights = [];
    const bombOrigins = [];
    const cometOrigins = [];

    if (both && isNova) {
      // โนวา + ตัวพิเศษใดๆ (รวมจรวด) = ล้างทั้งกระดาน
      this.board.forEachCell((c) => { if (c.candy) clear.add(c); });
    } else if (both && bombs === 2) {
      // ระเบิด + ระเบิด = 5x5
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) add(pivot.col + dc, pivot.row + dr);
      const [px, py] = point(pivot);
      bombOrigins.push([px - 12, py], [px + 12, py]);
    } else if (both && comets >= 1 && bombs >= 1) {
      // ดาวหาง + ระเบิด = 3 แถว + 3 คอลัมน์ (กากบาทหนา)
      for (let d = -1; d <= 1; d++) {
        addRow(pivot.row + d); addCol(pivot.col + d);
        cometOrigins.push([pivot.col * Renderer.CELL + Renderer.CELL / 2, (pivot.row + d) * Renderer.CELL + Renderer.CELL / 2, 'h']);
        cometOrigins.push([(pivot.col + d) * Renderer.CELL + Renderer.CELL / 2, pivot.row * Renderer.CELL + Renderer.CELL / 2, 'v']);
      }
      bombOrigins.push(point(pivot));
    } else if (both && comets === 2) {
      // ดาวหาง + ดาวหาง = ล้างแถว + คอลัมน์ (กากบาทเต็ม)
      addRow(pivot.row); addCol(pivot.col);
      const [px, py] = point(pivot);
      cometOrigins.push([px, py, 'h'], [px, py, 'v']);
    } else if (both && rocketCount === 2) {
      // จรวด + จรวด = ยิงจรวดล่าเป้าหมาย 5 ลูกทั่วกระดาน (ตาม AI priority เดิม)
      rocketFlights.push(...this.matchSystem.launchRockets(5, pivot, clear));
      rocketsFired = 5;
    } else if (both && rocketCount >= 1 && comets >= 1) {
      // จรวด + ดาวหาง = จรวดแปลงร่างยิงลำแสง 3 เป้าหมาย (สุ่มแถว/คอลัมน์ต่อเป้า)
      for (let i = 0; i < 3; i++) {
        const t = this.matchSystem.pickRocketTarget(pivot, clear);
        if (!t) continue;
        rocketFlights.push({ from: pivot, to: t });
        if (Math.random() < 0.5) { addRow(t.row); cometOrigins.push([...point(t), 'h']); }
        else { addCol(t.col); cometOrigins.push([...point(t), 'v']); }
        rocketsFired++;
      }
    } else if (both && rocketCount >= 1 && bombs >= 1) {
      // จรวด + ระเบิด = จรวดระเบิด 3 ลูก กระจายไปตามเป้าหมาย
      for (let i = 0; i < 3; i++) {
        const t = this.matchSystem.pickRocketTarget(pivot, clear);
        if (!t) continue;
        rocketFlights.push({ from: pivot, to: t });
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) add(t.col + dc, t.row + dr);
        bombOrigins.push(point(t));
        rocketsFired++;
      }
    } else {
      // ตัวพิเศษเดี่ยว + เม็ดปกติ = จุดชนวนในที่
      const solo = sp1 ? a : b;
      const sp = solo.candy.special;
      if (sp === 'bomb') {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) add(solo.col + dc, solo.row + dr);
        bombOrigins.push(point(solo));
      }
      else if (sp === 'cometH') { addRow(solo.row); cometOrigins.push([...point(solo), 'h']); }
      else if (sp === 'cometV') { addCol(solo.col); cometOrigins.push([...point(solo), 'v']); }
      else if (sp === 'rocket') {
        const t = this.matchSystem.pickRocketTarget(solo, clear);
        if (t) { clear.add(t); rocketFlights.push({ from: solo, to: t }); rocketsFired = 1; }
      }
    }
    clear.add(a); clear.add(b);
    // ซ่อนไอเทมพิเศษต้นทางทุกชนิดก่อนปิด special ไม่ให้แฟลชกลับเป็นเจมสีพื้น 1 เฟรม
    if (sp1 && a.candy) a.candy.scale = 0;
    if (sp2 && b.candy) b.candy.scale = 0;
    // ปิดสวิตช์ตัวพิเศษที่สลับ กันยิงซ้ำผิดตำแหน่ง (ตัวพิเศษอื่นในกองยังจุดชนวนต่อได้)
    if (a.candy) a.candy.special = null;
    if (b.candy) b.candy.special = null;

    const info = this.matchSystem.expandClears(clear);
    rocketFlights.push(...info.rocketFlights);
    await this.animateRocketFlights(rocketFlights);
    await this.clearStep(clear, [], {
      chain: 1,
      bombs: bombs + info.bombs,
      novas: (isNova ? 1 : 0) + info.novas,
      comets: comets + info.comets,
      rockets: rocketsFired + info.rockets,
      novaOrigins: [
        ...(sp1 === 'nova' ? [[a.col * Renderer.CELL + Renderer.CELL / 2, a.row * Renderer.CELL + Renderer.CELL / 2]] : []),
        ...(sp2 === 'nova' ? [[b.col * Renderer.CELL + Renderer.CELL / 2, b.row * Renderer.CELL + Renderer.CELL / 2]] : []),
      ],
      bombOrigins,
      cometOrigins,
    });
    await this.dropAndRefill();
    await this.resolveCascade(this.matchSystem.findMatches(), null, 2);
  }

  /** บินจากช่องจรวดไปยังเป้าหมายก่อนเริ่มจังหวะระเบิด */
  async animateRocketFlights(flights = []) {
    if (!flights.length) return;
    const C = Renderer.CELL;
    const valid = flights.filter((f) => f.from && f.to);
    const counts = new Map();
    const seen = new Map();
    for (const f of valid) {
      const key = f.from.col + ',' + f.from.row;
      counts.set(key, (counts.get(key) || 0) + 1);
      if (f.from.candy) f.from.candy.scale = 0;
    }
    const active = valid.map((f) => {
      const key = f.from.col + ',' + f.from.row;
      const index = seen.get(key) || 0;
      seen.set(key, index + 1);
      return {
        x0: f.from.col * C + C / 2,
        y0: f.from.row * C + C / 2,
        x1: f.to.col * C + C / 2,
        y1: f.to.row * C + C / 2,
        lane: index - (counts.get(key) - 1) / 2,
        progress: 0,
      };
    });
    this.effects.rockets.push(...active);
    await Promise.all(active.map((r) => this.animation.tween(r, { progress: 1 }, 680, Easing.linear)));
    for (const r of active) {
      const i = this.effects.rockets.indexOf(r);
      if (i >= 0) this.effects.rockets.splice(i, 1);
      this.effects.burst(r.x1, r.y1, '#ff8f5c', 12, Math.random, 1.35);
    }
  }

  /**
   * 1 สเต็ปการแตก: อนิเมชัน 2 จังหวะ → ลบ → แปลงช่องเกิดตัวพิเศษ → คิดคะแนน
   * @param {Set} clear ช่องที่จะแตก
   * @param {Array<{cell:object, type:number, special:string}>} spawns ตัวพิเศษที่จะเกิด
   * @param {{chain:number, bombs:number, novas:number}} ctx
   */
  async clearStep(clear, spawns, ctx) {
    const spawnCells = new Set(spawns.map((s) => s.cell));
    const cells = Array.from(clear);
    const C = Renderer.CELL;
    // เอฟเฟกต์เสียง + จอสั่น ตามลำดับความแรง: โนวา > ระเบิด > จรวด > pop ธรรมดา
    this.sfx.pop(ctx.chain);
    if (ctx.bombs) this.sfx.bomb();
    if (ctx.comets) this.sfx.comet();
    if (ctx.rockets) this.sfx.rocket();
    if (ctx.novas) this.sfx.nova();
    const shakeMag = (ctx.novas ? 10 : 0) + (ctx.bombs ? 6 : 0) + (ctx.comets ? 5 : 0) + (ctx.rockets ? 4 : 0) + Math.min(cells.length, 10) * 0.3;
    if (shakeMag > 0) this.effects.shake(shakeMag, 220);

    // hit-stop ตอนอิมแพกต์ใหญ่: โนวา > ระเบิด > ดาวหาง > จรวด > คอมโบยาว
    if (ctx.novas) this.hitStop(90);
    else if (ctx.bombs) this.hitStop(60);
    else if (ctx.comets) this.hitStop(50);
    else if (ctx.rockets) this.hitStop(40);
    else if (ctx.chain >= 4) this.hitStop(45);

    // พาร์ติเคิลสีลูกกวาดตัวเอง — คอมโบสูง/ตัวพิเศษ = เยอะและแรงขึ้น
    const power = 1 + (ctx.chain - 1) * 0.15;
    let sumX = 0, sumY = 0;
    const deferredBursts = [];
    for (const cell of cells) {
      const cx = cell.col * C + C / 2, cy = cell.row * C + C / 2;
      sumX += cx; sumY += cy;
      const type = cell.candy.special ? null : cell.candy.type;
      const color = type !== null ? Renderer.PALETTE[type].m : '#ffd84d';
      const burst = [cx, cy, color, cell.candy.special ? 18 : 6 + ctx.chain * 2, Math.random, cell.candy.special ? power + 0.5 : power];
      if (ctx.bombs || ctx.comets || ctx.novas) deferredBursts.push(burst);
      else this.effects.burst(...burst);
    }

    const bombOrigins = [...(ctx.bombOrigins || [])];
    if (ctx.bombs && cells.length) {
      const bombCells = cells.filter((cell) => cell.candy && cell.candy.special === 'bomb');
      for (const cell of bombCells) {
        bombOrigins.push([cell.col * C + C / 2, cell.row * C + C / 2]);
      }
      // คอมโบปิด special ก่อนเข้าฟังก์ชันนี้: ใช้ศูนย์กลางกลุ่มเคลียร์เป็นจุดระเบิดแทน
      for (let i = bombCells.length; i < ctx.bombs; i++) {
        bombOrigins.push([sumX / cells.length, sumY / cells.length]);
      }
    }

    const cometOrigins = [...(ctx.cometOrigins || []), ...cells
      .filter((cell) => cell.candy && (cell.candy.special === 'cometH' || cell.candy.special === 'cometV'))
      .map((cell) => [cell.col * C + C / 2, cell.row * C + C / 2, cell.candy.special === 'cometH' ? 'h' : 'v'])];
    if (ctx.comets && cometOrigins.length < ctx.comets && cells.length) {
      const cols = cells.map((cell) => cell.col), rows = cells.map((cell) => cell.row);
      const axis = Math.max(...cols) - Math.min(...cols) >= Math.max(...rows) - Math.min(...rows) ? 'h' : 'v';
      while (cometOrigins.length < ctx.comets) cometOrigins.push([sumX / cells.length, sumY / cells.length, axis]);
    }
    const novaOrigins = [...(ctx.novaOrigins || [])];
    for (const cell of cells) {
      if (cell.candy && cell.candy.special === 'nova') novaOrigins.push([cell.col * C + C / 2, cell.row * C + C / 2]);
    }
    while (ctx.novas && novaOrigins.length < ctx.novas && cells.length) {
      novaOrigins.push([sumX / cells.length, sumY / cells.length]);
    }

    // ป้าย COMBO กลางกระดานเมื่อ cascade ต่อเนื่อง
    if (ctx.chain >= 2) {
      this.effects.floatText(256, 205, 'COMBO x' + ctx.chain, '#ffd84d', true);
    }

    // อนิเมชันแตกแบบ 2 จังหวะ: พองขึ้นวูบ (anticipation) → หดหายแบบไล่คลื่น (ripple)
    const popping = cells.filter((cell) => !spawnCells.has(cell));
    await Promise.all(popping.map((cell) => this.animation.bump(cell.candy, { scale: 0.18 }, 70)));
    if (ctx.bombs || ctx.comets || ctx.novas) {
      // ณ จังหวะ impact ซ่อนเจมก่อน แล้วค่อยปล่อยแฟลช/ลำแสง/เศษประกาย
      for (const cell of popping) cell.candy.scale = 0;
      for (const burst of deferredBursts) this.effects.burst(...burst);
      for (const [x, y] of bombOrigins) this.effects.bombBlast(x, y);
      for (const [x, y, axis] of cometOrigins) this.effects.cometSweep(x, y, axis);
      for (const [x, y] of novaOrigins) this.effects.novaWave(x, y);
    }
    await Promise.all(
      popping.map((cell, i) =>
        this.animation.tween(cell.candy, { scale: 0 }, Game.POP_DURATION, Easing.easeInQuad, Math.min(i * 14, 140))
      )
    );
    for (const cell of popping) cell.candy = null;

    // แปลงช่องเกิดตัวพิเศษ: ลูกกวาดใหม่สีเดิม + ติดตั้ง special แบบ pop-in เด้งเข้า
    for (const s of spawns) {
      const candy = new Candy(s.type);
      candy.special = s.special;
      candy.scale = 0;
      s.cell.candy = candy;
      this.animation.tween(candy, { scale: 1 }, 220, Easing.easeOutBack);
    }

    // คิดคะแนน: นับทุกช่องที่ถูกเคลียร์ (รวมช่องที่แปลงเป็นตัวพิเศษ) + โบนัสระเบิด/โนวา
    const result = this.scoreSystem.addMatchScore(cells, ctx);
    this.levelSystem.recordScore(this.scoreSystem.score);
    this.updateHUD(result);

    // เลขคะแนนลอยขึ้นตรงจุดศูนย์กลางของกลุ่มที่แตก — ก้อนโตตัวใหญ่
    const color = result.mult > 1.5 ? '#ffd84d' : '#ffffff';
    this.effects.floatText(sumX / cells.length, sumY / cells.length, '+' + result.gained, color, result.gained >= 200);
  }

  /** แรงโน้มถ่วง + เติมใหม่: ระยะไกลใช้เวลานานขึ้นตามจริง + เด้งลงจอด + ฝุ่นตอนกระแทก */
  async dropAndRefill() {
    const C = Renderer.CELL;
    const tweens = [];
    /** เวลาไม่คงที่แล้ว — คิดตามระยะหล่น (แถว) ให้ฟีลแรงโน้มถ่วงจริง */
    const fallTime = (rows) => Math.min(140 + rows * 42, 380);
    const dustAt = []; // จุดที่จะปล่อยฝุ่นตอนลงจอด (เฉพาะหล่นไกล)

    const falls = this.gravitySystem.applyGravity();
    for (const f of falls) {
      const dist = f.toRow - f.fromRow;
      const candy = this.board.getCell(f.col, f.toRow).candy;
      candy.offsetY = -dist * C; // ภาพยังอยู่ที่เดิม
      tweens.push(this.animation.tween(candy, { offsetY: 0 }, fallTime(dist), Easing.easeOutBack));
      if (dist >= 2) dustAt.push({ x: f.col * C + C / 2, y: f.toRow * C + C * 0.82 });
    }
    const spawned = this.gravitySystem.refill();
    // นับจำนวนเม็ดใหม่ต่อคอลัมน์ เพื่อวางเป็นขบวนเหนือกระดาน ไม่ซ้อนทุกสีไว้จุดเดียว
    const spawnCounts = new Array(this.board.size).fill(0);
    for (const s of spawned) spawnCounts[s.col]++;
    for (const s of spawned) {
      const dist = spawnCounts[s.col];
      const candy = this.board.getCell(s.col, s.row).candy;
      // ทุกเม็ดในคอลัมน์ขยับระยะเท่ากัน จึงรักษาระยะห่างหนึ่งช่องตลอดการตก
      candy.offsetY = -dist * C;
      // ไล่คอลัมน์ทีละนิดให้เหมือนเครื่องขุดปล่อยเม็ดเป็นคลื่น (Mining Machine feel)
      tweens.push(this.animation.tween(candy, { offsetY: 0 }, fallTime(dist), Easing.easeOutBack, s.col * 12));
    }
    await Promise.all(tweens);

    // เสียงลงจอดกลไกเบาๆ (game feel: น้ำหนักการตก) — ครั้งเดียวต่อคลื่น ไม่สแปม
    if (dustAt.length) this.sfx.land(dustAt.length);
    // ฝุ่นเบาๆ ตรงจุดลงจอด (จำกัดจำนวนกันรก)
    for (const d of dustAt.slice(0, 8)) {
      this.effects.burst(d.x, d.y, '#cfd8ff', 3, Math.random, 0.45);
    }
  }
}
