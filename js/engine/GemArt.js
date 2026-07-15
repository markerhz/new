/**
 * GemArt — 🎨 งานอาร์ตเจมทั้งหมด
 *
 * v0.6.0 (Asset Pack "Tiny Cozy Universe"): เลิกวาด facet ด้วยโค้ดสด ๆ แล้ว
 * เปลี่ยนมาโหลดสไปรต์ PNG จริงจาก assets/gemverse_assets/ (ตามสเปก Asset Pack เฟส 1)
 * แทน — ใช้พิกเซลอาร์ต 16x16 วาดจากภายนอกแทนโค้ดคำนวณเหลี่ยม/แสงสด
 *
 * สถาปัตยกรรมเดิมทุกประการ: Renderer → GemArt → Gem Drawing
 * interface เดิม: drawGem / selectionGlow / PALETTE / OUTLINE / constructor(cellSize, gap)
 * (ยังคงจุดเชื่อมเดิมทั้งหมด — Renderer.js และ Game.js ไม่ต้องแก้)
 */
export class GemArt {
  /** โฟลเดอร์ asset pack ราก (ตามโครงสร้างสเปก gemverse_assets/) */
  static ASSET_BASE = 'assets/gemverse_assets/';

  /**
   * จานสีอัญมณี 6 โทน — คงไว้ให้ Game.js ใช้สีพาร์ติเคิลตอนแตก (.m เท่านั้นที่ถูกใช้จริง)
   * ผูกกับไฟล์ภาพชื่อ gem 6 แบบใน 03_gems/ ตามลำดับ index เดิม (ห้ามสลับ ตำแหน่งอ้างอิงจาก Candy.type)
   */
  static PALETTE = [
    { m: '#FF4D6D', file: 'ruby' },     // 0 Ruby
    { m: '#FFD866', file: 'citrine' },  // 1 Citrine (เดิมชื่อ Nova Crystal)
    { m: '#34D399', file: 'emerald' },  // 2 Emerald
    { m: '#3FA9F5', file: 'sapphire' }, // 3 Sapphire (เดิมชื่อ Meteor Shard)
    { m: '#A566FF', file: 'amethyst' }, // 4 Amethyst (เดิมชื่อ Nebula Prism)
    { m: '#72DCE3', file: 'topaz' },    // 5 Aquamarine Pearl — เทอร์ควอยซ์สว่างแต่ไม่ขาวจ้า
  ];
  /** สีเส้นขอบ/ตัวหนังสือลอย (ม่วงกาแล็กซีเข้มสุด — ตรงกับ Style Guide) */
  static OUTLINE = '#170B2C';

  /** จังหวะชีวิตต่อเจม — ลอยในอวกาศคนละจังหวะ (independent timing) คงพฤติกรรมเดิมไว้ */
  static ANIM = [
    { floatAmp: 1.8, floatSpeed: 830, glowSpeed: 620 },
    { floatAmp: 2.4, floatSpeed: 640, glowSpeed: 460 },
    { floatAmp: 1.6, floatSpeed: 920, glowSpeed: 700 },
    { floatAmp: 2.1, floatSpeed: 720, glowSpeed: 540 },
    { floatAmp: 2.0, floatSpeed: 780, glowSpeed: 500 },
    { floatAmp: 1.7, floatSpeed: 870, glowSpeed: 580 },
  ];

  /** สเกลงานอาร์ตต่อชนิด — ไม่กระทบ hit area / board logic */
  static TYPE_SCALE = [1, 1, 0.86, 1, 1, 1];

  /** ชื่อไฟล์ตัวพิเศษ (ตรงกับ candy.special) → ชื่อไฟล์ใน 04_special_gems/ */
  static SPECIAL_FILES = { bomb: 'bomb', nova: 'nova', cometH: 'comet_h', cometV: 'comet_v', rocket: 'rocket' };

  constructor(cellSize, gap) {
    this.CELL = cellSize;
    this.GAP = gap;
    this.buildSprites();
  }

  /** โหลดรูปแบบ non-blocking — วาดไม่ได้จนกว่าจะโหลดเสร็จก็แค่ไม่วาดเฟรมนั้น (drawImage เงียบ ไม่ error) */
  static loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  buildSprites() {
    const B = GemArt.ASSET_BASE;
    // เจมหลัก v2 — 32x32 silhouette แยกกันชัด (ruby shield / citrine star /
    // emerald step-cut / sapphire shard / amethyst cluster / moonstone)
    // เก็บไฟล์ชุดเดิมไว้เพื่อ rollback ได้โดยไม่สูญหาย
    this.sprites = GemArt.PALETTE.map((p) => GemArt.loadImage(`${B}03_gems/v2/gem_${p.file}_v2.png`));

    // ตัวพิเศษ: แต่ละชนิดมี 3 สถานะ (idle/glow/pop) — ใช้ idle/glow สลับเป็นอนิเมชัน "หายใจ" เหมือนเดิม
    // เก็บ pop ไว้เผื่ออนาคตอยากใช้เป็นเฟรม "เพิ่งเกิด/กำลังจะระเบิด" (ยังไม่ผูกใช้งานใน v1 นี้)
    this.special = {};
    for (const [key, file] of Object.entries(GemArt.SPECIAL_FILES)) {
      const cometV3 = file === 'comet_h' || file === 'comet_v';
      const source = (state) => cometV3
        ? `${B}04_special_gems/v3/special_${file}_${state}_v3.png`
        : `${B}04_special_gems/special_${file}_${state}.png`;
      this.special[key] = {
        idle: GemArt.loadImage(source('idle')),
        glow: GemArt.loadImage(source('glow')),
        pop: GemArt.loadImage(source('pop')),
      };
    }

    // ออร่าวิ้งด้านหลังเจม — เก็บโค้ด radial gradient เดิมไว้ (เบา ไม่ต้องพึ่งไฟล์ภาพ ปรับสีได้ทุกเจมจากค่าเดียว)
    this.glowSprites = GemArt.PALETTE.map((p) => GemArt.buildGlowSprite(p.m));
    this.novaGlow = GemArt.buildGlowSprite('#ffffff');
  }

  /** ออร่าพื้นหลังทรงกลม ไล่จางจากสีกลาง — ใช้ร่วมกับทุกเจม/เป็น selection glow ด้วย */
  static buildGlowSprite(color) {
    const S = 64;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grad.addColorStop(0, color + 'aa');
    grad.addColorStop(0.45, color + '38');
    grad.addColorStop(1, color + '00');
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
    return c;
  }

  get selectionGlow() {
    return this.novaGlow;
  }

  // =====================================================
  // วาดเจม 1 เม็ด — ลอยในอวกาศ + ออร่าวิ้งเต้น (พฤติกรรม/จังหวะเดิมทุกอย่าง)
  // เปลี่ยนแค่แหล่งภาพ: จาก canvas คำนวณสด → sprite PNG ที่โหลดมา
  // =====================================================

  drawGem(ctx, cell, time = 0) {
    const C = this.CELL;
    const candy = cell.candy;
    const A = GemArt.ANIM[candy.type];

    const phase = (cell.col * 340 + cell.row * 260);
    const floatY = Math.sin((time + phase) / A.floatSpeed) * A.floatAmp * Math.min(1, candy.scale);
    const floatX = Math.sin((time + phase) / (A.floatSpeed * 1.6) + 1.7) * A.floatAmp * 0.45 * Math.min(1, candy.scale);

    // ตัวพิเศษใช้ขนาดเต็มเสมอ; ลดเฉพาะ Emerald ปกติที่ทรง step-cut ดูแน่นกว่าชนิดอื่น
    const artScale = candy.special ? 1 : GemArt.TYPE_SCALE[candy.type];
    const base = C * candy.scale * artScale;
    if (base <= 0) return;
    const width = base * candy.scaleX;
    const height = base * candy.scaleY;
    const cx = cell.col * C + C / 2 + candy.offsetX + floatX;
    const cy = cell.row * C + C / 2 + candy.offsetY + floatY;
    const px = Math.round(cx - width / 2);
    const py = Math.round(cy - height / 2);

    // ออร่าวิ้งด้านหลัง
    const pulse = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin((time + phase) / A.glowSpeed));
    const glowSize = base * 1.75;
    const glow = candy.special === 'nova' ? this.novaGlow : this.glowSprites[candy.type];
    ctx.globalAlpha = pulse;
    ctx.drawImage(glow, cx - glowSize / 2, cy - glowSize / 2, glowSize, glowSize);
    ctx.globalAlpha = 1;

    if (candy.special && GemArt.SPECIAL_FILES[candy.special]) {
      // ตัวพิเศษ: วาดสไปรต์พิเศษแทนเจมสี สลับ idle/glow เป็นจังหวะหายใจ
      const frames = this.special[candy.special];
      const frame = Math.floor(time / 260) % 2 === 0 ? frames.idle : frames.glow;
      ctx.drawImage(frame, px, py, width, height);
      return;
    }
    if (candy.type === 5) {
      // Aquamarine Pearl: เก็บแสงไว้เกือบเต็ม พร้อมดึงสีในเหลี่ยมให้ชัดขึ้น
      ctx.filter = 'brightness(0.95) saturate(1.08)';
      ctx.drawImage(this.sprites[candy.type], px, py, width, height);
      ctx.filter = 'none';
      return;
    }
    ctx.drawImage(this.sprites[candy.type], px, py, width, height);
  }
}
