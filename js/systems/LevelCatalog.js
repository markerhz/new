export const FIRST_PLANET = {
  id: 'luma',
  name: 'LUMA',
  subtitle: 'ดาวแห่งแสงแรก',
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

export function starsForScore(level, score) {
  return level.stars.reduce((total, threshold) => total + (score >= threshold ? 1 : 0), 0);
}
