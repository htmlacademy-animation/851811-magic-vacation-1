import * as THREE from 'three';

import getSvgObject from '../../common/svg-object';
import {setMeshParams} from '../../common/helpers';
import Rug from './rug';
import Saturn from '../../common/objects/saturn';

class FirstRoom extends THREE.Group {
  constructor({dark} = {}) {
    super();

    this.dark = dark;

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
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
    });
    this.add(rug);
  }

  addSaturn() {
    const saturn = new Saturn({dark: this.dark});
    saturn.scale.set(0.7, 0.7, 0.7);
    saturn.position.set(30, 0, 100);
    this.add(saturn);
  }
}

export default FirstRoom;
