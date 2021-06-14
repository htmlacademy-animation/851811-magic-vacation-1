import {loadModel} from '../../common/load-model';
import {setMeshParams, getOriginalRotation} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import bezierEasing from '../../../canvas/common/bezier-easing';
import {animateEasingWithFramerate} from '../../../canvas/common/helpers';

const withPause = bezierEasing(0.33, 0.97, 0.58, -0.06);

const count = 8;

const tailAnimationSettings = {
  rotate: {
    min: 0,
    max: 20,
  },
  easing: withPause,
  duration: count / 4 * 1000,
};

const dogParams = {
  name: `dog`,
  type: `gltf`,
  path: `img/models/dog.gltf`,
  scale: 0.3,
  position: {x: 20, y: 0, z: 200},
  rotate: {x: 0, y: 20, z: 0},
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  }
};

export default (callback) => {
  const tailAnimationTick = (object, originalRotation) => {
    return (progress) => {
      const params = calcTailParams(progress, originalRotation);
      setMeshParams(object, params);
    };
  };

  const animateTail = (object) => {
    if (!object) {
      return;
    }

    const tail = getTail(object);
    const originalTailRotation = getOriginalRotation(tail);

    const {duration, easing} = tailAnimationSettings;
    setTimeout(() => {
      animateEasingWithFramerate(tailAnimationTick(tail, originalTailRotation), duration, easing);
    }, 1000);
  };


  loadModel(dogParams, null, (mesh) => {
    mesh.name = dogParams.name;
    setMeshParams(mesh, dogParams);
    callback(mesh, animateTail);
  });
};

function calcTailParams(progress, originalRotation) {
  return {
    rotate: getTailRotate(progress, originalRotation),
  };
}

function getTailRotate(progress, originalRotation) {
  const {rotate} = tailAnimationSettings;
  const amplitude = rotate.max - rotate.min;
  const sine = Math.sin(progress * Math.PI * count);
  const x = amplitude * sine;

  return {...originalRotation, x};
}

function getTail(dog) {
  return dog.getObjectByName(`Tail`);
}
