import * as THREE from 'three';

import {getConeRadiusFromSideWidth} from '../../../canvas/common/helpers';
import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
import {getMaterial} from '../../common/helpers';

class Pyramid extends THREE.Group {
  constructor() {
    super();

    this.pyramid = {
      height: 280,
      radius: getConeRadiusFromSideWidth(250),
      radialSegments: 4,
      color: colors.Blue,
    };

    this.addPyramid = this.addPyramid.bind(this);

    this.addPyramid();
  }


  addPyramid() {
    const cone = new THREE.ConeBufferGeometry(this.pyramid.radius, this.pyramid.height, this.pyramid.radialSegments);
    const mesh = new THREE.Mesh(cone, getMaterial({
      color: this.pyramid.color,
      flatShading: true,
      ...materialReflectivity.soft,
    }));
    this.add(mesh);
  }
}

export default Pyramid;
