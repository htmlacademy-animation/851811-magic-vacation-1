import * as THREE from 'three';
import {getConeRadiusFromSideWidth} from '../../../canvas/common/helpers';

class Pyramid extends THREE.Group {
  constructor() {
    super();

    this.getMaterial = (options = {}) => {
      const {color, ...rest} = options;

      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        ...rest,
      });
    };

    this.pyramid = {
      height: 280,
      radius: getConeRadiusFromSideWidth(250),
      radialSegments: 4,
      color: `#1860CF`,
    };

    this.addPyramid = this.addPyramid.bind(this);

    this.addPyramid();
  }

  addPyramid() {
    const cone = new THREE.ConeBufferGeometry(this.pyramid.radius, this.pyramid.height, this.pyramid.radialSegments);
    const mesh = new THREE.Mesh(cone, this.getMaterial({color: this.pyramid.color, flatShading: true}));
    this.add(mesh);
  }
}

export default Pyramid;
