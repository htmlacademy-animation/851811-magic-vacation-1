import * as THREE from 'three';

import SVGObject from '../../common/svg-object';
import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
import {loadModel} from '../../common/load-model';

class IntroRoom extends THREE.Group {
  constructor() {
    super();

    this.svgs = [
      {
        name: `keyhole`,
        scale: 1,
        position: {x: -1000, y: 1000, z: 10},
      },
      {
        name: `flamingo`,
        scale: {x: -2, y: 2, z: 2},
        position: {x: -200, y: 150, z: 100},
        rotate: {x: 20, y: 0, z: 0},
      },
      {
        name: `snowflake`,
        scale: 1.2,
        position: {x: -350, y: 0, z: 100},
        rotate: {x: 20, y: 40, z: 0},
      },
      {
        name: `question`,
        position: {x: 150, y: -100, z: 100},
      },
      {
        name: `leaf-1`,
        scale: {x: -1.2, y: 1.2, z: 1.2},
        position: {x: 250, y: 200, z: 100},
      },
    ];

    this.models = [
      {
        name: `airplane`,
        type: `obj`,
        path: `img/models/airplane.obj`,
        materialReflectivity: materialReflectivity.basic,
        color: colors.White,
        scale: 0.5,
        position: {x: 70, y: 80, z: 100},
        rotate: {x: 90, y: 140, z: -30},
      },
      {
        name: `suitcase`,
        type: `gltf`,
        path: `img/models/suitcase.gltf`,
        scale: 0.4,
        position: {x: -50, y: -100, z: 30},
        rotate: {x: 40, y: -120, z: 20},
      },
      {
        name: `watermelon`,
        type: `gltf`,
        path: `img/models/watermelon.gltf`,
        scale: 1,
        position: {x: -250, y: 0, z: 40},
        rotate: {x: 0, y: 0, z: 130},
      },
    ];

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.loadSvgs();
    this.loadModels();
  }

  getMaterial(options = {}) {
    const {color, ...rest} = options;

    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      ...rest,
    });
  }

  setMeshParams(mesh, params) {
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
  }

  loadSvgs() {
    this.svgs.forEach((params) => {
      const mesh = new SVGObject({name: params.name}).getObject();
      if (!mesh) {
        return;
      }
      this.setMeshParams(mesh, params);
      this.add(mesh);
    });
  }

  loadModels() {
    this.models.forEach((params) => {
      const material = params.color && this.getMaterial({color: params.color, ...params.materialReflectivity});

      loadModel(params, material, (mesh) => {
        mesh.name = params.name;
        this.setMeshParams(mesh, params);
        this.add(mesh);
      });
    });
  }
}

export default IntroRoom;
