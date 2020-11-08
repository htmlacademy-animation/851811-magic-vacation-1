import * as THREE from 'three';

import SVGObject from '../../common/svg-object';

class FirstRoom extends THREE.Group {
  constructor() {
    super();

    this.addFlower();
  }

  async addFlower() {
    const flower = await new SVGObject({name: `flower`}).getObject();
    flower.position.set(-100, 100, 40);
    flower.scale.set(0.5, 0.5, 0.5);
    this.add(flower);
  }
}

export default FirstRoom;
