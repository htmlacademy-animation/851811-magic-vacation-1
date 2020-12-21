import * as THREE from 'three';

import SVGObject from '../../common/svg-object';

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
    const leaf = new SVGObject({name: `leaf-2`}).getObject();
    if (!leaf) {
      return;
    }
    leaf.position.set(-200, 100, 30);
    leaf.scale.set(1.5, 1.5, 1.5);
    this.add(leaf);
  }
}

export default SecondRoom;
