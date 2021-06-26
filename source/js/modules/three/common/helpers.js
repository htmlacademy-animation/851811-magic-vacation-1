import * as THREE from 'three';

export const getLathePointsForCircle = (borderWidth, height, radius) => {
  const points = [];

  for (let i = radius; i <= radius + borderWidth; i++) {
    for (let j = 1; j <= height; j++) {
      points.push(new THREE.Vector2(i, j));
    }
  }

  return points;
};

export const getCircleDegrees = (degStart, degEnd) => {
  const start = THREE.Math.DEG2RAD * degStart;
  const length = THREE.Math.DEG2RAD * (degEnd - degStart);

  return {start, length};
};

export const setMeshParams = (mesh, params) => {
  if (params.position) {
    mesh.position.set(...Object.values(params.position));
  }
  if (typeof params.scale === `number`) {
    mesh.scale.set(params.scale, params.scale, params.scale);
  }
  if (typeof params.scale === `object`) {
    mesh.scale.set(...Object.values(params.scale));
  }
  if (params.rotate) {
    mesh.rotation.copy(new THREE.Euler(params.rotate.x * THREE.Math.DEG2RAD, params.rotate.y * THREE.Math.DEG2RAD, params.rotate.z * THREE.Math.DEG2RAD, params.rotationOrder || `XYZ`));
  }
  if (params.castShadow) {
    mesh.castShadow = true;
  }
  if (params.receiveShadow) {
    mesh.receiveShadow = true;
  }
};

export const getMaterial = (options = {}) => {
  const {color, ...rest} = options;

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    ...rest,
  });
};

export const getOriginalRotation = (object) => {
  return {
    x: object.rotation.x / THREE.Math.DEG2RAD,
    y: object.rotation.y / THREE.Math.DEG2RAD,
    z: object.rotation.z / THREE.Math.DEG2RAD,
  };
};

export const progressEachSetting = (initial, final, progress, tick) => {
  if (typeof initial === `number`) {
    return tick(initial, final, progress);
  }

  return Object.keys(initial).reduce((acc, key) => {
    return {...acc, [key]: progressEachSetting(initial[key], final[key], progress, tick)};
  }, {});
};

export const smootherEndEasing = (progress) => {
  //  Smoother end:
  const pseudoHalf1 = 1 / 5;
  const pseudoHalf2 = 4 / 5;

  if (progress < pseudoHalf1) {
    progress = pseudoHalf1 * (1 - Math.cos((progress * Math.PI) / (2 * pseudoHalf1)));
  } else {
    progress = pseudoHalf1 + pseudoHalf2 * Math.sin(((progress - pseudoHalf1) * Math.PI) / (2 * pseudoHalf2));
  }

  return progress;
};
