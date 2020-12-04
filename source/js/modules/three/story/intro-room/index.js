import * as THREE from 'three';

import SVGObject from '../../common/svg-object';
import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
import {loadModel} from '../../common/load-model';

class IntroRoom extends THREE.Group {
  constructor() {
    super();

    this.models = [
      {
        name: `airplane`,
        type: `obj`,
        path: `img/models/airplane.obj`,
        materialReflectivity: materialReflectivity.basic,
        color: colors.White,
        scale: 0.5,
        position: {x: 70, y: 80, z: 100},
        rotate: {x: 90, y: 140, z: -30},
      },
      {
        name: `suitcase`,
        type: `gltf`,
        path: `img/models/suitcase.gltf`,
        scale: 0.4,
        position: {x: -50, y: -100, z: 30},
        rotate: {x: 40, y: -120, z: 20},
      },
      {
        name: `watermelon`,
        type: `gltf`,
        path: `img/models/watermelon.gltf`,
        scale: 1,
        position: {x: -250, y: 0, z: 40},
        rotate: {x: 0, y: 0, z: 130},
      },
    ];

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.loadKeyhole();
    this.loadFlamingo();
    this.loadSnowflake();
    this.loadQuestion();
    this.loadLeaf();
    this.loadModels();
  }

  getMaterial(options = {}) {
    const {color, ...rest} = options;

    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      ...rest,
    });
  }

  async loadKeyhole() {
    const keyhole = await new SVGObject({name: `keyhole`}).getObject();
    keyhole.position.set(-1000, 1000, 10);
    this.add(keyhole);
  }

  async loadFlamingo() {
    const flamingo = await new SVGObject({name: `flamingo`}).getObject();
    flamingo.position.set(-200, 150, 100);
    flamingo.scale.set(-2, 2, 2);
    flamingo.rotation.copy(new THREE.Euler(20 * THREE.Math.DEG2RAD, 0, 0), `XYZ`);
    this.add(flamingo);
  }

  async loadSnowflake() {
    const snowflake = await new SVGObject({name: `snowflake`}).getObject();
    snowflake.position.set(-350, 0, 100);
    snowflake.scale.set(1.2, 1.2, 1.2);
    snowflake.rotation.copy(new THREE.Euler(20 * THREE.Math.DEG2RAD, 40 * THREE.Math.DEG2RAD, 0), `XYZ`);
    this.add(snowflake);
  }

  async loadQuestion() {
    const question = await new SVGObject({name: `question`}).getObject();
    question.position.set(150, -100, 100);
    this.add(question);
  }

  async loadLeaf() {
    const leaf = await new SVGObject({name: `leaf-1`}).getObject();
    leaf.position.set(250, 200, 100);
    leaf.scale.set(-1.2, 1.2, 1.2);
    this.add(leaf);
  }

  loadModels() {
    this.models.forEach((params) => {
      const material = params.color && this.getMaterial({color: params.color, ...params.materialReflectivity});

      loadModel(params, material, (mesh) => {
        mesh.name = params.name;
        mesh.scale.set(params.scale, params.scale, params.scale);
        mesh.position.set(...Object.values(params.position));
        mesh.rotation.copy(new THREE.Euler(params.rotate.x * THREE.Math.DEG2RAD, params.rotate.y * THREE.Math.DEG2RAD, params.rotate.z * THREE.Math.DEG2RAD, params.rotationOrder || `XYZ`));
        this.add(mesh);
      });
    });
  }
}

export default IntroRoom;
