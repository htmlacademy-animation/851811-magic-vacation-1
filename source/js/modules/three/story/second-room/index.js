import * as THREE from 'three';

import getSvgObject from '../../common/svg-object';
import {setMeshParams} from '../../common/helpers';
import Pyramid from './pyramid';
import Lantern from './lantern';

class SecondRoom extends THREE.Group {
  constructor() {
    super();

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
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
}

export default SecondRoom;
