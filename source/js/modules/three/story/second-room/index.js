import * as THREE from 'three';

import getSvgObject from '../../common/svg-object';
import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
import {loadModel} from '../../common/load-model';
import {setMeshParams, getMaterial} from '../../common/helpers';
import Pyramid from './pyramid';
import Lantern from './lantern';
import Wall from '../../common/objects/wall';

class SecondRoom extends THREE.Group {
  constructor() {
    super();

    this.models = [
      {
        name: `static`,
        type: `gltf`,
        path: `img/models/scene2-static-output-1.gltf`,
        scale: 0.3,
        position: {x: 0, y: 0, z: 0},
        rotate: {x: 0, y: -45, z: 0},
      },
      {
        name: `suitcase`,
        type: `gltf`,
        path: `img/models/suitcase.gltf`,
        scale: 0.3,
        position: {x: -110, y: 0, z: 230},
        rotate: {x: 0, y: -20, z: 0},
      },
    ];

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addWall();
    this.loadModels();
    this.addPyramid();
    this.addLantern();
    this.addLeaf();
  }

  addPyramid() {
    const pyramid = new Pyramid();
    setMeshParams(pyramid, {
      scale: 0.32,
      position: {x: 0, y: 40, z: 110},
      rotate: {x: 0, y: 3, z: 0},
    });
    this.add(pyramid);
  }

  addLantern() {
    const lantern = new Lantern();
    setMeshParams(lantern, {
      scale: 0.32,
      position: {x: 120, y: 20, z: 170},
      rotate: {x: 0, y: 60, z: 0},
    });
    this.add(lantern);
  }

  addLeaf() {
    getSvgObject({name: `leaf-2`}, (leaf) => {
      const leaf1 = leaf.clone();
      setMeshParams(leaf1, {
        scale: 0.7,
        position: {x: -70, y: 90, z: 100},
        rotate: {x: 0, y: 45, z: 0},
      });
      this.add(leaf1);
      const leaf2 = leaf.clone();
      setMeshParams(leaf2, {
        scale: 0.5,
        position: {x: -80, y: 30, z: 120},
        rotate: {x: 0, y: 45, z: 40},
      });
      this.add(leaf2);
    });
  }

  addWall() {
    const wall = new Wall({
      wallMaterialReflectivity: materialReflectivity.basic,
      wallColor: colors.Blue,
      floorColor: colors.BrightBlue,
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

export default SecondRoom;
