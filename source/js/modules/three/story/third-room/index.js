import * as THREE from 'three';

import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
import {loadModel} from '../../common/load-model';
import {setMeshParams, getMaterial} from '../../common/helpers';
import Snowman from './snowman';
import Road from './road';
import Wall from '../../common/objects/wall';
import Cylinders from './cylinders';

class ThirdRoom extends THREE.Group {
  constructor() {
    super();

    this.models = [
      {
        name: `static`,
        type: `gltf`,
        path: `img/models/scene3-static-output-1.gltf`,
        scale: 0.3,
        position: {x: 0, y: 0, z: 0},
        rotate: {x: 0, y: -45, z: 0},
      },
      {
        name: `compass`,
        type: `gltf`,
        path: `img/models/compass.gltf`,
        scale: 0.3,
        position: {x: 0, y: 0, z: 0},
        rotate: {x: 0, y: -45, z: 0},
      },
    ];

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addWall();
    this.addSnowman();
    this.addRoad();
    this.addCylinders();
    this.loadModels();
  }

  addSnowman() {
    const snowman = new Snowman();
    setMeshParams(snowman, {
      scale: 0.35,
      position: {x: -35, y: 40, z: 140},
      rotate: {x: 10, y: 40, z: 0},
    });
    this.add(snowman);
  }

  addRoad() {
    const road = new Road();
    setMeshParams(road, {
      scale: 0.3,
      position: {x: 0, y: 0, z: 0},
      rotate: {x: 0, y: 45, z: 180},
    });
    this.add(road);
  }

  addCylinders() {
    const cylinders = new Cylinders();
    setMeshParams(cylinders, {
      scale: 0.3,
      position: {x: 0, y: 0, z: 0},
      rotate: {x: 0, y: 45, z: 180},
    });
    this.add(cylinders);
  }

  addWall() {
    const wall = new Wall({
      wallMaterialReflectivity: materialReflectivity.soft,
      wallColor: colors.SkyLightBlue,
      floorColor: colors.MountainBlue,
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

export default ThirdRoom;
