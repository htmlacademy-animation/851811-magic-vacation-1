import * as THREE from 'three';

import {getConeRadiusFromSideWidth} from '../../../canvas/common/helpers';
import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';

class Lantern extends THREE.Group {
  constructor() {
    super();

    this.baseCylinder = {
      height: 120,
      radius: 16,
      radialSegments: 20,
      color: colors.Blue,
    };

    this.baseSphere = {
      height: 16,
      radius: 16,
      segments: 20,
      color: colors.Blue,
    };

    this.middleCylinder = {
      height: 230,
      radius: 7,
      radialSegments: 20,
      color: colors.Blue,
    };

    this.topBox = {
      width: 37,
      height: 4,
      color: colors.Blue,
    };

    this.topTrapezoid = {
      widthTop: 42,
      widthBottom: 34,
      height: 60,
      color: colors.LightBlue,
      radialSegments: 4,
    };

    this.topCap = {
      widthTop: 45,
      widthBottom: 57,
      height: 6,
      color: colors.Blue,
      radialSegments: 4,
    };

    this.addBase = this.addBase.bind(this);
    this.addMiddle = this.addMiddle.bind(this);
    this.addTop = this.addTop.bind(this);
    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addBase();
    this.addMiddle();
    this.addTop();
  }

  getMaterial(options = {}) {
    const {color, ...rest} = options;

    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      ...rest,
    });
  }

  addBase() {
    this.base = new THREE.Group();

    const cylinder = new THREE.CylinderBufferGeometry(this.baseCylinder.radius, this.baseCylinder.radius, this.baseCylinder.height, this.baseCylinder.radialSegments);
    const cylinderMesh = new THREE.Mesh(cylinder, this.getMaterial({
      color: this.baseCylinder.color,
      ...materialReflectivity.soft,
    }));

    const halfSphere = new THREE.SphereBufferGeometry(this.baseSphere.radius,
        this.baseSphere.segments, this.baseSphere.segments,
        Math.PI * 2.00, Math.PI * 2.00,
        0, Math.PI * 0.5);
    const halfSphereMesh = new THREE.Mesh(halfSphere, this.getMaterial({
      color: this.baseSphere.color,
      ...materialReflectivity.soft,
    }));

    this.base.add(cylinderMesh);
    this.base.add(halfSphereMesh);
    halfSphereMesh.position.set(0, this.baseCylinder.height / 2, 0);

    this.add(this.base);
  }

  addMiddle() {
    const cylinder = new THREE.CylinderBufferGeometry(this.middleCylinder.radius, this.middleCylinder.radius, this.middleCylinder.height, this.middleCylinder.radialSegments);
    const cylinderMesh = new THREE.Mesh(cylinder, this.getMaterial({
      color: this.middleCylinder.color,
      ...materialReflectivity.soft,
    }));

    const currentGroupSize = new THREE.Box3().setFromObject(this).getSize();

    this.add(cylinderMesh);
    cylinderMesh.position.set(0, currentGroupSize.y / 2 + this.baseSphere.radius / 2 + this.middleCylinder.height / 2, 0);
  }

  addTop() {
    this.top = new THREE.Group();

    const box = new THREE.BoxBufferGeometry(this.topBox.width, this.topBox.height, this.topBox.width);
    const boxMesh = new THREE.Mesh(box, this.getMaterial({
      color: this.topBox.color,
      flatShading: true,
      ...materialReflectivity.soft,
    }));

    const trapezoid = new THREE.CylinderBufferGeometry(getConeRadiusFromSideWidth(this.topTrapezoid.widthTop), getConeRadiusFromSideWidth(this.topTrapezoid.widthBottom), this.topTrapezoid.height, this.topTrapezoid.radialSegments);
    const trapezoidMesh = new THREE.Mesh(trapezoid, this.getMaterial({
      color: this.topTrapezoid.color,
      flatShading: true,
      ...materialReflectivity.soft,
    }));

    const cap = new THREE.CylinderBufferGeometry(getConeRadiusFromSideWidth(this.topCap.widthTop), getConeRadiusFromSideWidth(this.topCap.widthBottom), this.topCap.height, this.topCap.radialSegments);
    const capMesh = new THREE.Mesh(cap, this.getMaterial({
      color: this.topCap.color,
      flatShading: true,
      ...materialReflectivity.soft,
    }));

    this.top.add(boxMesh);
    boxMesh.rotation.y = -45 * THREE.Math.DEG2RAD;
    this.top.add(trapezoidMesh);
    this.top.add(capMesh);

    trapezoidMesh.position.set(0, this.topBox.height / 2 + this.topTrapezoid.height / 2, 0);
    capMesh.position.set(0, this.topBox.height / 2 + this.topTrapezoid.height + this.topCap.height / 2, 0);

    const currentGroupSize = new THREE.Box3().setFromObject(this).getSize();
    this.add(this.top);
    const currentElementSize = new THREE.Box3().setFromObject(this.top).getSize();

    this.top.position.set(0, currentGroupSize.y / 2 + 50 + currentElementSize.y, 0);
  }
}

export default Lantern;
