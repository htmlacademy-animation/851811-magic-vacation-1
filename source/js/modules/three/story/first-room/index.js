import * as THREE from 'three';

import SVGObject from '../../common/svg-object';
import Rug from './rug';
import Saturn from './saturn';

class FirstRoom extends THREE.Group {
  constructor() {
    super();

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addFlower();
    this.addRug();
    this.addSaturn();
  }

  async addFlower() {
    const flower = await new SVGObject({name: `flower`}).getObject();
    flower.position.set(-100, 100, 40);
    flower.scale.set(0.5, 0.5, 0.5);
    this.add(flower);
  }

  addRug() {
    const rug = new Rug();
    rug.scale.set(0.3, 0.3, 0.3);
    rug.position.set(-20, 0, 40);
    rug.rotation.copy(new THREE.Euler(20 * THREE.Math.DEG2RAD, 45 * THREE.Math.DEG2RAD, 180 * THREE.Math.DEG2RAD), `XYZ`);
    this.add(rug);
  }

  addSaturn() {
    const saturn = new Saturn();
    saturn.scale.set(0.7, 0.7, 0.7);
    saturn.position.set(30, 0, 100);
    this.add(saturn);
  }
}

export default FirstRoom;
