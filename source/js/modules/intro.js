import LetterAnimation from './letter-animation';

const addIntroTitleAnimation = () => {
  const element = document.querySelector(`.intro__title`);
  const animation = new LetterAnimation({
    element,
    duration: 400,
    activationClass: `intro__title--active`,
    wordClass: `intro__word`,
    letterClass: `intro__letter`,
    transitionProperty: `transform`
  });

  const previousAnimationElement = document.querySelector(`.page-header__nav`);
  previousAnimationElement.addEventListener(`animationend`, (event) => {
    if (event.animationName.match(/page-header__nav--fade-in/)) {
      animation.runAnimation();
    }
  });
};

const addIntroDateAnimation = () => {
  const element = document.querySelector(`.intro__date`);
  const animation = new LetterAnimation({
    element,
    duration: 400,
    activationClass: `intro__date--active`,
    wordClass: `intro__word`,
    letterClass: `intro__letter`,
    transitionProperty: `transform`
  });

  const previousAnimationElement = document.querySelector(`.page-header__nav`);
  const nextAnimationElement = document.querySelector(`.intro__label`);
  previousAnimationElement.addEventListener(`animationend`, (event) => {
    if (event.animationName.match(/page-header__nav--fade-in/)) {
      setTimeout(()=>{
        animation.runAnimation();
        nextAnimationElement.classList.add(`intro__label--active`);
      }, 400);
    }
  });
};

export default () => {
  addIntroTitleAnimation();
  addIntroDateAnimation();
};
