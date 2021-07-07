import * as THREE from 'three';

import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
import {getMaterial} from '../../common/helpers';
import {getCoordsOfAngle} from 'js/helpers/math';

class Cylinders extends THREE.Group {
  constructor() {
    super();

    this.cylinder = {
      height: 100,
      radius: 16,
      radialSegments: 20,
      color: colors.Grey,
    };

    this.cylinders = {
      count: 5,
      radius: 670,
      degStart: 0,
      degEnd: 80,
      offset: 15,
    };

    this.positions = generatePositions(this.cylinders);

    this.getCylinder = this.getCylinder.bind(this);
    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.positions.map(({x, y}) => {
      const cylinder = this.getCylinder();
      cylinder.position.set(x, -this.cylinder.height / 2, y);
      this.add(cylinder);
    });
  }

  getCylinder() {
    const cylinder = new THREE.CylinderBufferGeometry(this.cylinder.radius, this.cylinder.radius, this.cylinder.height, this.cylinder.radialSegments);
    return new THREE.Mesh(cylinder, getMaterial({
      color: this.cylinder.color,
      ...materialReflectivity.soft,
    }));
  }
}

export default Cylinders;

function generatePositions(settings) {
  const degreeStep = (settings.degEnd - settings.degStart) / settings.count;

  return [...Array(settings.count)].map((_, index) => {
    return getCoordsOfAngle(0, 0, settings.radius, (degreeStep * index + settings.offset) * THREE.Math.DEG2RAD);
  });
}
