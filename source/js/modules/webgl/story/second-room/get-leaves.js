import * as THREE from 'three';

import getSvgObject from '../../common/get-svg-object';
import {setMeshParams} from '../../common/helpers';
import isMobile from 'js/helpers/is-mobile';
import bezierEasing from 'js/helpers/bezier-easing';
import {animateEasingWithFramerate} from 'js/helpers/animation';

const withPause = bezierEasing(0.33, 0.97, 0.58, -0.06);

const count = 8;

const leafAnimationSettings = {
  easing: withPause,
  duration: count / 2 * 1000,
};

const leaf1AnimationSettings = {
  ...leafAnimationSettings,
  rotate: {
    min: -3,
    max: 3,
  },
};

const leaf2AnimationSettings = {
  ...leafAnimationSettings,
  rotate: {
    min: -4,
    max: 4,
  },
};

const offset = -120;

const pivot1Params = {
  position: {x: 0, y: -180 - offset, z: 0},
};

const pivot2Params = {
  position: {x: 0, y: -60 - offset, z: 0},
};

const rotationY = 40;

const leaf1Params = {
  scale: 0.7,
  position: {x: -70, y: 90 - pivot1Params.position.y, z: 120},
  rotate: {x: 0, y: rotationY, z: 0},
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  }
};

const leaf2Params = {
  scale: 0.5,
  position: {x: -80, y: 30 - pivot2Params.position.y, z: 110},
  rotate: {x: 0, y: rotationY, z: 40},
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  }
};

export default (callback) => {
  const leftAnimationTick = (object, settings) => {
    return (progress) => {
      const params = calcLeafParams(progress, settings);
      setMeshParams(object, params);
    };
  };

  const animateLeaves = (leaf1, leaf2, animationEndCallback) => {
    if (!leaf1 || !leaf2) {
      return;
    }

    const {duration, easing} = leafAnimationSettings;

    animateEasingWithFramerate(leftAnimationTick(leaf1, leaf1AnimationSettings), duration, easing);
    animateEasingWithFramerate(leftAnimationTick(leaf2, leaf2AnimationSettings), duration, easing).then(animationEndCallback);
  };

  getSvgObject({name: `leaf-2`}, (leaf) => {
    const leaf1 = leaf.clone();
    setMeshParams(leaf1, leaf1Params);
    const leaf2 = leaf.clone();
    setMeshParams(leaf2, leaf2Params);

    const pivot1 = new THREE.Group();
    pivot1.add(leaf1);
    setMeshParams(pivot1, pivot1Params);

    const pivot2 = new THREE.Group();
    pivot2.add(leaf2);
    setMeshParams(pivot2, pivot2Params);

    callback(pivot1, pivot2, animateLeaves);
  });
};

function calcLeafParams(progress, settings) {
  return {
    rotate: getLeafRotate(progress, settings),
  };
}

function getLeafRotate(progress, settings) {
  const {rotate} = settings;
  const amplitude = rotate.max - rotate.min;
  const sine = Math.sin(progress * Math.PI * count);
  const z = amplitude * sine;

  return {x: 0, y: 0, z};
}
