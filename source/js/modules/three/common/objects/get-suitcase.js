import {loadModel} from '../../common/load-model';
import {setMeshParams} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import bezierEasing from '../../../canvas/common/bezier-easing';
import {animateEasingWithFramerate, tick} from '../../../canvas/common/helpers';

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
    min: -50,
    max: -93,
  },
  easing: linear,
  duration: 2000,
};

const suitcaseParams = {
  name: `suitcase`,
  type: `gltf`,
  path: `img/models/suitcase.gltf`,
  scale: 0.3,
  position: {x: -105, y: suitcaseAnimationSettings.positionY.min, z: 30},
  rotate: {x: 0, y: -20, z: 0},
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  }
};

export default (callback) => {
  const suitcaseAnimationTick = (object) => {
    return (progress) => {
      const params = calcSuitcaseParams(progress);
      setMeshParams(object, params);
    };
  };

  const animateSuitcase = (object) => {
    if (!object) {
      return;
    }

    const {duration, easing} = suitcaseAnimationSettings;
    setTimeout(() => {
      animateEasingWithFramerate(suitcaseAnimationTick(object), duration, easing);
    }, 1000);
  };


  loadModel(suitcaseParams, null, (mesh) => {
    mesh.name = suitcaseParams.name;
    setMeshParams(mesh, suitcaseParams);
    callback(mesh, animateSuitcase);
  });
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