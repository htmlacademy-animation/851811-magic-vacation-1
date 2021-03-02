import * as THREE from 'three';

import {loadModel} from '../../common/load-model';
import {setMeshParams, getMaterial, getCircleDegrees} from '../../common/helpers';
import materialReflectivity from '../material-reflectivity';

class Wall extends THREE.Group {
  constructor({wallMaterialReflectivity, wallColor, floorColor} = {}) {
    super();

    this.wall = {
      name: `wall`,
      type: `obj`,
      path: `img/models/WallCornerUnit.obj`,
      materialReflectivity: wallMaterialReflectivity,
      color: wallColor,
      scale: 0.3,
      position: {x: 0, y: 5, z: 1},
      rotate: {x: 0, y: -45, z: 0},
    };

    this.floor = {
      radius: 1350,
      color: floorColor,
      materialReflectivity: materialReflectivity.soft,
      segments: 8,
      start: 0,
      end: 90,
      scale: 0.3,
      position: {x: 0, y: -1, z: 0},
      rotate: {x: -90, y: -45, z: 0},
      rotationOrder: `YXZ`,
    };

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addWall();
    this.addFloor();
  }

  addWall() {
    const material = getMaterial({color: this.wall.color, ...this.wall.materialReflectivity});

    loadModel(this.wall, material, (mesh) => {
      mesh.name = this.wall.name;
      setMeshParams(mesh, this.wall);
      this.add(mesh);
    });
  }

  addFloor() {
    const {start, length} = getCircleDegrees(this.floor.start, this.floor.end);
    const geometry = new THREE.CircleGeometry(this.floor.radius, this.floor.segments, start, length);
    const mesh = new THREE.Mesh(geometry, getMaterial({
      color: this.floor.color,
      ...this.floor.materialReflectivity,
    }));
    setMeshParams(mesh, this.floor);
    this.add(mesh);
  }
}

export default Wall;
