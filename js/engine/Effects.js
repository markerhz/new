/**
 * Effects — พาร์ติเคิล, ตัวเลขคะแนนลอย, จอสั่น
 *
 * เป็น "ข้อมูลล้วน" เหมือน Board/Candy: ไม่แตะ canvas เอง
 * Renderer เป็นคนวาด, Game เป็นคนเรียก spawn ตอนเกิดเหตุการณ์ (แตก/ระเบิด/โนวา)
 * ทำให้เทสต์ลอจิก (นับจำนวน, การหมดอายุ, การสลาย) ได้แบบ pure ใน Node เหมือนระบบอื่น
 */

/** แรงโน้มถ่วงพาร์ติเคิล (px logical / s²) */
const GRAVITY = 420;

export class Effects {
  constructor() {
    /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,color:string,size:number}>} */
    this.particles = [];
    /** @type {Array<{x:number,y:number,vy:number,life:number,maxLife:number,text:string,color:string,big:boolean}>} */
    this.floaters = [];
    /** จรวดที่กำลังบิน: progress 0..1, Renderer เป็นผู้วาด */
    this.rockets = [];
    /** วงแรงกระแทกของ Bomb */
    this.bombBlasts = [];
    /** ลำแสงกวาดของ Comet: axis = h/v */
    this.cometSweeps = [];
    /** การดูดแสงและคลื่นขยายของ Nova */
    this.novaWaves = [];

    this.shakeTime = 0;     // เวลาที่เหลือของการสั่น (ms)
    this.shakeDuration = 0; // ระยะเวลารวมของการสั่นชุดปัจจุบัน (ms) — ใช้คิดสัดส่วนสลาย
    this.shakeMag = 0;      // แอมพลิจูดตั้งต้น (px logical)
  }

  /**
   * ระเบิดพาร์ติเคิลจากจุดหนึ่ง (ตอนลูกกวาดแตก)
   * @param {number} x พิกัด logical
   * @param {number} y พิกัด logical
   * @param {string} color
   * @param {number} count จำนวนพาร์ติเคิล
   * @param {() => number} [rng] ใส่เองได้เพื่อเทสต์
   * @param {number} [power] ตัวคูณความแรง (ความเร็ว/ขนาด) — คอมโบสูง/ตัวพิเศษส่งค่า > 1
   */
  burst(x, y, color, count = 8, rng = Math.random, power = 1) {
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const speed = (60 + rng() * 120) * power;
      const maxLife = 260 + rng() * 220;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40 * power, // เหวี่ยงขึ้นเล็กน้อยก่อนตกตามแรงโน้มถ่วง
        life: maxLife,
        maxLife,
        color,
        size: rng() < (power > 1.3 ? 0.5 : 0.3) ? 4 : 2,
      });
    }
  }

  /** แฟลช + วงแรงกระแทก Bomb; เศษประกายใช้ particle ระบบเดิม */
  bombBlast(x, y, rng = Math.random) {
    this.bombBlasts.push({ x, y, life: 440, maxLife: 440 });
    this.burst(x, y, '#ff9f43', 18, rng, 1.75);
    this.burst(x, y, '#ffe0a3', 10, rng, 1.25);
  }

  cometSweep(x, y, axis, rng = Math.random) {
    this.cometSweeps.push({ x, y, axis, life: 520, maxLife: 520 });
    this.burst(x, y, '#ffd866', 8, rng, 1.35);
    this.burst(x, y, '#73d8ff', 10, rng, 1.45);
    this.burst(x, y, '#a566ff', 8, rng, 1.25);
  }

  novaWave(x, y, rng = Math.random) {
    this.novaWaves.push({ x, y, life: 650, maxLife: 650 });
    this.burst(x, y, '#a98cff', 22, rng, 1.55);
    this.burst(x, y, '#72dce3', 14, rng, 1.25);
  }

  /**
   * เลขคะแนนลอยขึ้น (ตอนคิดคะแนนจบสเต็ป)
   * @param {number} x
   * @param {number} y
   * @param {string} text เช่น "+80"
   * @param {string} [color]
   * @param {boolean} [big] ตัวใหญ่ (ใช้กับข้อความ COMBO / คะแนนก้อนโต)
   */
  floatText(x, y, text, color = '#ffffff', big = false) {
    this.floaters.push({ x, y, vy: big ? -40 : -55, life: big ? 900 : 700, maxLife: big ? 900 : 700, text, color, big });
  }

  /**
   * สั่นจอ (ตอนระเบิด/โนวาทำงาน หรือคอมโบสูง)
   * @param {number} magnitude px logical
   * @param {number} duration ms
   */
  shake(magnitude, duration) {
    // เอฟเฟกต์แรงกว่าทับของเดิมได้ แต่ไม่ให้ของเบากว่ามาตัดของแรงที่กำลังเล่นอยู่
    if (magnitude >= this.shakeMag || this.shakeTime <= 0) {
      this.shakeMag = magnitude;
      this.shakeDuration = duration;
      this.shakeTime = duration;
    }
  }

  /** ออฟเซ็ตจอสั่นปัจจุบัน (px logical) — สลายเชิงเส้นตามเวลาที่เหลือ */
  get shakeOffset() {
    if (this.shakeTime <= 0 || this.shakeDuration <= 0) return { x: 0, y: 0 };
    const k = this.shakeTime / this.shakeDuration;
    const m = this.shakeMag * k;
    return { x: (Math.random() * 2 - 1) * m, y: (Math.random() * 2 - 1) * m };
  }

  /** มีเอฟเฟกต์กำลังเล่นอยู่ไหม (เผื่ออยากรู้เฉยๆ ไม่ได้ใช้ล็อกอินพุต) */
  get busy() {
    return this.particles.length > 0 || this.floaters.length > 0 || this.rockets.length > 0 || this.bombBlasts.length > 0 || this.cometSweeps.length > 0 || this.novaWaves.length > 0 || this.shakeTime > 0;
  }

  /** เรียกทุกเฟรมจาก Game (เหมือน Animation.update) */
  update(dt) {
    const s = dt / 1000;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vy += GRAVITY * s;
      p.x += p.vx * s;
      p.y += p.vy * s;
    }

    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.life -= dt;
      if (f.life <= 0) { this.floaters.splice(i, 1); continue; }
      f.y += f.vy * s;
    }

    for (let i = this.bombBlasts.length - 1; i >= 0; i--) {
      const b = this.bombBlasts[i];
      b.life -= dt;
      if (b.life <= 0) this.bombBlasts.splice(i, 1);
    }

    for (let i = this.cometSweeps.length - 1; i >= 0; i--) {
      const c = this.cometSweeps[i];
      c.life -= dt;
      if (c.life <= 0) this.cometSweeps.splice(i, 1);
    }

    for (let i = this.novaWaves.length - 1; i >= 0; i--) {
      const n = this.novaWaves[i];
      n.life -= dt;
      if (n.life <= 0) this.novaWaves.splice(i, 1);
    }

    if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);
  }
}
