/**
 * SweetVerse Cosmic v0.2.4 Alpha — จุดเริ่มต้นของเกม
 * สร้าง Game แล้วเริ่มลูปหลัก
 */
import { Game } from './engine/Game.js';
import { MascotArt } from './engine/MascotArt.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);
game.start();

// มาสกอตลอยประกอบฉาก (ตกแต่งล้วนๆ แยกจาก game loop เดิมทั้งหมด — ดึงออกได้โดยไม่กระทบเกม)
document.querySelectorAll('.mascot').forEach((el) => {
  MascotArt.mount(el, el.dataset.color, {
    bobAmp: Number(el.dataset.bobAmp) || 5,
    bobSpeed: Number(el.dataset.bobSpeed) || 1400,
    phase: Number(el.dataset.phase) || 0,
  });
});
