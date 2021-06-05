import {loadModel} from '../../common/load-model';
import {setMeshParams, getOriginalRotation} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import bezierEasing from '../../../canvas/common/bezier-easing';
import {animateEasingWithFramerate} from '../../../canvas/common/helpers';

const linear = bezierEasing(0.0, 0.0, 1.0, 1.0);

const count = 8;

const animationSettings = {
  easing: linear,
  duration: count * 2 * 1000,
};

const sonyaAnimationSettings = {
  ...animationSettings,
  positionY: {
    min: 70,
    max: 60,
  },
};

const handAnimationSettings = {
  ...animationSettings,
  rotate: {
    min: 0,
    max: 5,
  },
};


const sonyaParams = {
  name: `sonya`,
  type: `gltf`,
  path: `img/models/sonya.gltf`,
  scale: 0.3,
  position: {x: 30, y: sonyaAnimationSettings.positionY.max, z: 170},
  rotate: {x: 0, y: -30, z: 0},
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  }
};

const rightHandName = `RightHand`;
const leftHandName = `LeftHand`;

export default (callback) => {
  const sonyaAnimationTick = (object) => {
    return (progress) => {
      const params = calcSonyaParams(progress);
      setMeshParams(object, params);
    };
  };

  const handAnimationTick = (object, originalRotation, isRight) => {
    return (progress) => {
      const params = calcHandParams(progress, originalRotation, isRight);
      setMeshParams(object, params);
    };
  };

  const animateSonya = (object) => {
    if (!object) {
      return;
    }

    const leftHand = getHand(object, leftHandName);
    const rightHand = getHand(object, rightHandName);

    const originalLeftHandRotation = getOriginalRotation(leftHand);
    const originalRightHandRotation = getOriginalRotation(rightHand);

    const {duration, easing} = sonyaAnimationSettings;
    animateEasingWithFramerate(sonyaAnimationTick(object), duration, easing);
    animateEasingWithFramerate(handAnimationTick(leftHand, originalLeftHandRotation), duration, easing);
    animateEasingWithFramerate(handAnimationTick(rightHand, originalRightHandRotation, true), duration, easing);
  };


  loadModel(sonyaParams, null, (mesh) => {
    mesh.name = sonyaParams.name;
    setMeshParams(mesh, sonyaParams);
    callback(mesh, animateSonya);
  });
};

function calcSonyaParams(progress) {
  return {
    position: getSonyaPosition(progress),
  };
}

function getSonyaPosition(progress) {
  const {positionY} = sonyaAnimationSettings;
  const amplitude = positionY.max - positionY.min;
  const sine = Math.sin(progress * Math.PI * count);
  const y = positionY.max - amplitude * sine;

  return {...sonyaParams.position, y};
}

function calcHandParams(progress, originalRotation, isRight) {
  return {
    rotate: getHandRotate(progress, originalRotation, isRight),
  };
}

function getHandRotate(progress, originalRotation, isRight) {
  const {rotate} = handAnimationSettings;
  const amplitude = rotate.max - rotate.min;
  const sine = Math.sin(progress * Math.PI * count);
  const sign = isRight ? -1 : 1;
  const y = originalRotation.y - (amplitude * sine * sign);

  return {...originalRotation, y};
}

function getHand(sonya, name) {
  return sonya.children[0].children[0].getObjectByName(name);
}
