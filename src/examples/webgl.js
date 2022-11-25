import '../styles/standard.scss';
import PlayerGL from '../lib/player-gl.js';
import vertShader from '../shaders/default.vs';
import fragShader from '../shaders/test.fs';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const config = {
  shaders: [
    [
      vertShader,
      fragShader,
    ],
  ],
  uniforms: {
  },
};

const player = window.player = new PlayerGL(canvas, config);

window.addEventListener('resize', () => player.handleResize());
player.start();

console.log('What hath god wrought');