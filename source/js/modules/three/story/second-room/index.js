import * as THREE from 'three';

import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
import {loadModel} from '../../common/load-model';
import {setMeshParams, getMaterial} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import Pyramid from './pyramid';
import Lantern from './lantern';
import Wall from '../../common/objects/wall';
import getLeaves from './get-leaves';

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
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        }
      },
    ];

    this.startAnimation = this.startAnimation.bind(this);
    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addWall();
    this.loadModels();
    this.addPyramid();
    this.addLantern();
    this.addLeaves();
  }

  addPyramid() {
    const pyramid = new Pyramid();
    setMeshParams(pyramid, {
      scale: 0.32,
      position: {x: 0, y: 40, z: 110},
      rotate: {x: 0, y: 3, z: 0},
      ...!isMobile && {
        receiveShadow: true,
        castShadow: true,
      }
    });
    this.add(pyramid);
  }

  addLantern() {
    const lantern = new Lantern();
    setMeshParams(lantern, {
      scale: 0.32,
      position: {x: 120, y: 20, z: 170},
      rotate: {x: 0, y: 60, z: 0},
      ...!isMobile && {
        receiveShadow: true,
        castShadow: true,
      }
    });
    this.add(lantern);
  }

  addLeaves() {
    getLeaves((leaf1, leaf2, animateLeaves) => {
      this.add(leaf1);
      this.add(leaf2);

      this.animateLeaves = () => animateLeaves(leaf1, leaf2);
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

  startAnimation() {
    if (!this.leavesAnimated && this.animateLeaves) {
      this.animateLeaves();
      this.leavesAnimated = true;
    }
  }
}

export default SecondRoom;
