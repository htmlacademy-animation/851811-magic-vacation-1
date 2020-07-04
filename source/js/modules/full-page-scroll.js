import throttle from 'lodash/throttle';

export default class FullPageScroll {
  constructor() {
    this.THROTTLE_TIMEOUT = 2000;

    this.screenElements = document.querySelectorAll(`.screen:not(.screen--result)`);
    this.menuElements = document.querySelectorAll(`.page-header__menu .js-menu-link`);

    this.activeScreen = 0;
    this.onScrollHandler = this.onScroll.bind(this);
    this.onUrlHashChengedHandler = this.onUrlHashChanged.bind(this);
  }

  init() {
    document.addEventListener(`wheel`, throttle(this.onScrollHandler, this.THROTTLE_TIMEOUT, {trailing: true}));
    window.addEventListener(`popstate`, this.onUrlHashChengedHandler);

    this.onUrlHashChanged();
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
      screen.classList.remove(`screen--transitioning`);
    });
    this.screenElements[this.activeScreen].classList.remove(`screen--hidden`);
    this.screenElements[this.activeScreen].classList.add(`active`);

    const isStory = this.screenElements[this.activeScreen].id === `story`;
    const isPrizes = this.screenElements[this.activeScreen].id === `prizes`;

    if (isStory) {
      this.screenElements[this.activeScreen + 1].classList.add(`screen--transitioning`);

      this.screenElements[this.activeScreen + 1].addEventListener(`animationend`, (event) => {
        if (event.animationName.match(/screen--prizes--bg-slide-up/)) {
          this.screenElements[this.activeScreen + 1].classList.remove(`screen--transitioning`);
        }
      });
    }

    if (isPrizes) {
      this.screenElements[this.activeScreen - 1].classList.add(`screen--transitioning`);

      this.screenElements[this.activeScreen].addEventListener(`animationend`, (event) => {
        if (event.animationName.match(/screen--prizes--bg-slide-up/)) {
          this.screenElements[this.activeScreen - 1].classList.remove(`screen--transitioning`);
        }
      });

      this.startSvgAnimation({ element: document.querySelector(`.prizes__item--journeys img`), svgFile: `img/primary-award-animation.svg` })
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
    if (delta > 0) {
      this.activeScreen = Math.min(this.screenElements.length - 1, ++this.activeScreen);
    } else {
      this.activeScreen = Math.max(0, --this.activeScreen);
    }
  }

  startSvgAnimation({ element, svgFile }) {
    const prevSvgFile = element.src.match(/(img\/.+)/)[0];

    if (prevSvgFile !== svgFile) {
      element.src = svgFile;
    }
  }
}
