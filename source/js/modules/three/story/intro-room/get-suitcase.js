import * as THREE from 'three';

import {loadModel} from '../../common/load-model';
import {setMeshParams, progressEachSetting} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import bezierEasing from '../../../canvas/common/bezier-easing';
import {animateEasingWithFramerate, tick} from '../../../canvas/common/helpers';
import {getChild} from './helpers';

const easeIn = bezierEasing(0.45, 0.03, 0.85, 0.8);

const initialCoords = {x: 0, y: 0, z: 0};

const animationSettings = {
  easing: easeIn,
  duration: 2000,
};

const scaleAnimationSettings = {
  ...animationSettings,
  scale: {
    min: 0,
    max: 1,
  },
};

const positionAnimationSettings = {
  ...animationSettings,
  position: {
    min: {x: 0, y: -50, z: -30},
    max: {...initialCoords, z: 100},
  },
};

const rotationAnimationSettings = {
  ...animationSettings,
  rotate: {
    min: 90,
    max: 0,
  },
};

const flightAnimationSettings = {
  ...animationSettings,
  positionY: {
    min: 0,
    max: 200,
  },
};


const suitcaseParams = {
  name: `suitcase`,
  type: `gltf`,
  path: `img/models/suitcase.gltf`,
  scale: 0.4,
  position: {x: -50, y: -100 - flightAnimationSettings.positionY.max, z: 30},
  rotate: {x: 40, y: -120, z: 20},
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  },
};

const GroupName = {
  scale: `scale`,
  position: `position`,
  rotation: `rotation`,
  flight: `flight`,
};

export default (callback) => {
  const animateSuitcase = (object, animationEndCallback) => {
    if (!object) {
      return;
    }

    const {duration, easing} = animationSettings;
    const groups = getIsolatedChildren(object);

    Object.keys(groups).forEach((key) => {
      const group = groups[key];
      const groupTick = animationTicks[key];
      animateEasingWithFramerate(groupTick(group), duration, easing).then(key === GroupName.flight ? animationEndCallback : null);
    });
  };


  loadModel(suitcaseParams, null, (mesh) => {
    mesh.name = suitcaseParams.name;
    setMeshParams(mesh, suitcaseParams);

    const scaleGroup = getIsolationGroup(GroupName.scale, mesh);
    const positionGroup = getIsolationGroup(GroupName.position, scaleGroup);
    const rotationGroup = getIsolationGroup(GroupName.rotation, positionGroup);
    const flightGroup = getIsolationGroup(GroupName.flight, rotationGroup);

    const parentGroup = getIsolationGroup(`parent`, flightGroup);

    callback(parentGroup, animateSuitcase);
  });
};


const animationTicks = {
  [GroupName.scale]: (object) => getGenericTick(object, calcScaleParams),
  [GroupName.position]: (object) => getGenericTick(object, calcPositionParams),
  [GroupName.rotation]: (object) => getGenericTick(object, calcRotationParams),
  [GroupName.flight]: (object) => getGenericTick(object, calcFlightParams),
};

function getGenericTick(object, paramsFunc) {
  return (progress) => {
    const params = paramsFunc(progress);
    setMeshParams(object, params);
  };
}

function calcScaleParams(progress) {
  const {scale} = scaleAnimationSettings;

  return {
    scale: tick(scale.min, scale.max, progress),
  };
}

function calcPositionParams(progress) {
  const {position} = positionAnimationSettings;

  return {
    position: progressEachSetting(position.min, position.max, progress, tick),
  };
}


function calcRotationParams(progress) {
  const {rotate} = rotationAnimationSettings;

  const amplitude = rotate.max - rotate.min;
  const sine = Math.sin(progress * Math.PI);
  const x = amplitude * sine;

  return {
    rotate: {...initialCoords, x},
  };
}

function calcFlightParams(progress) {
  const {positionY} = flightAnimationSettings;

  return {
    position: {
      x: 0,
      y: tick(positionY.min, positionY.max, progress),
      z: 0,
    },
  };
}

function getIsolationGroup(name, child) {
  const group = new THREE.Group();
  group.name = name;
  group.add(child);
  return group;
}

function getIsolatedChildren(parent) {
  const flight = getChild(parent, GroupName.flight);
  const rotation = getChild(flight, GroupName.rotation);
  const position = getChild(rotation, GroupName.position);
  const scale = getChild(position, GroupName.scale);

  return {
    flight,
    rotation,
    position,
    scale,
  };
}
