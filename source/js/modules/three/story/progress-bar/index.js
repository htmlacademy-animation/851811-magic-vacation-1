import * as THREE from 'three';

import {tick} from '../../../canvas/common/helpers';
import {setMeshParams, getMaterial} from '../../common/helpers';
import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';

const size = new THREE.Vector3();
const box = new THREE.Box3();

class ProgressBar extends THREE.Group {
  constructor(ratio = 0) {
    super();

    this.ratio = ratio;

    this.planeWidth = window.innerWidth * 3;
    this.planeHeight = window.innerHeight * 3;
    this.barLength = 300;
    this.barHeight = 50;

    this.constructChildren();
  }

  constructChildren() {
    this.addBackground();
    this.addOverflowBackground();
    this.addBar();
  }

  addBackground() {
    const background = new THREE.Mesh(new THREE.PlaneGeometry(this.planeWidth, this.planeHeight), getMaterial({
      color: colors.DarkPurple,
      side: THREE.DoubleSide,
      ...materialReflectivity.basic,
    }));

    box.setFromObject(background).getSize(size);
    setMeshParams(background, {position: {x: 0, y: 0, z: 5}});
    this.add(background);
  }

  addOverflowBackground() {
    const background = new THREE.Mesh(new THREE.PlaneGeometry(this.planeWidth, this.planeHeight), getMaterial({
      color: colors.DarkPurple,
      side: THREE.DoubleSide,
      ...materialReflectivity.basic,
    }));

    box.setFromObject(background).getSize(size);
    setMeshParams(background, {position: {x: -this.planeWidth / 2 - this.barLength / 2, y: 0, z: 10}});
    this.add(background);
  }

  addBar() {
    this.bar = new THREE.Mesh(new THREE.PlaneGeometry(this.barLength, this.barHeight), getMaterial({
      color: colors.LightPurple,
      side: THREE.DoubleSide,
      ...materialReflectivity.basic,
    }));

    box.setFromObject(this.bar).getSize(size);
    this.barYCenter = -size.y / 2 + this.barHeight / 2;
    this.barXEnd = 0;
    this.barXStart = -this.barLength;

    setMeshParams(this.bar, {position: {x: this.barXStart, y: this.barYCenter, z: 5}});
    this.add(this.bar);
  }


  setRatio(value) {
    if (value === this.ratio) {
      return;
    }
    this.ratio = value;

    const x = tick(this.barXStart, this.barXEnd, this.ratio);
    setMeshParams(this.bar, {position: {x, y: this.barYCenter, z: 5}});
  }
}

export default ProgressBar;
