import * as THREE from 'three';

import {getLathePointsForCircle} from '../../common/helpers';

class Saturn extends THREE.Group {
  constructor() {
    super();

    this.getMaterial = (options = {}) => {
      const {color, ...rest} = options;

      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        ...rest,
      });
    };

    this.planet = {
      radius: 60,
      color: `#FF0438`,
      segments: 40,
    };

    this.ring = {
      width: 120 - 80,
      depth: 2,
      radius: 80,
      color: `#7F47EA`,
      segments: 40,
    };

    this.topSphere = {
      radius: 10,
      color: `#7F47EA`,
      segments: 40,
    };

    this.line = {
      radius: 1,
      height: 1000,
      color: `#7C8DA9`,
      segments: 40,
    };

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.addPlanet();
    this.addRing();
    this.addTopSphere();
    this.addLine();
  }

  addPlanet() {
    const planet = new THREE.SphereBufferGeometry(this.planet.radius, this.planet.segments, this.planet.segments);
    const mesh = new THREE.Mesh(planet, this.getMaterial({color: this.planet.color}));

    this.add(mesh);
  }

  addRing() {
    const points = getLathePointsForCircle(this.ring.width, this.ring.depth, this.ring.radius);

    const ring = new THREE.LatheBufferGeometry(points, this.ring.segments);
    const mesh = new THREE.Mesh(ring, this.getMaterial({
      color: this.ring.color,
      side: THREE.DoubleSide,
      flatShading: true,
    }));
    mesh.rotation.copy(new THREE.Euler(20 * THREE.Math.DEG2RAD, 0, 18 * THREE.Math.DEG2RAD), `XYZ`);

    this.add(mesh);
  }

  addTopSphere() {
    const sphere = new THREE.SphereBufferGeometry(this.topSphere.radius, this.topSphere.segments, this.topSphere.segments);
    const mesh = new THREE.Mesh(sphere, this.getMaterial({color: this.topSphere.color}));

    mesh.position.set(0, this.ring.radius + this.topSphere.radius + 60, 0);
    this.add(mesh);
  }

  addLine() {
    const line = new THREE.CylinderBufferGeometry(this.line.radius, this.line.radius, this.line.height, this.line.radialSegments);
    const mesh = new THREE.Mesh(line, this.getMaterial({color: this.line.color}));

    mesh.position.set(0, this.line.height / 2, 0);
    this.add(mesh);
  }
}

export default Saturn;
