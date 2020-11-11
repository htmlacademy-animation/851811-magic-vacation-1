import * as THREE from 'three';

import {getLathePointsForCircle, getLatheDegrees} from '../../common/helpers';

class Road extends THREE.Group {
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

    this.road = {
      width: 160,
      depth: 3,
      radius: 732,
      degStart: 0,
      degEnd: 90,
      color: `#646B7C`,
      segments: 40,
    };

    this.addRoad = this.addRoad.bind(this);

    this.addRoad();
  }

  addRoad() {
    const points = getLathePointsForCircle(this.road.width, this.road.depth, this.road.radius);
    const {start, length} = getLatheDegrees(this.road.degStart, this.road.degEnd);

    const road = new THREE.LatheBufferGeometry(points, this.road.segments, start, length);
    const mesh = new THREE.Mesh(road, this.getMaterial({color: this.road.color}));

    this.add(mesh);
  }
}

export default Road;
