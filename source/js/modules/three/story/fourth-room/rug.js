import * as THREE from 'three';

import {getLathePointsForCircle, getLatheDegrees} from '../../common/helpers';

class Rug extends THREE.Group {
  constructor() {
    super();

    this.getMaterial = (options = {}) => {
      const {color, ...rest} = options;

      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        side: THREE.DoubleSide,
        flatShading: true,
        ...rest,
      });
    };

    this.rug = {
      width: 180,
      depth: 3,
      radius: 763,
      degStart: 16,
      degEnd: 74,
      color: `#A481D1`,
      segments: 40,
    };

    this.addRug = this.addRug.bind(this);

    this.addRug();
  }

  addRug() {
    const points = getLathePointsForCircle(this.rug.width, this.rug.depth, this.rug.radius);
    const {start, length} = getLatheDegrees(this.rug.degStart, this.rug.degEnd);

    const rug = new THREE.LatheBufferGeometry(points, this.rug.segments, start, length);
    const mesh = new THREE.Mesh(rug, this.getMaterial({color: this.rug.color}));

    this.add(mesh);
  }
}

export default Rug;
