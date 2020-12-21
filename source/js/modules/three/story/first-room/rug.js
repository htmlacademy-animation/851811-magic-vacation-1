import * as THREE from 'three';

import {getLathePointsForCircle, getCircleDegrees} from '../../common/helpers';
import colors from '../../common/colors';
import {getMaterial} from '../../common/helpers';

class Rug extends THREE.Group {
  constructor({dark} = {}) {
    super();

    this.dark = dark;

    this.rug = {
      width: 180,
      depth: 3,
      radius: 763,
      degStart: 16,
      degEnd: 74,
      mainColor: this.dark ? colors.ShadowedLightPurple : colors.LightPurple,
      stripeColor: this.dark ? colors.ShadowedAdditionalPurple : colors.AdditionalPurple,
      segments: 200,
      stripes: 7,
    };

    this.addRug = this.addRug.bind(this);

    this.addRug();
  }

  getGeometry() {
    const points = getLathePointsForCircle(this.rug.width, this.rug.depth, this.rug.radius);
    const {start, length} = getCircleDegrees(this.rug.degStart, this.rug.degEnd);

    const rug = new THREE.LatheBufferGeometry(points, this.rug.segments, start, length).toNonIndexed();

    const position = rug.attributes.position;
    const positionArray = position.array;
    const positionCount = position.count;

    const stripeDegree = (this.rug.degEnd - this.rug.degStart) / this.rug.stripes;

    const colorsFloor = [];
    const color = new THREE.Color();

    const beginning = new THREE.Vector3(positionArray[0], positionArray[1], positionArray[2]);

    for (let i = 0; i < positionCount; i++) {
      color.setStyle(this.rug.mainColor);

      const vector = new THREE.Vector3(positionArray[i * 3], positionArray[i * 3 + 1], positionArray[i * 3 + 2]);
      const angle = vector.angleTo(beginning) * THREE.Math.RAD2DEG;

      const isStripe = Math.floor(angle / stripeDegree) % 2 === 1;

      if (isStripe) {
        color.setStyle(this.rug.stripeColor);
      }

      colorsFloor.push(color.r, color.g, color.b);
    }

    rug.setAttribute(`color`, new THREE.Float32BufferAttribute(colorsFloor, 3));

    return rug;
  }

  addRug() {
    const mesh = new THREE.Mesh(this.getGeometry(), getMaterial({
      side: THREE.DoubleSide,
      flatShading: true,
      vertexColors: true,
      color: new THREE.Color(this.rug.mainColor),
    }));

    this.add(mesh);
  }
}

export default Rug;
