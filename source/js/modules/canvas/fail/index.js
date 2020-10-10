
import Main from './main';
import Confetti from './confetti';
import Tear from './tear';
import {animateDuration} from '../common/helpers';

const ANIMATION_DURATION = 1000;
const TOTAL_DURATION = 3000;
const CANVAS_DURATION_ID = `result__canvas--fail-duration`;
const CANVAS_INIFINITE_ID = `result__canvas--fail-infinite`;

let animate = true;

export const endAnimation = () => {
  animate = false;
};

const drawDuration = async () => {
  const canvasElement = document.getElementById(CANVAS_DURATION_ID);
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  const ctx = canvasElement.getContext(`2d`);

  const main = new Main({duration: ANIMATION_DURATION, ctx});
  main.prepareImage();

  const confetti = new Confetti({duration: ANIMATION_DURATION * 0.9, ctx});
  confetti.prepareImage();

  const render = () => {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    main.draw();
    confetti.draw();

    ctx.restore();
  };

  main.animate();
  setTimeout(() => confetti.animate(), ANIMATION_DURATION * 0.1);

  animateDuration(render, TOTAL_DURATION);
};

const drawInfinite = async () => {
  const canvasElement = document.getElementById(CANVAS_INIFINITE_ID);
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  const ctx = canvasElement.getContext(`2d`);

  const tear = new Tear({duration: ANIMATION_DURATION * 2, ctx});
  tear.prepareImage();

  const render = () => {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    tear.draw();

    ctx.restore();

    if (animate) {
      requestAnimationFrame(render);
    }

    if (!animate) {
      tear.shouldAnimate = false;
    }
  };

  tear.animate();

  requestAnimationFrame(render);
};

export default async () => {
  drawDuration();
  setTimeout(() => {
    drawInfinite();
  }, ANIMATION_DURATION * 1.4);
};
