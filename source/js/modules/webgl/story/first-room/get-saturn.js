import * as THREE from 'three';

import Saturn from '../../common/objects/saturn';
import {setMeshParams, getOriginalRotation} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import bezierEasing from '../../../canvas/common/bezier-easing';
import {animateEasingWithFramerate} from '../../../canvas/common/helpers';

const easeIn = bezierEasing(0.45, 0.03, 0.85, 0.8);

const count = 8;

const animationSettings = {
  rotate: {
    min: 0,
    max: 10,
  },
  easing: easeIn,
  duration: count * 1000,
};

const pivotParams = {
  position: {x: 0, y: 300, z: 0},
};

const saturnParams = {
  scale: 0.2,
  position: {x: 20, y: 150 - pivotParams.position.y, z: 200},
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  }
};

export default (callback) => {
  const saturnAnimationTick = (object) => {
    return (progress) => {
      const params = calcSaturnParams(progress);
      setMeshParams(object, params);
    };
  };

  const ringAnimationTick = (object, originalRotation) => {
    return (progress) => {
      const params = calcRingParams(progress, originalRotation);
      setMeshParams(object, params);
    };
  };

  const animateSaturn = (object, animationEndCallback) => {
    if (!object) {
      return;
    }

    const {duration, easing} = animationSettings;

    const ring = getRing(object);
    const originalRingRotation = getOriginalRotation(ring);

    setTimeout(() => {
      animateEasingWithFramerate(saturnAnimationTick(object), duration, easing).then(animationEndCallback);
      animateEasingWithFramerate(ringAnimationTick(ring, originalRingRotation), duration, easing);
    }, 1000);
  };

  const saturn = new Saturn();
  setMeshParams(saturn, saturnParams);

  const pivot = new THREE.Group();
  pivot.add(saturn);
  setMeshParams(pivot, pivotParams);

  callback(pivot, animateSaturn);
};

function calcSaturnParams(progress) {
  return {
    rotate: getSaturnRotate(progress),
  };
}

function getSaturnRotate(progress) {
  const {rotate} = animationSettings;
  const amplitude = rotate.max - rotate.min;
  const sine = (1 - progress) * Math.sin(progress * Math.PI * count);
  const z = amplitude * sine;

  return {x: 0, y: 0, z};
}

function calcRingParams(progress, originalRotation) {
  return {
    rotate: getRingRotate(progress, originalRotation),
  };
}

function getRingRotate(progress, originalRotation) {
  const {rotate} = animationSettings;
  const amplitude = rotate.max - rotate.min;
  const sine = (1 - progress) * Math.sin(progress * Math.PI * count);
  const z = amplitude * sine + originalRotation.z * progress;

  return {...originalRotation, z};
}

function getRing(saturn) {
  return saturn.getObjectByName(`Ring`);
}
