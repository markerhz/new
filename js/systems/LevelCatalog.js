export const FIRST_PLANET = {
  id: 'luma',
  name: 'LUMA',
  subtitle: 'ดาวแห่งแสงแรก',
  mapAsset: 'assets/gemverse_assets/01_backgrounds/maps/planet_luma_level_map.png',
  iconAsset: 'assets/gemverse_assets/05_ui/maps/planet_luma_icon.png',
  nodePositions: [
    { x: 60, y: 86 }, { x: 42, y: 77 }, { x: 27, y: 68 }, { x: 65, y: 68 }, { x: 63, y: 55 },
    { x: 38, y: 48 }, { x: 63, y: 41 }, { x: 39, y: 34 }, { x: 58, y: 27 }, { x: 52, y: 18.5 },
  ],
  levels: [
    { id: 1, moves: 15, target: 350, stars: [350, 550, 800], lesson: 'จับคู่เจมให้ได้คะแนน', tutorial: { icon: '↔️', title: 'สลับเจม', body: 'แตะเจมสองช่องที่อยู่ติดกัน หรือลากเจม เพื่อเรียงสีเดียวกันอย่างน้อย 3 เม็ด' } },
    { id: 2, moves: 16, target: 500, stars: [500, 750, 1050], lesson: 'วางแผนก่อนใช้ Moves', tutorial: { icon: '🧭', title: 'ใช้ Moves ให้คุ้ม', body: 'การ Match สำเร็จใช้ 1 Move ลองมองหาตาที่สร้างเจมพิเศษหรือทำคอมโบต่อเนื่อง' } },
    { id: 3, moves: 17, target: 700, stars: [700, 1000, 1350], lesson: 'เรียง 4 เพื่อสร้างดาวหาง', tutorial: { icon: '☄️', title: 'สร้าง Comet', body: 'เรียงเจมสีเดียวกัน 4 เม็ดเพื่อสร้าง Comet แล้วแตะเพื่อกวาดเจมทั้งแถวหรือคอลัมน์' } },
    { id: 4, moves: 18, target: 900, stars: [900, 1250, 1650], lesson: 'จับคู่รูป L หรือ T เพื่อสร้างระเบิด' },
    { id: 5, moves: 18, target: 1150, stars: [1150, 1550, 2050], lesson: 'เรียง 5 เพื่อสร้างโนวา' },
    { id: 6, moves: 19, target: 1400, stars: [1400, 1850, 2400], lesson: 'แตะใช้ไอเทมพิเศษได้ทันที' },
    { id: 7, moves: 20, target: 1750, stars: [1750, 2250, 2900], lesson: 'ผสมไอเทมพิเศษเข้าด้วยกัน' },
    { id: 8, moves: 20, target: 2100, stars: [2100, 2650, 3350], lesson: 'สร้างคอมโบต่อเนื่อง' },
    { id: 9, moves: 21, target: 2500, stars: [2500, 3150, 3950], lesson: 'ทบทวนเครื่องมือทั้งหมด' },
    { id: 10, moves: 22, target: 3000, stars: [3000, 3750, 4700], lesson: 'บททดสอบสุดท้ายของ Luma' },
  ],
};

export const SECOND_PLANET = {
  id: 'mira',
  name: 'MIRA',
  subtitle: 'ดาวแห่งหมอกคริสตัล',
  mapAsset: 'assets/gemverse_assets/01_backgrounds/maps/planet_mira_level_map.png',
  iconAsset: 'assets/gemverse_assets/05_ui/maps/planet_mira_icon.png',
  nodePositions: [
    { x: 31, y: 87 }, { x: 52, y: 78 }, { x: 33, y: 68 }, { x: 55, y: 59 }, { x: 69, y: 50 },
    { x: 48, y: 44 }, { x: 66, y: 37 }, { x: 45, y: 31 }, { x: 29, y: 25 }, { x: 51, y: 18.5 },
  ],
  levels: [
    {
      id: 11,
      moves: 23,
      target: 3200,
      stars: [3200, 4000, 5000],
      lesson: 'ทบทวนดาวหางและเริ่มวางแผนสองตาล่วงหน้า',
      tutorial: {
        icon: '🪐',
        title: 'ภารกิจบน MIRA',
        body: 'ดาวดวงนี้ต้องวางแผนล่วงหน้า สร้างไอเทมพิเศษและต่อคอมโบเพื่อทำคะแนนให้ถึงเป้า',
      },
    },
    { id: 12, moves: 23, target: 3500, stars: [3500, 4400, 5500], lesson: 'สร้างไอเทมพิเศษก่อนใช้ทันที' },
    { id: 13, moves: 24, target: 3800, stars: [3800, 4800, 6000], lesson: 'วางระเบิดใกล้กลางกระดาน' },
    { id: 14, moves: 24, target: 4150, stars: [4150, 5200, 6500], lesson: 'ต่อ Cascade เพื่อเพิ่มตัวคูณ' },
    { id: 15, moves: 25, target: 4500, stars: [4500, 5650, 7050], lesson: 'เลือกสีให้โนวาเคลียร์ได้มากที่สุด' },
    { id: 16, moves: 25, target: 4850, stars: [4850, 6100, 7600], lesson: 'เก็บไอเทมพิเศษไว้ผสมกัน' },
    { id: 17, moves: 26, target: 5250, stars: [5250, 6600, 8200], lesson: 'ผสมดาวหางกับระเบิดเพื่อกวาดให้กว้าง' },
    { id: 18, moves: 26, target: 5650, stars: [5650, 7100, 8850], lesson: 'ใช้จรวดเปิดทางให้คอมโบต่อ' },
    { id: 19, moves: 27, target: 6050, stars: [6050, 7600, 9450], lesson: 'วางแผนทุก Move เพื่อสร้าง Chain' },
    { id: 20, moves: 28, target: 6500, stars: [6500, 8150, 10150], lesson: 'บททดสอบสุดท้ายของ MIRA' },
  ],
};

export const PLANETS = [FIRST_PLANET, SECOND_PLANET];
export const ALL_LEVELS = PLANETS.flatMap((planet) => planet.levels);
export const MAX_LEVEL = Math.max(...ALL_LEVELS.map((level) => level.id));

export function getPlanetById(id) {
  return PLANETS.find((planet) => planet.id === id) || null;
}

export function getPlanetForLevel(levelId) {
  return PLANETS.find((planet) => planet.levels.some((level) => level.id === levelId)) || null;
}

export function getLevelById(levelId) {
  return ALL_LEVELS.find((level) => level.id === levelId) || null;
}

export function unlockedAfterWin(currentUnlocked, completedLevelId) {
  return Math.max(currentUnlocked, Math.min(completedLevelId + 1, MAX_LEVEL));
}

export function starsForScore(level, score) {
  return level.stars.reduce((total, threshold) => total + (score >= threshold ? 1 : 0), 0);
}
