import throttle from 'lodash/throttle';
import gameCountdown from '../modules/countdown/animate-game-countdown';
import PrizeAmountCountdown from '../modules/countdown/animate-prize-amount';
import Scene from './webgl/story';
import sonyaAnimation from '../modules/web-animation/animate-sonya';

const PrizeType = {
  JOURNEYS: `primary`,
  CASES: `secondary`,
  CODES: `additional`,
};

const slideUpScreens = [`prizes`, `rules`, `game`];

export default class FullPageScroll {
  constructor() {
    this.THROTTLE_TIMEOUT = 2000;

    this.screenElements = document.querySelectorAll(`.screen:not(.screen--result)`);
    this.menuElements = document.querySelectorAll(`.page-header__menu .js-menu-link`);

    this.previousActiveScreen = null;
    this.activeScreen = 0;
    this.onScrollHandler = this.onScroll.bind(this);
    this.onUrlHashChengedHandler = this.onUrlHashChanged.bind(this);

    this.setScene();
  }

  init() {
    document.addEventListener(`wheel`, throttle(this.onScrollHandler, this.THROTTLE_TIMEOUT, {trailing: true}));
    window.addEventListener(`popstate`, this.onUrlHashChengedHandler);
    this.changePageDisplay();
    this.onUrlHashChanged();
    this.initScene();
  }

  onScroll(evt) {
    const currentPosition = this.activeScreen;
    this.reCalculateActiveScreenPosition(evt.deltaY);
    if (currentPosition !== this.activeScreen) {
      this.changePageDisplay();
    }
  }

  onUrlHashChanged() {
    const newIndex = Array.from(this.screenElements).findIndex((screen) => location.hash.slice(1) === screen.id);
    this.previousActiveScreen = this.activeScreen;
    this.activeScreen = (newIndex < 0) ? 0 : newIndex;
    this.changePageDisplay();
  }

  changePageDisplay() {
    this.changeVisibilityDisplay();
    this.changeActiveMenuItem();
    this.emitChangeDisplayEvent();
  }

  changeVisibilityDisplay() {
    this.screenElements.forEach((screen) => {
      screen.classList.add(`screen--hidden`);
      screen.classList.remove(`active`);
      screen.classList.remove(`screen--transitioning-in`);
      screen.classList.remove(`screen--transitioning-out`);
    });
    this.screenElements[this.activeScreen].classList.remove(`screen--hidden`);
    this.screenElements[this.activeScreen].classList.add(`active`);

    if (this.previousActiveScreen) {
      this.screenElements[this.activeScreen].classList.add(`screen--transitioning-in`);

      const isSlideUpScreen = slideUpScreens.includes(this.screenElements[this.activeScreen].id);
      if (isSlideUpScreen) {
        this.screenElements[this.previousActiveScreen].classList.add(`screen--transitioning-out`);

        this.screenElements[this.activeScreen].addEventListener(`animationend`, (event) => {
          if (event.animationName.match(/screen--bg-slide-up/)) {
            this.screenElements[this.previousActiveScreen].classList.remove(`screen--transitioning-out`);
          }
        });
      }

      const wasSlideUpScreen = slideUpScreens.includes(this.screenElements[this.previousActiveScreen].id);
      if (wasSlideUpScreen) {
        this.screenElements[this.activeScreen].classList.remove(`screen--transitioning-in`);
      }
    }

    const isPrizes = this.screenElements[this.activeScreen].id === `prizes`;
    const isGame = this.screenElements[this.activeScreen].id === `game`;

    if (isPrizes) {
      this.animatePrize({prize: `journeys`, timeout: 0});
      this.animatePrize({prize: `cases`, timeout: 5000});
      this.animatePrize({prize: `codes`, timeout: 7000, firstAmount: 11});
    }

    if (isGame) {
      gameCountdown.startCountdown();
      sonyaAnimation.start();
    }

    if (!isGame) {
      gameCountdown.endCountdown();
      sonyaAnimation.end();
    }
  }

  changeActiveMenuItem() {
    const activeItem = Array.from(this.menuElements).find((item) => item.dataset.href === this.screenElements[this.activeScreen].id);
    if (activeItem) {
      this.menuElements.forEach((item) => item.classList.remove(`active`));
      activeItem.classList.add(`active`);
    }
  }

  emitChangeDisplayEvent() {
    const event = new CustomEvent(`screenChanged`, {
      detail: {
        'screenId': this.activeScreen,
        'screenName': this.screenElements[this.activeScreen].id,
        'screenElement': this.screenElements[this.activeScreen]
      }
    });

    document.body.dispatchEvent(event);
  }

  reCalculateActiveScreenPosition(delta) {
    this.previousActiveScreen = this.activeScreen;

    if (delta > 0) {
      this.activeScreen = Math.min(this.screenElements.length - 1, ++this.activeScreen);
    } else {
      this.activeScreen = Math.max(0, --this.activeScreen);
    }
  }

  startSvgAnimation({element, activeClass, svgFile}) {
    const imageElement = element.querySelector(`img`);
    imageElement.src = `${svgFile}?${new Date().getTime()}`;

    setTimeout(() => {
      element.classList.add(activeClass);
    }, 0);
  }

  animatePrize({prize, timeout, firstAmount}) {
    document.querySelector(`.prizes__item--${prize} img`).src = ``;

    const prizeType = PrizeType[prize.toUpperCase()];

    setTimeout(() => {
      this.startSvgAnimation({
        element: document.querySelector(`.prizes__item--${prize}`),
        activeClass: `prizes__item--active`,
        svgFile: `img/${prizeType}-award-animation.svg`
      });
    }, timeout);

    const amountElement = document.querySelector(`.prizes__item--${prize} .prizes__desc b`);
    const amount = +(amountElement.innerHTML);
    const amountAnimationName = `prizes__item--amount--fade-in`;
    const amountCoundown = new PrizeAmountCountdown({element: amountElement, amount, firstAmount});

    amountElement.addEventListener(`animationstart`, (event) => {
      if (event.animationName === amountAnimationName) {
        amountCoundown.startCountdown();
      }
    });

    document.body.addEventListener(`screenChanged`, (event) => {
      const {detail} = event;
      const {screenName} = detail;

      if (screenName !== `prizes`) {
        amountCoundown.endCountdown();
      }
    });
  }

  setScene() {
    this.scene = new Scene();
  }

  initScene() {
    const init = (screenName) => {
      if (screenName === `top` || screenName === `story`) {
        this.scene.init(screenName);
      } else {
        this.scene.end();
      }
    };

    init(this.screenElements[this.activeScreen].id);

    document.body.addEventListener(`screenChanged`, (event) => {
      const {detail} = event;
      const {screenName} = detail;

      init(screenName);
    });
  }

  getScene() {
    return this.scene;
  }
}
