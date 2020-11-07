import * as THREE from 'three';

import Snowman from './snowman';

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

    this.addSnowman();
  }

  addSnowman() {
    const snowman = new Snowman(this.getMaterial);

    snowman.scale.set(0.8, 0.8, 0.8);
    snowman.rotation.copy(new THREE.Euler(10 * THREE.Math.DEG2RAD, 40 * THREE.Math.DEG2RAD, 0), `XYZ`);
    snowman.position.set(-20, -107, 0);
    this.add(snowman);
  }
}

export default ThirdRoom;
