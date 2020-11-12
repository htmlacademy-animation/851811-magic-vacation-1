import * as THREE from 'three';

import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';

class Snowman extends THREE.Group {
  constructor() {
    super();

    this.baseSphere = {
      radius: 75,
      segments: 20,
      color: colors.SnowColor,
    };

    this.topSphere = {
      radius: 44,
      segments: 20,
      color: colors.SnowColor,
    };

    this.cone = {
      radius: 18,
      height: 75,
      radialSegments: 40,
      color: colors.Orange,
    };

    this.addBase = this.addBase.bind(this);
    this.addTop = this.addTop.bind(this);
    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addBase();
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
    const sphere = new THREE.SphereBufferGeometry(this.baseSphere.radius, this.baseSphere.segments, this.baseSphere.segments);
    const sphereMesh = new THREE.Mesh(sphere, this.getMaterial({
      color: this.baseSphere.color,
      ...materialReflectivity.strong,
    }));

    this.add(sphereMesh);
  }

  addTop() {
    this.top = new THREE.Group();

    const sphere = new THREE.SphereBufferGeometry(this.topSphere.radius, this.topSphere.segments, this.topSphere.segments);
    const sphereMesh = new THREE.Mesh(sphere, this.getMaterial({
      color: this.topSphere.color,
      ...materialReflectivity.strong
    }));

    const cone = new THREE.ConeBufferGeometry(this.cone.radius, this.cone.height, this.cone.radialSegments);
    const coneMesh = new THREE.Mesh(cone, this.getMaterial({
      color: this.cone.color,
      ...materialReflectivity.soft,
    }));

    this.top.add(sphereMesh);
    this.top.add(coneMesh);

    sphereMesh.position.set(0, 108, 0);

    coneMesh.rotation.x = 90 * THREE.Math.DEG2RAD;
    coneMesh.position.set(0, 108, 43);

    this.add(this.top);
  }
}

export default Snowman;
