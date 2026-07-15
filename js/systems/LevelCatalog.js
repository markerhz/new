export const FIRST_PLANET = {
  id: 'luma',
  name: 'LUMA',
  subtitle: 'ดาวแห่งแสงแรก',
  levels: [
    { id: 1, moves: 15, target: 50, stars: [50, 150, 250], lesson: 'จับคู่เจมให้ได้คะแนน', tutorial: { icon: '↔️', title: 'สลับเจม', body: 'แตะเจมสองช่องที่อยู่ติดกัน หรือลากเจม เพื่อเรียงสีเดียวกันอย่างน้อย 3 เม็ด' } },
    { id: 2, moves: 16, target: 100, stars: [100, 220, 360], lesson: 'วางแผนก่อนใช้ Moves', tutorial: { icon: '🧭', title: 'ใช้ Moves ให้คุ้ม', body: 'การ Match สำเร็จใช้ 1 Move ลองมองหาตาที่สร้างเจมพิเศษหรือทำคอมโบต่อเนื่อง' } },
    { id: 3, moves: 17, target: 180, stars: [180, 340, 520], lesson: 'เรียง 4 เพื่อสร้างดาวหาง', tutorial: { icon: '☄️', title: 'สร้าง Comet', body: 'เรียงเจมสีเดียวกัน 4 เม็ดเพื่อสร้าง Comet แล้วแตะเพื่อกวาดเจมทั้งแถวหรือคอลัมน์' } },
    { id: 4, moves: 18, target: 260, stars: [260, 450, 680], lesson: 'จับคู่รูป L หรือ T เพื่อสร้างระเบิด' },
    { id: 5, moves: 18, target: 350, stars: [350, 580, 850], lesson: 'เรียง 5 เพื่อสร้างโนวา' },
    { id: 6, moves: 19, target: 450, stars: [450, 720, 1020], lesson: 'แตะใช้ไอเทมพิเศษได้ทันที' },
    { id: 7, moves: 20, target: 580, stars: [580, 900, 1250], lesson: 'ผสมไอเทมพิเศษเข้าด้วยกัน' },
    { id: 8, moves: 20, target: 720, stars: [720, 1080, 1460], lesson: 'สร้างคอมโบต่อเนื่อง' },
    { id: 9, moves: 21, target: 900, stars: [900, 1320, 1750], lesson: 'ทบทวนเครื่องมือทั้งหมด' },
    { id: 10, moves: 22, target: 1100, stars: [1100, 1580, 2050], lesson: 'บททดสอบสุดท้ายของ Luma' },
  ],
};

export function starsForScore(level, score) {
  return level.stars.reduce((total, threshold) => total + (score >= threshold ? 1 : 0), 0);
}
