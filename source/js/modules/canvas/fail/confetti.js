import {animateProgress, animateEasing, tick} from 'js/helpers/animation';
import {skewCtx} from '../common/helpers';
import {power} from '../common/time-functions';

export default class Confetti {
  constructor({duration, ctx}) {
    this.duration = duration;
    this.ctx = ctx;

    this.canvasCenter = {
      top: window.innerHeight / 2,
      left: window.innerWidth / 2
    };

    this.rightSkew = [-0.3, 0.3];
    this.leftSkew = [0.3, -0.3];

    this.snowflake = {
      src: `img/result__images--fail/snowflake.png`,
      width: 100,
      height: 100,
      initialPosition: {...this.canvasCenter},
      position: {...this.canvasCenter},
      middlePosition: {
        top: this.canvasCenter.top + 40,
        left: this.canvasCenter.left + 100,
      },
      finalPosition: {
        top: window.innerHeight,
        left: this.canvasCenter.left + 100,
      },
      initialSkew: [...this.rightSkew],
      skew: [...this.rightSkew],
      finalSkew: [0, 0],
    };

    this.leaf = {
      src: `img/result__images--fail/leaf.png`,
      width: 120,
      height: 120,
      initialPosition: {...this.canvasCenter},
      position: {...this.canvasCenter},
      middlePosition: {
        top: this.canvasCenter.top - 150,
        left: this.canvasCenter.left + 220,
      },
      finalPosition: {
        top: window.innerHeight,
        left: this.canvasCenter.left + 220,
      },
      initialSkew: [...this.rightSkew],
      skew: [...this.rightSkew],
      finalSkew: [0, 0],
    };

    this.saturn = {
      src: `img/result__images--fail/saturn.png`,
      width: 100,
      height: 100,
      initialPosition: {...this.canvasCenter},
      position: {...this.canvasCenter},
      middlePosition: {
        top: this.canvasCenter.top + 150,
        left: this.canvasCenter.left + 220,
      },
      finalPosition: {
        top: window.innerHeight,
        left: this.canvasCenter.left + 220,
      },
      initialSkew: [...this.rightSkew],
      skew: [...this.rightSkew],
      finalSkew: [0, 0],
    };

    this.watermelon = {
      src: `img/result__images--fail/watermelon.png`,
      width: 100,
      height: 100,
      initialPosition: {...this.canvasCenter},
      position: {...this.canvasCenter},
      middlePosition: {
        top: this.canvasCenter.top + 150,
        left: this.canvasCenter.left - 320,
      },
      finalPosition: {
        top: window.innerHeight,
        left: this.canvasCenter.left - 320,
      },
      initialSkew: [...this.leftSkew],
      skew: [...this.leftSkew],
      finalSkew: [0, 0],
    };

    this.flamingo = {
      src: `img/result__images--fail/flamingo.png`,
      width: 120,
      height: 120,
      initialPosition: {...this.canvasCenter},
      position: {...this.canvasCenter},
      middlePosition: {
        top: this.canvasCenter.top - 80,
        left: this.canvasCenter.left - 250,
      },
      finalPosition: {
        top: window.innerHeight,
        left: this.canvasCenter.left - 250,
      },
      initialSkew: [...this.leftSkew],
      skew: [...this.leftSkew],
      finalSkew: [0, 0],
    };

    this.confetti = {
      snowflake: this.snowflake,
      leaf: this.leaf,
      saturn: this.saturn,
      watermelon: this.watermelon,
      flamingo: this.flamingo,
    };

    this.confettiEasingFn = (timingFraction) => power(2, timingFraction);

    this.initialScale = 0;
    this.scale = this.initialScale;
    this.finalScale = 1;

    this.opacity = 0;

    this.draw = this.draw.bind(this);
    this.drawConfettiPart = this.drawConfettiPart.bind(this);
  }

  scaleAnimationTick(from, to) {
    return (progress) => {
      this.scale = tick(from, to, progress);
    };
  }

  opacityAnimationTick(from, to) {
    return (progress) => {
      this.opacity = tick(from, to, progress);
    };
  }

  confettiPositionAnimationTick(image, from, to) {
    return (progress) => {
      this.confetti[image].position.left = tick(from.left, to.left, progress);
      this.confetti[image].position.top = tick(from.top, to.top, progress);
    };
  }

  confettiSkewAnimationTick(image, from, to) {
    return (progress) => {
      this.confetti[image].skew[0] = tick(from[0], to[0], progress);
      this.confetti[image].skew[1] = tick(from[1], to[1], progress);
    };
  }

  animate() {
    animateProgress(this.scaleAnimationTick(this.initialScale, this.finalScale), this.duration * 0.3);
    animateProgress(this.opacityAnimationTick(0, 1), this.duration * 0.2);
    Object.keys(this.confetti).map((image) => {
      animateProgress(this.confettiPositionAnimationTick(image, this.confetti[image].initialPosition, this.confetti[image].middlePosition), this.duration * 0.5);
      animateProgress(this.confettiSkewAnimationTick(image, this.confetti[image].initialSkew, this.confetti[image].finalSkew), this.duration * 0.5);
    });
    Object.keys(this.confetti).map((image) => {
      setTimeout(() => {
        animateEasing(this.confettiPositionAnimationTick(image, this.confetti[image].middlePosition, this.confetti[image].finalPosition), this.duration * 0.4, this.confettiEasingFn);
      }, this.duration * 0.9);
    });
  }

  drawConfettiPart(image) {
    this.ctx.save();
    this.ctx.translate(this.confetti[image].position.left, this.confetti[image].position.top);
    skewCtx(this.ctx, ...this.confetti[image].skew);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.confetti[image].img, 0, 0, this.confetti[image].width, this.confetti[image].height);
    this.ctx.restore();
  }

  drawConfetti() {
    this.ctx.save();
    Object.keys(this.confetti).map(this.drawConfettiPart);
    this.ctx.restore();
  }

  draw() {
    this.ctx.save();
    this.ctx.globalAlpha = this.opacity;
    this.drawConfetti();
    this.ctx.restore();
  }

  prepareImage() {
    Object.keys(this.confetti).map((image) => {
      this.confetti[image].img = new Image();
      this.confetti[image].img.src = this.confetti[image].src;
    });
  }
}
