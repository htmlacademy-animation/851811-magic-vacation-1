import * as THREE from 'three';

import getSvgObject from '../../common/svg-object';
import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
import {loadModel} from '../../common/load-model';
import {setMeshParams, getMaterial} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import Rug from './rug';
import Saturn from '../../common/objects/saturn';
import Wall from '../../common/objects/wall';

class FirstRoom extends THREE.Group {
  constructor({dark} = {}) {
    super();

    this.dark = dark;

    this.models = [
      {
        name: `static`,
        type: `gltf`,
        path: `img/models/scene${this.dark ? 4 : 1}-static-output-1.gltf`,
        scale: 0.3,
        position: {x: 0, y: 0, z: 1},
        rotate: {x: 0, y: -45, z: 0},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        }
      },
      ...this.dark
        ? [{
          name: `sonya`,
          type: `gltf`,
          path: `img/models/sonya.gltf`,
          scale: 0.3,
          position: {x: 30, y: 60, z: 170},
          rotate: {x: 0, y: -30, z: 0},
          ...!isMobile && {
            receiveShadow: true,
            castShadow: true,
          }
        }]
        : [{
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
        }],
    ];

    this.constructChildren = this.constructChildren.bind(this);
    this.constructChildren();
  }

  constructChildren() {
    this.addWall();
    this.loadModels();
    this.addFlower();
    this.addRug();
    this.addSaturn();
  }

  addFlower() {
    getSvgObject({name: this.dark ? `flower-dark` : `flower`}, (flower) => {
      setMeshParams(flower, {
        position: {x: -90, y: 130, z: 100},
        rotate: {x: 0, y: 45, z: 0},
        scale: 0.3,
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        }
      });
      this.add(flower);
    });
  }

  addRug() {
    const rug = new Rug({dark: this.dark});
    setMeshParams(rug, {
      scale: 0.3,
      position: {x: 0, y: 0, z: 0},
      rotate: {x: 0, y: 45, z: 180},
      ...!isMobile && {
        receiveShadow: true,
      }
    });
    this.add(rug);
  }

  addSaturn() {
    const saturn = new Saturn({dark: this.dark});
    setMeshParams(saturn, {
      scale: 0.3,
      position: {x: 30, y: 150, z: 100},
      ...!isMobile && {
        receiveShadow: true,
        castShadow: true,
      }
    });
    this.add(saturn);
  }

  addWall() {
    const wall = new Wall({
      wallMaterialReflectivity: materialReflectivity[this.dark ? `basic` : `soft`],
      wallColor: colors[this.dark ? `ShadowedPurple` : `Purple`],
      floorColor: colors[this.dark ? `ShadowedDarkPurple` : `DarkPurple`],
    });
    this.add(wall);
  }

  loadModels() {
    this.models.forEach((params) => {
      const material = params.color && getMaterial({color: params.color, ...params.materialReflectivity});

      loadModel(params, material, (mesh) => {
        mesh.name = params.name;
        setMeshParams(mesh, params);
        this.add(mesh);
      });
    });
  }
}

export default FirstRoom;
