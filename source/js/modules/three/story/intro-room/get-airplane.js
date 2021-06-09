import * as THREE from 'three';

import {loadModel} from '../../common/load-model';
import {setMeshParams, getMaterial} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import bezierEasing from '../../../canvas/common/bezier-easing';
import {animateEasingWithFramerate, tick} from '../../../canvas/common/helpers';
import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
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
    min: {x: 70, y: -50, z: 0},
    max: initialCoords,
  },
};

const rotationAnimationSettings = {
  ...animationSettings,
  rotate: {
    min: {x: 270, y: 200, z: -240},
    max: {x: 90, y: 140, z: -30},
  },
};

const airplaneParams = {
  name: `airplane`,
  type: `obj`,
  path: `img/models/airplane.obj`,
  materialReflectivity: materialReflectivity.basic,
  color: colors.White,
  scale: 0.5,
  position: {x: 100, y: 80, z: 100},
  rotate: rotationAnimationSettings.rotate,
  ...!isMobile && {
    receiveShadow: true,
    castShadow: true,
  },
  flightAnimation: true,
};

const GroupName = {
  scale: `scale`,
  position: `position`,
  airplane: `airplane`,
};

export default (callback) => {
  const animateAirplane = (object, animationEndCallback) => {
    if (!object) {
      return;
    }

    const {duration, easing} = animationSettings;
    const groups = getIsolatedChildren(object);

    Object.keys(groups).forEach((key) => {
      const group = groups[key];
      const groupTick = animationTicks[key];
      animateEasingWithFramerate(groupTick(group), duration, easing).then(key === GroupName.airplane ? animationEndCallback : null);
    });
  };

  const material = getMaterial({color: airplaneParams.color, ...airplaneParams.materialReflectivity});

  loadModel(airplaneParams, material, (mesh) => {
    mesh.name = airplaneParams.name;
    setMeshParams(mesh, airplaneParams);

    const scaleGroup = getIsolationGroup(GroupName.scale, mesh);
    const positionGroup = getIsolationGroup(GroupName.position, scaleGroup);
    const parentGroup = getIsolationGroup(`parent`, positionGroup);

    callback(parentGroup, animateAirplane);
  });
};


const animationTicks = {
  [GroupName.scale]: (object) => getGenericTick(object, calcScaleParams),
  [GroupName.position]: (object) => getGenericTick(object, calcPositionParams),
  [GroupName.airplane]: (object) => getGenericTick(object, calcRotationParams),
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

  const offsetSine = Math.sin(progress * Math.PI - Math.PI * 1 / 9);

  return {
    position: {
      x: offsetSine * (position.max.x - position.min.x),
      y: tick(position.min.y, position.max.y, progress),
      z: tick(position.min.z, position.max.z, progress),
    },
  };
}

function calcRotationParams(progress) {
  const {rotate} = rotationAnimationSettings;

  return {
    rotate: {
      x: tick(rotate.min.y, rotate.max.y, progress),
      y: tick(rotate.min.y, rotate.max.y, progress),
      z: tick(rotate.min.z, rotate.max.z, progress ** 2),
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
  const position = getChild(parent, GroupName.position);
  const scale = getChild(position, GroupName.scale);
  const airplane = getChild(scale, GroupName.airplane);

  return {
    position,
    scale,
    airplane,
  };
}
