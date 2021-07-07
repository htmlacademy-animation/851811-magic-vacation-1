import * as THREE from 'three';
import {isMobile} from '../../helpers';

export const getLightConfig = (z) => ({
  intro: [
    {
      light: new THREE.HemisphereLight(0xffffff, 0x444444),
      position: {x: 0, y: 300, z: 0},
    },
    {
      light: new THREE.DirectionalLight(0xffffff, 0.3),
      position: {x: 75, y: 300, z: 75},
    },
    {
      light: new THREE.AmbientLight(0x404040),
    }
  ],
  room: [
    {
      light: new THREE.DirectionalLight(0xffffff, 0.84),
      position: {x: 0, y: z * Math.tan(-15 * THREE.Math.DEG2RAD), z},
    },
    {
      light: new THREE.DirectionalLight(0xffffff, 0.5),
      position: {x: 0, y: 500, z: 0},
    },
    {
      light: new THREE.PointLight(0xf6f2ff, 0.6, 875, 2),
      position: {x: -785, y: -350, z: 710},
      ...!isMobile && {castShadow: true},
    },
    {
      light: new THREE.PointLight(0xf5ffff, 0.95, 975, 2),
      position: {x: 730, y: 800, z: 985},
      ...!isMobile && {castShadow: true},
    },
    {
      light: new THREE.AmbientLight(0x404040),
    },
    {
      light: new THREE.AmbientLight(0x404040),
    }
  ],
});

export const createLight = (lights, name) => {
  const lightGroup = new THREE.Group();

  lights.forEach(({light, position, castShadow}) => {
    if (position) {
      light.position.set(...Object.values(position));
    }
    if (castShadow) {
      light.castShadow = true;
    }
    lightGroup.add(light);
  });

  lightGroup.name = `light-${name}`;

  return lightGroup;
};
