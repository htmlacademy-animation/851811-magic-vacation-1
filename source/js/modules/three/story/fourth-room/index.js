import * as THREE from 'three';

import Rug from './rug';

class FourthRoom extends THREE.Group {
  constructor() {
    super();

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addRug();
  }

  addRug() {
    const rug = new Rug();
    rug.scale.set(0.3, 0.3, 0.3);
    rug.position.set(-20, 0, 40);
    rug.rotation.copy(new THREE.Euler(20 * THREE.Math.DEG2RAD, 45 * THREE.Math.DEG2RAD, 180 * THREE.Math.DEG2RAD), `XYZ`);
    this.add(rug);
  }
}

export default FourthRoom;
