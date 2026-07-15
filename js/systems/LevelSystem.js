/** ด่านช่วงเริ่มเกม: ทำคะแนนเป้าหมายภายใน Moves ที่กำหนด */
export class LevelSystem {
  static DEFAULT_LEVEL = { id: 1, moves: 15, target: 50, stars: [50, 150, 250] };

  constructor(level = LevelSystem.DEFAULT_LEVEL) {
    this.level = { ...level, stars: [...level.stars] };
    this.moves = level.moves;
    this.score = 0;
  }

  get canMove() { return this.moves > 0 && !this.complete; }
  get complete() { return this.score >= this.level.target; }

  useMove() {
    if (!this.canMove) return false;
    this.moves--;
    return true;
  }

  recordScore(score) { this.score = score; }
}
