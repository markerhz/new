/** ด่านช่วงเริ่มเกม: ทำคะแนนเป้าหมายภายใน Moves ที่กำหนด */
export class LevelSystem {
  static DEFAULT_LEVEL = { id: 1, moves: 15, target: 50, stars: [50, 150, 250] };

  constructor(level = LevelSystem.DEFAULT_LEVEL) {
    this.level = { ...level, stars: [...level.stars] };
    this.moves = level.moves;
    this.score = 0;
  }

  /** ถึง Target แล้ว แต่ยังเล่นต่อได้เพื่อไล่เก็บดาวจนครบ Moves */
  get goalMet() { return this.score >= this.level.target; }
  get finished() { return this.moves <= 0; }
  get canMove() { return !this.finished; }
  get complete() { return this.finished && this.goalMet; }

  useMove() {
    if (!this.canMove) return false;
    this.moves--;
    return true;
  }

  /** คืนจำนวน Moves ที่เหลือและปิดด่าน สำหรับแปลงเป็นโบนัสหลังได้ 3 ดาว */
  cashOutMoves() {
    const remaining = Math.max(0, this.moves);
    this.moves = 0;
    return remaining;
  }

  recordScore(score) { this.score = score; }
}
