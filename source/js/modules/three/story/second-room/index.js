import * as THREE from 'three';

import SVGObject from '../../common/svg-object';

import Pyramid from './pyramid';
import Lantern from './lantern';

class SecondRoom extends THREE.Group {
  constructor() {
    super();

    this.getMaterial = (options = {}) => {
      const {color, ...rest} = options;

      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        ...rest,
      });
    };

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

    pyramid.position.set(-13, 0, -110);
    pyramid.rotation.copy(new THREE.Euler(3 * THREE.Math.DEG2RAD, 3 * THREE.Math.DEG2RAD, 0), `XYZ`);
    this.add(pyramid);
  }

  addLantern() {
    const lantern = new Lantern(this.getMaterial);

    lantern.scale.set(0.32, 0.32, 0.32);
    lantern.rotation.copy(new THREE.Euler(10 * THREE.Math.DEG2RAD, 60 * THREE.Math.DEG2RAD, 0), `XYZ`);
    lantern.position.set(110, -137, 10);
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
