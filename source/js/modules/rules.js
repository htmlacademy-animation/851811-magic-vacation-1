export default () => {
  const rulesItems = document.querySelectorAll(`.rules__item`);
  const lastRulesItem = rulesItems[rulesItems.length - 1];
  const rulesLink = document.querySelector(`.rules__link`);

  lastRulesItem.addEventListener(`animationend`, (event) => {
    if (event.animationName.match(/rules__item--text-fade-in/)) {
      rulesLink.classList.add(`rules__link--active`);
    }
  });
};
