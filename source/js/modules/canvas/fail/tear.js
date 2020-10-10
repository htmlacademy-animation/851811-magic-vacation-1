import {
  animateProgress,
  animateEasing,
  tick,
} from '../common/helpers';

import {back} from '../common/time-functions';

export default class Tear {
  constructor({duration, ctx}) {
    this.duration = duration;
    this.ctx = ctx;

    this.tear = {
      src: `img/result__images--fail/drop.png`,
      width: 32,
      height: 49,
    };

    this.initialPosition = {
      top: window.innerHeight / 2 + 120,
      left: window.innerWidth / 2 - 5,
    };

    this.position = {...this.initialPosition};

    this.finalPosition = {
      top: window.innerHeight / 2 + 200,
      left: this.initialPosition.left,
    };

    this.initalScale = [0, 0];
    this.scale = [...this.initalScale];
    this.middleScale = [1, 1];
    this.finalScale = [0.8, 0.8];

    this.middleOpacity = 1;
    this.opacity = this.middleOpacity;
    this.finalOpacity = 0;

    this.draw = this.draw.bind(this);

    this.back = (timeFraction) => back(0.2, timeFraction);

    this.shouldAnimate = true;
  }

  reset() {
    this.position = {...this.initialPosition};
    this.scale = [...this.initalScale];
    this.opacity = this.middleOpacity;
  }

  positionAnimationTick(from, to) {
    return (progress) => {
      this.position.top = tick(from.top, to.top, progress);
    };
  }

  opacityAnimationTick(from, to) {
    return (progress) => {
      this.opacity = tick(from, to, progress);
    };
  }

  scaleAnimationTick(from, to, distort) {
    return (progress) => {
      this.scale[0] = tick(from[0], to[0], distort ? Math.pow(progress, 0.2) : progress);
      this.scale[1] = tick(from[1], to[1], distort ? Math.pow(progress, 0.7) : progress);
    };
  }

  animate() {
    if (!this.shouldAnimate) {
      return;
    }
    Promise.all([
      animateEasing(this.positionAnimationTick(this.initialPosition, this.finalPosition), this.duration, this.back),
      animateProgress(this.scaleAnimationTick(this.initalScale, this.middleScale, true), this.duration * 0.4),

      new Promise((resolve) => {
        new Promise((resolveTimeout) => setTimeout(resolveTimeout, this.duration * 0.8)).then(() => {
          Promise.all([
            animateProgress(this.opacityAnimationTick(this.middleOpacity, this.finalOpacity), this.duration * 0.2),
            animateProgress(this.scaleAnimationTick(this.middleScale, this.finalScale, false), this.duration * 0.2),
          ]).then(resolve);
        });
      }),
    ]).then(() => {
      this.reset();
      this.animate();
    });
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.position.left + this.tear.width / 2 * (1 - this.scale[0]), this.position.top);
    this.ctx.scale(...this.scale);
    this.ctx.globalAlpha = this.opacity;
    this.ctx.drawImage(this.tear.img, 0, 0, this.tear.width, this.tear.height);
    this.ctx.restore();
  }

  prepareImage() {
    this.tear.img = new Image();
    this.tear.img.src = this.tear.src;
  }
}
