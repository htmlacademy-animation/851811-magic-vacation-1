import * as THREE from 'three';

import Snowman from './snowman';
import Road from './road';

class ThirdRoom extends THREE.Group {
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
    this.addSnowman();
    this.addRoad();
  }

  addSnowman() {
    const snowman = new Snowman(this.getMaterial);

    snowman.scale.set(0.8, 0.8, 0.8);
    snowman.rotation.copy(new THREE.Euler(10 * THREE.Math.DEG2RAD, 40 * THREE.Math.DEG2RAD, 0), `XYZ`);
    snowman.position.set(-20, -107, 0);
    this.add(snowman);
  }

  addRoad() {
    const road = new Road();
    road.scale.set(0.3, 0.3, 0.3);
    road.position.set(-20, 0, 40);
    road.rotation.copy(new THREE.Euler(20 * THREE.Math.DEG2RAD, 45 * THREE.Math.DEG2RAD, 180 * THREE.Math.DEG2RAD), `XYZ`);
    this.add(road);
  }
}

export default ThirdRoom;
