import {loadModel} from '../../common/load-model';
import {setMeshParams, smootherEndEasing, getOriginalRotation, progressEachSetting} from '../../common/helpers';
import isMobile from 'js/helpers/is-mobile';
import bezierEasing from 'js/helpers/bezier-easing';
import {animateEasingWithFramerate, tick} from 'js/helpers/animation';

const linear = bezierEasing(0.0, 0.0, 1.0, 1.0);

const suitcaseAnimationSettings = {
  originalScale: 0.3,
  scale: {
    0: {x: 1, y: 1, z: 1},
    30: {x: 1.25, y: 0.75, z: 1},
    40: {x: 0.75, y: 1.25, z: 1},
    50: {x: 1.15, y: 0.85, z: 1},
    65: {x: 0.95, y: 1.05, z: 1},
    75: {x: 1.05, y: 0.95, z: 1},
    100: {x: 1, y: 1, z: 1},
  },
  positionY: {
    min: 43,
    max: 0,
  },
  easing: linear,
  duration: 2000,
};

const suitcaseRotationSettings = {
  easing: smootherEndEasing,
  duration: 1500,
};

const suitcaseParams = {
  name: `suitcase`,
  type: `gltf`,
  path: `img/models/suitcase.gltf`,
  scale: 0.3,
  position: {x: -105, y: suitcaseAnimationSettings.positionY.min, z: 230},
  rotate: {x: 0, y: -20, z: 0},
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  }
};

export default (callback) => {
  const animateSuitcase = (object, animationEndCallback) => {
    if (!object) {
      return;
    }

    const {duration, easing} = suitcaseAnimationSettings;
    setTimeout(() => {
      animateEasingWithFramerate(suitcaseAnimationTick(object), duration, easing).then(animationEndCallback);
    }, 1000);
  };

  const rotateSuitcase = (rotation, object) => {
    if (!object) {
      return;
    }

    const {duration, easing} = suitcaseRotationSettings;
    const originalRotation = getOriginalRotation(object);
    animateEasingWithFramerate(suitcaseRotationTick(originalRotation, rotation, object), duration, easing);
  };


  loadModel(suitcaseParams, null, (mesh) => {
    mesh.name = suitcaseParams.name;
    setMeshParams(mesh, suitcaseParams);
    callback(mesh, animateSuitcase, rotateSuitcase);
  });
};

const suitcaseAnimationTick = (object) => {
  return (progress) => {
    const params = calcSuitcaseParams(progress);
    setMeshParams(object, params);
  };
};

function calcSuitcaseParams(progress) {
  const percent = progress * 100;

  return {
    position: getSuitcasePosition(progress),
    scale: getSuitcaseScale(percent, progress),
  };
}

function getSuitcasePosition(progress) {
  const {positionY} = suitcaseAnimationSettings;
  const amplitude = positionY.max - positionY.min;
  const sine = Math.abs((1 - progress) * Math.sin(progress * Math.PI * 3 / 2 + Math.PI / 2));
  const y = positionY.max - amplitude * sine;

  return {...suitcaseParams.position, y};
}

function getSuitcaseScale(percent, progress) {
  const {originalScale, scale} = suitcaseAnimationSettings;

  const from = getFrom(percent, scale);
  const to = getTo(percent, scale);

  return {
    x: tick(from.x, to.x, progress) * originalScale,
    y: tick(from.y, to.y, progress) * originalScale,
    z: tick(from.z, to.z, progress) * originalScale,
  };
}

const suitcaseRotationTick = (from, to, object) => {
  return (progress) => {
    setMeshParams(object, {rotate: progressEachSetting(from, to, progress, tick)});
  };
};


function getFrom(percent, array) {
  return array[closest(`from`, Object.keys(array), percent)];
}

function getTo(percent, array) {
  return array[closest(`to`, Object.keys(array), percent)];
}

function closest(by, array, value) {
  const isFrom = by === `from`;
  const filtered = array.filter((item) => isFrom ? item <= value : item >= value);
  const result = isFrom ? filtered[filtered.length - 1] : filtered[0];
  return result;
}
