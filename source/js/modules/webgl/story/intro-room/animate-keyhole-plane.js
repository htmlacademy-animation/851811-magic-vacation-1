import bezierEasing from '../../../canvas/common/bezier-easing';
import {animateEasingWithFramerate, tick} from '../../../canvas/common/helpers';

const easeIn = bezierEasing(0.45, 0.03, 0.85, 0.8);

const planeAnimationSettings = {
  opacity: {
    min: 100,
    max: 0,
  },
  easing: easeIn,
  duration: 500,
  timeout: 500,
};

const planeAnimationTick = (object) => {
  return (progress) => {
    object.material.opacity = tick(planeAnimationSettings.opacity.min, planeAnimationSettings.opacity.max, progress);
  };
};

export const animateKeyholePlane = (object) => {
  if (!object) {
    return;
  }

  object.material.transparent = true;

  const {duration, easing, timeout} = planeAnimationSettings;
  setTimeout(() => {
    animateEasingWithFramerate(planeAnimationTick(object), duration, easing);
  }, timeout);
};

export const resetKeyholePlane = (object) => {
  if (!object) {
    return;
  }

  object.material.opacity = 1;
};
