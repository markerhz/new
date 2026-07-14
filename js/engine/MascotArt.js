/**
 * MascotArt — 🍡 ตัวมาสกอตสไลม์พิกเซลอาร์ต ลอยประกอบฉาก (แรงบันดาลใจ "Get Poring")
 *
 * แยกไฟล์ต่างหากจาก GemArt.js โดยตั้งใจ — ไม่แตะ Rendering Architecture ของกระดานเกมเลย
 * เป็นแค่ decoration ลอยรอบๆ UI วาดลง <canvas> เล็กๆ ของตัวเอง แล้วขยับด้วย CSS/rAF
 *
 * โครงร่าง: ลำตัวกลมมนแบบหยดน้ำ (โป่งบน แบนล่างนิดๆ) + ตาจุดกลม + แก้มยุ้ย + ไฮไลต์วิ้ง
 * พาเลตพาสเทลนุ่ม (ไม่ใช้จานอัญมณีของ GemArt — คนละธีม คนละบุคลิก)
 */
export class MascotArt {
  /** ขนาดสไปรต์พิกเซล */
  static SPRITE = 28;

  /** พาเลตสไลม์ 3 สี (มิ้นท์ / ชมพู / ฟ้า) ให้ตรงโทนภาพต้นแบบ */
  static PALETTE = {
    mint: { dd: '#0d6e57', d: '#159a76', m: '#3fd6a8', l: '#8ff2ce', s: '#eafff6' },
    pink: { dd: '#a13a6a', d: '#d85a92', m: '#ff8ec0', l: '#ffbfe0', s: '#fff0f8' },
    blue: { dd: '#1c4f8a', d: '#2f78c4', m: '#5fa8f0', l: '#a8d6ff', s: '#eef8ff' },
  };

  /**
   * วาดโครงสไลม์ 1 ตัว เป็น grid สี (frame: 0=ลืมตา, 1=กะพริบตา)
   * @param {'mint'|'pink'|'blue'} colorKey
   * @param {0|1} frame
   * @returns {(string|null)[][]}
   */
  static slimeData(colorKey, frame = 0) {
    const S = MascotArt.SPRITE;
    const P = MascotArt.PALETTE[colorKey];
    const grid = [];
    for (let y = 0; y < S; y++) {
      grid[y] = [];
      for (let x = 0; x < S; x++) {
        const dx = x - 14, dy = y - 15;
        let col = null;
        // ลำตัวหยดน้ำ: วงรีโป่งบน + ฐานกว้างแบนเล็กน้อยด้านล่าง
        const topLobe = (dx * dx) / (10.5 * 10.5) + ((dy + 2) * (dy + 2)) / (9.5 * 9.5);
        const baseLobe = (dx * dx) / (11.5 * 11.5) + ((dy - 4) * (dy - 4)) / (7 * 7);
        if ((dy <= 1 && topLobe <= 1) || (dy > 1 && baseLobe <= 1 && dy <= 9)) {
          col = P.m;
          if (dy > 4) col = P.d;                      // เงาด้านล่างลำตัว
          if (dy > 7) col = P.dd;                      // เงาลึกสุดริมฐาน
          if (dy < -3 && Math.abs(dx) < 6) col = P.l;   // รับแสงด้านบน
        }
        // ไฮไลต์วิ้งมุมบนซ้าย (จุดกลมเล็ก)
        if (Math.hypot(dx + 4.5, dy + 5.5) <= 2.4) col = P.s;
        if (Math.hypot(dx + 4.5, dy + 5.5) <= 1.1) col = '#ffffff';
        // ตา 2 ข้าง (จุดกลมดำ) — เฟรม 1 กะพริบเป็นเส้นโค้งบาง
        for (const ex of [-4.2, 4.2]) {
          if (frame === 0) {
            if (Math.hypot(dx - ex, dy + 0.5) <= 1.7) col = '#241522';
            if (Math.hypot(dx - ex + 0.5, dy) <= 0.55) col = '#ffffff';
          } else {
            if (Math.abs(dy + 0.5) <= 0.55 && Math.abs(dx - ex) <= 1.7) col = '#241522';
          }
        }
        // แก้มยุ้ยสีชมพูอ่อน (สไลม์ทุกสีมีแก้มแดง — จุดเด่นน่ารักร่วม)
        if (Math.hypot(dx - 7.2, dy + 1.5) <= 1.6) col = col ? '#ff9fae55' : null;
        if (Math.hypot(dx + 7.2, dy + 1.5) <= 1.6 && col) col = '#ff9fae';
        grid[y][x] = col;
      }
    }
    return grid;
  }

  /** grid → canvas พิกเซลชัด (แพทเทิร์นเดียวกับ GemArt.gridToCanvas) */
  static gridToCanvas(grid) {
    const S = MascotArt.SPRITE;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const g = c.getContext('2d');
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      if (grid[y][x]) { g.fillStyle = grid[y][x]; g.fillRect(x, y, 1, 1); }
    }
    return c;
  }

  /**
   * ผูกมาสกอต 1 ตัวเข้ากับ <canvas> ที่มีอยู่แล้วใน DOM — วาดครั้งเดียว + ลอยเบาๆ ด้วย rAF
   * ไม่ยุ่งกับ game loop หลักเลย (ตัว engine เดิมไม่รู้จักไฟล์นี้ด้วยซ้ำ)
   * @param {HTMLCanvasElement} canvas
   * @param {'mint'|'pink'|'blue'} colorKey
   * @param {{bobAmp?:number, bobSpeed?:number, blinkEvery?:number, phase?:number}} [opts]
   */
  static mount(canvas, colorKey, opts = {}) {
    const { bobAmp = 5, bobSpeed = 1400, blinkEvery = 3800, phase = 0 } = opts;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const frames = [MascotArt.gridToCanvas(MascotArt.slimeData(colorKey, 0)), MascotArt.gridToCanvas(MascotArt.slimeData(colorKey, 1))];
    const S = MascotArt.SPRITE;
    let blinking = false;
    const startBlink = () => { blinking = true; setTimeout(() => { blinking = false; }, 140); };
    setInterval(startBlink, blinkEvery + Math.random() * 800);

    const draw = (t) => {
      const bob = Math.sin(t / bobSpeed + phase) * bobAmp;
      canvas.style.transform = `translateY(${bob.toFixed(1)}px)`;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(blinking ? frames[1] : frames[0], 0, 0, S, S, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }
}
