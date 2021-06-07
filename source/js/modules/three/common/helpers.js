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
