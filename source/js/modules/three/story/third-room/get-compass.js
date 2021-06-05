import {loadModel} from '../../common/load-model';
import {setMeshParams, getOriginalRotation} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import bezierEasing from '../../../canvas/common/bezier-easing';
import {animateEasingWithFramerate} from '../../../canvas/common/helpers';

const linear = bezierEasing(0.0, 0.0, 1.0, 1.0);

const count = 4;

const tailAnimationSettings = {
  rotate: {
    min: 0,
    max: 30,
  },
  easing: linear,
  duration: count * 2 * 1000,
};

const compassParams = {
  name: `compass`,
  type: `gltf`,
  path: `img/models/compass.gltf`,
  scale: 0.3,
  position: {x: 0, y: 0, z: 0},
  rotate: {x: 0, y: -45, z: 0},
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  }
};

export default (callback) => {
  const compassAnimationTick = (object, originalRotation) => {
    return (progress) => {
      const params = calcCompassParams(progress, originalRotation);
      setMeshParams(object, params);
    };
  };

  const animateCompass = (object, animationEndCallback) => {
    if (!object) {
      return;
    }

    const hand = getHand(object);
    const originalHandRotation = getOriginalRotation(hand);

    const {duration, easing} = tailAnimationSettings;
    animateEasingWithFramerate(compassAnimationTick(hand, originalHandRotation), duration, easing).then(animationEndCallback);
  };


  loadModel(compassParams, null, (mesh) => {
    mesh.name = compassParams.name;
    setMeshParams(mesh, compassParams);
    callback(mesh, animateCompass);
  });
};

function calcCompassParams(progress, originalRotation) {
  return {
    rotate: getCompassRotate(progress, originalRotation),
  };
}

function getCompassRotate(progress, originalRotation) {
  const {rotate} = tailAnimationSettings;
  const amplitude = rotate.max - rotate.min;
  const sine = Math.sin(progress * Math.PI * count) + Math.sin(progress * Math.PI * 2);
  const z = amplitude * sine + originalRotation.z * progress;

  return {...originalRotation, z};
}

function getHand(compass) {
  return compass.children[0].getObjectByName(`ArrowCenter`);
}
