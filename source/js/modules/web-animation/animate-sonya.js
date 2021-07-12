const animations = {
  appear: {
    keyframes: [
      {transform: `translate(200px, 200px)`, offset: 0},
      {transform: `translate(0, -15px)`, offset: 1},
    ],
    options: {
      duration: 700,
      easing: `ease-out`,
      fill: `forwards`,
    }
  },
  idle: {
    keyframes: [
      {transform: `translate(0, -15px)`, offset: 0},
      {transform: `translate(0, 15px)`, offset: 1},
    ],
    options: {
      duration: 1000,
      easing: `ease-in-out`,
      fill: `both`,
      iterations: Infinity,
      direction: `alternate`,
    }
  }
};

class SonyaAnimation {
  constructor() {
    this.sonya = document.querySelector(`#sonya`);

    this.reduceMotion = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;
  }

  start() {
    if (!this.sonya) {
      return;
    }

    const {appear, idle} = animations;
    this.appearance = this.sonya.animate(...Object.values(appear));

    if (this.reduceMotion) {
      this.appearance.finish();
      return;
    }

    this.appearance.onfinish = () => {
      this.idle = this.sonya.animate(...Object.values(idle));
    };
  }

  end(callback) {
    if (!this.sonya || !this.appearance) {
      if (callback) {
        callback();
      }
      return;
    }

    this.appearance.cancel();
    if (this.idle) {
      this.idle.cancel();
    }

    this.appearance.reverse();
    this.appearance.play();
    this.appearance.onfinish = callback;
  }
}

const sonyaAnimation = new SonyaAnimation();

export default sonyaAnimation;
