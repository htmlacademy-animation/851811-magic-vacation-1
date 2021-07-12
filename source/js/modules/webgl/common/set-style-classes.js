const styleMod = `background`;
const styleElementsClassnames = [
  `page-header`,
  `social-block`,
];

function setMods(mod, value, elementClassnames) {
  elementClassnames.forEach((elementClassName) => {
    const element = document.querySelector(`.${elementClassName}`);
    if (!element) {
      return;
    }

    const startsWith = `${elementClassName}_${mod}`;

    const prevBackgroundClass = [...element.classList].find((localClassName) => localClassName.startsWith(startsWith));
    element.classList.remove(prevBackgroundClass);
    if (value) {
      element.classList.add(`${startsWith}_${value}`);
    }
  });
}

export default (value) => {
  setMods(styleMod, value, styleElementsClassnames);
};
