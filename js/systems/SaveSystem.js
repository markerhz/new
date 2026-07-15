/**
 * SaveSystem — บันทึก/โหลดความคืบหน้า
 *
 * ⚠️ v0.2.0 Alpha: โครงเปล่าตามแผน — ยังไม่ implement
 *
 * แผน:
 *   v0.4.0 — localStorage (ด่าน, คะแนนสูงสุด, Joker ที่ถือ)
 *   v0.5.0 — sync กับเซิร์ฟเวอร์ (ระบบออนไลน์)
 */
export class SaveSystem {
  static KEY = 'gemverse-progress-v1';

  /**
   * บันทึกสถานะเกม
   * @param {object} data สถานะที่จะบันทึก
   */
  save(data) {
    try { localStorage.setItem(SaveSystem.KEY, JSON.stringify(data)); } catch (_) { /* storage unavailable */ }
  }

  /**
   * โหลดสถานะเกมล่าสุด
   * @returns {object|null}
   */
  load() {
    try {
      const data = JSON.parse(localStorage.getItem(SaveSystem.KEY));
      return data && typeof data === 'object' ? data : null;
    } catch (_) { return null; }
  }

  clear() {
    try { localStorage.removeItem(SaveSystem.KEY); } catch (_) { /* storage unavailable */ }
  }
}
