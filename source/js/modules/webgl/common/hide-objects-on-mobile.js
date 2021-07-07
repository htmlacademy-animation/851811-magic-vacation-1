import isMobile from 'js/helpers/is-mobile';

const names = [`surf.obj`, `Skis`, `Ski.1`, `Ski`, `SkiStick`, `SkiStick.1`, `lantern`, `Table`, `Starfish`];

export default (parent) => {
  if (isMobile) {
    names.forEach((name) => {
      const object = parent.getObjectByName(name);
      if (object) {
        object.visible = false;
      }
    });
  }
};
