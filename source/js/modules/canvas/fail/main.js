import {getCoordsOfAngle} from 'js/helpers/math';
import {animateProgress, tick} from 'js/helpers/animation';

export default class Main {
  constructor({duration, ctx}) {
    this.duration = duration;
    this.ctx = ctx;

    this.crocodile = {
      src: `img/result__images--fail/crocodile.png`,
      width: 610,
      height: 610,
    };

    this.initialCrocodilePosition = {
      top: window.innerHeight / 2 - this.crocodile.height + 100,
      left: window.innerWidth / 2 + this.crocodile.width,
    };

    this.crocodilePosition = {...this.initialCrocodilePosition};

    this.finalCrocodilePosition = {
      top: window.innerHeight / 2 - this.crocodile.height / 2 + 110,
      left: window.innerWidth / 2 - this.crocodile.width / 2 + 30,
    };

    this.opacity = 0;

    this.initialKeyhole = {
      progress: 0.8,
    };

    this.keyhole = {
      ...this.initialKeyhole,
      color: `#AF78EC`,
      width: 150,
      height: 280,
    };

    this.keyholeArcCenter = {x: window.innerWidth / 2, y: window.innerHeight / 2};

    this.finalKeyhole = {
      progress: 1,
    };

    this.normalAngles = {start: 4 / 3 * Math.PI, end: 5 / 3 * Math.PI};
    this.arcAngles = {start: 1 / 3 * Math.PI, end: 2 / 3 * Math.PI};
    this.topCenterAngle = Math.PI * 3 / 2;

    this.backgroundColor = `#5f458c`;

    this.draw = this.draw.bind(this);
  }

  opacityAnimationTick(from, to) {
    return (progress) => {
      this.opacity = tick(from, to, progress);
    };
  }

  crocodilePositionAnimationTick(from, to) {
    return (progress) => {
      this.crocodilePosition.left = tick(from.left, to.left, progress);
      this.crocodilePosition.top = tick(from.top, to.top, progress);
    };
  }

  keyholeProgressAnimationTick(from, to) {
    return (progress) => {
      this.keyhole.progress = tick(from, to, progress);
    };
  }

  animate() {
    animateProgress(this.opacityAnimationTick(0, 1), this.duration * 0.2);
    animateProgress(this.keyholeProgressAnimationTick(this.initialKeyhole.progress, this.finalKeyhole.progress), this.duration * 0.2);
    setTimeout(() => {
      animateProgress(this.crocodilePositionAnimationTick(this.initialCrocodilePosition, this.finalCrocodilePosition), this.duration * 0.7);
    }, this.duration * 0.3);
  }

  drawCrocodile() {
    this.ctx.save();
    this.ctx.translate(this.crocodilePosition.left, this.crocodilePosition.top);
    this.ctx.drawImage(this.crocodile.img, 0, 0, this.crocodile.width, this.crocodile.height);
    this.ctx.restore();
  }

  setCoordsOfKeyhole() {
    this.arcRadius = this.keyhole.width / 2 * this.keyhole.progress;

    this.triangleLeftTopPoint = getCoordsOfAngle(this.keyholeArcCenter.x, this.keyholeArcCenter.y, this.arcRadius, this.arcAngles.end);
    this.triangleLeftBottomPoint = {x: this.keyholeArcCenter.x - this.keyhole.width * this.keyhole.progress / 2, y: this.keyholeArcCenter.y + this.keyhole.height * this.keyhole.progress - this.keyhole.width * this.keyhole.progress / 2};
    this.triangleRightTopPoint = getCoordsOfAngle(this.keyholeArcCenter.x, this.keyholeArcCenter.y, this.arcRadius, this.arcAngles.start);
    this.triangleRightBottomPoint = {x: this.keyholeArcCenter.x + this.keyhole.width * this.keyhole.progress / 2, y: this.keyholeArcCenter.y + this.keyhole.height * this.keyhole.progress - this.keyhole.width * this.keyhole.progress / 2};
  }

  drawKeyhole() {
    this.ctx.save();
    this.ctx.globalAlpha = this.opacity;
    this.ctx.beginPath();

    this.ctx.moveTo(this.triangleLeftTopPoint.x, this.triangleLeftTopPoint.y);
    this.ctx.lineTo(this.triangleLeftBottomPoint.x, this.triangleLeftBottomPoint.y);
    this.ctx.lineTo(this.triangleRightBottomPoint.x, this.triangleRightBottomPoint.y);
    this.ctx.lineTo(this.triangleRightTopPoint.x, this.triangleRightTopPoint.y);

    this.ctx.arc(this.keyholeArcCenter.x, this.keyholeArcCenter.y, this.arcRadius, this.arcAngles.start, this.arcAngles.end, true);

    this.ctx.fillStyle = this.keyhole.color;
    this.ctx.fill();

    this.ctx.restore();
  }

  drawKeyholeMask() {
    this.ctx.save();

    this.ctx.beginPath();

    this.ctx.moveTo(window.innerWidth, window.innerHeight);
    this.ctx.lineTo(this.triangleRightBottomPoint.x, window.innerHeight);
    this.ctx.lineTo(this.triangleRightBottomPoint.x, this.triangleRightBottomPoint.y);
    this.ctx.lineTo(this.triangleRightTopPoint.x, this.triangleRightTopPoint.y);
    this.ctx.arc(this.keyholeArcCenter.x, this.keyholeArcCenter.y, this.arcRadius, this.arcAngles.start, this.topCenterAngle, true);
    this.ctx.lineTo(this.keyholeArcCenter.x, 0);
    this.ctx.lineTo(window.innerWidth, 0);

    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fill();

    this.ctx.restore();
  }

  draw() {
    this.ctx.save();
    this.setCoordsOfKeyhole();
    this.drawKeyhole();
    this.drawCrocodile();
    this.drawKeyholeMask();
    this.ctx.restore();
  }

  prepareImage() {
    this.crocodile.img = new Image();
    this.crocodile.img.src = this.crocodile.src;
  }
}
