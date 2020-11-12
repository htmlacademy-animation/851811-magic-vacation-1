import * as THREE from 'three';

import SVGObject from '../../common/svg-object';

class IntroRoom extends THREE.Group {
  constructor() {
    super();

    this.constructChildren = this.constructChildren.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.loadKeyhole();
    this.loadFlamingo();
    this.loadSnowflake();
    this.loadQuestion();
    this.loadLeaf();
  }

  async loadKeyhole() {
    const keyhole = await new SVGObject({name: `keyhole`}).getObject();
    keyhole.position.set(-1000, 1000, 10);
    this.add(keyhole);
  }

  async loadFlamingo() {
    const flamingo = await new SVGObject({name: `flamingo`}).getObject();
    flamingo.position.set(-350, 300, 100);
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
    question.position.set(150, -200, 100);
    this.add(question);
  }

  async loadLeaf() {
    const leaf = await new SVGObject({name: `leaf-1`}).getObject();
    leaf.position.set(400, 200, 100);
    leaf.scale.set(-1.2, 1.2, 1.2);
    this.add(leaf);
  }
}

export default IntroRoom;
