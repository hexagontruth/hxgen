import '../styles/standard.scss';
import Player2D from '../lib/player-2d.js';
import script from '../scripts/test.js';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const config = {
  stopAt: 60,
  params: {
    duration: 60,
  },
  scripts: [
    script,
  ],
};

const player = window.player = new Player2D(canvas, config);

window.addEventListener('resize', () => {
  player.handleResize();
  player.reset();
  player.start();
});
player.start();

console.log('What hath god wrought');