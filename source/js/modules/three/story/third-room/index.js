import * as THREE from 'three';

import {setMeshParams} from '../../common/helpers';
import Snowman from './snowman';
import Road from './road';

class ThirdRoom extends THREE.Group {
  constructor() {
    super();

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addSnowman();
    this.addRoad();
  }

  addSnowman() {
    const snowman = new Snowman();
    setMeshParams(snowman, {
      scale: 0.35,
      position: {x: -35, y: 40, z: 140},
      rotate: {x: 10, y: 40, z: 0},
    });
    this.add(snowman);
  }

  addRoad() {
    const road = new Road();
    setMeshParams(road, {
      scale: 0.3,
      position: {x: 0, y: 0, z: 0},
      rotate: {x: 0, y: 45, z: 180},
    });
    this.add(road);
  }
}

export default ThirdRoom;
