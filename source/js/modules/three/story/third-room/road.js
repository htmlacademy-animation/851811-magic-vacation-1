import * as THREE from 'three';

import {getLathePointsForCircle, getCircleDegrees} from '../../common/helpers';
import colors from '../../common/colors';
import {getMaterial} from '../../common/helpers';
import materialReflectivity from '../../common/material-reflectivity';

class Road extends THREE.Group {
  constructor() {
    super();

    this.road = {
      width: 160,
      depth: 3,
      radius: 732,
      degStart: 0,
      degEnd: 90,
      mainColor: colors.Grey,
      segments: 200,
      stripes: 12,
      stripeColor: colors.White,
      stripeWidth: 20,
    };

    this.addRoad = this.addRoad.bind(this);

    this.addRoad();
  }

  getGeometry() {
    const points = getLathePointsForCircle(this.road.width, this.road.depth, this.road.radius);
    const {start, length} = getCircleDegrees(this.road.degStart, this.road.degEnd);

    const road = new THREE.LatheBufferGeometry(points, this.road.segments, start, length).toNonIndexed();

    const position = road.attributes.position;
    const positionArray = position.array;
    const positionCount = position.count;

    const stripeDegree = (this.road.degEnd - this.road.degStart) / this.road.stripes;

    const colorsFloor = [];
    const color = new THREE.Color();

    const beginning = new THREE.Vector3(positionArray[0], positionArray[1], positionArray[2]);
    const currentVector = new THREE.Vector3();

    for (let i = 0; i < positionCount; i++) {
      color.setStyle(this.road.mainColor);

      const x = positionArray[i * 3];
      const y = positionArray[i * 3 + 1];
      const z = positionArray[i * 3 + 2];

      currentVector.set(x, y, z);
      const angle = currentVector.angleTo(beginning) * THREE.Math.RAD2DEG;

      const inRightDegree = Math.floor(angle / stripeDegree) % 3 === 1;
      const offset = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2)) - this.road.radius;
      const isRightOffset = offset >= this.road.width / 2 - this.road.stripeWidth / 2 && offset <= this.road.width / 2 + this.road.stripeWidth / 2;

      const isStripe = inRightDegree && isRightOffset;

      if (isStripe) {
        color.setStyle(this.road.stripeColor);
      }

      colorsFloor.push(color.r, color.g, color.b);
    }

    road.setAttribute(`color`, new THREE.Float32BufferAttribute(colorsFloor, 3));

    return road;
  }

  addRoad() {
    const mesh = new THREE.Mesh(this.getGeometry(), getMaterial({
      side: THREE.DoubleSide,
      flatShading: true,
      vertexColors: true,
      color: new THREE.Color(this.road.mainColor),
      ...materialReflectivity.basic,
    }));

    this.add(mesh);
  }
}

export default Road;
