import * as THREE from 'three';

import getRawShaderMaterialAttrs from '../common/hue-and-bubbles-raw-shader';

import SVGObject from '../common/svg-object';

export default class Intro {
  constructor() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.canvasSelector = `screen__canvas--intro`;
    this.texturePath = `img/screen__textures/scene-0.png`;
    this.textureRatio = 2048 / 1024;
    this.backgroundColor = 0x5f458c;

    this.initialized = false;
    this.animationRequest = null;

    this.fov = 45;
    this.aspect = this.innerWidth / this.innerHeight;
    this.near = 0.1;
    this.far = 1000;
    this.position = {
      z: 800,
    };

    this.render = this.render.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updateScreenSize = this.updateScreenSize.bind(this);
  }

  init() {
    if (!this.initialized) {
      this.prepareScene();
      this.initialized = true;
    }

    window.addEventListener(`resize`, this.handleResize);
    this.animationRequest = requestAnimationFrame(this.render);
  }

  prepareScene() {
    this.canvasElement = document.getElementById(this.canvasSelector);
    this.canvasElement.width = this.innerWidth;
    this.canvasElement.height = this.innerHeight;

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvasElement});
    this.renderer.setClearColor(this.backgroundColor, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.innerWidth, this.innerHeight);

    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
    this.camera.position.z = this.position.z;

    this.scene = new THREE.Scene();

    const loadManager = new THREE.LoadingManager();
    const textureLoader = new THREE.TextureLoader(loadManager);
    const loadedTexture = textureLoader.load(this.texturePath);
    const material = new THREE.RawShaderMaterial(getRawShaderMaterialAttrs({map: {value: loadedTexture}}));
    const geometry = new THREE.PlaneGeometry(1, 1);

    loadManager.onLoad = () => {
      const image = new THREE.Mesh(geometry, material);
      image.scale.x = this.innerHeight * this.textureRatio;
      image.scale.y = this.innerHeight;

      this.scene.add(image);
    };

    this.addSvgObjects();
  }

  addSvgObjects() {
    this.loadKeyhole();
    this.loadFlamingo();
    this.loadSnowflake();
    this.loadQuestion();
    this.loadLeaf();
  }

  async loadKeyhole() {
    const keyhole = await new SVGObject({name: `keyhole`}).getObject();
    keyhole.position.set(-1000, 1000, 10);
    this.scene.add(keyhole);
  }

  async loadFlamingo() {
    const flamingo = await new SVGObject({name: `flamingo`}).getObject();
    flamingo.position.set(-350, 300, 100);
    flamingo.scale.set(-2, 2, 2);
    flamingo.rotation.copy(new THREE.Euler(20 * THREE.Math.DEG2RAD, 0, 0), `XYZ`);
    this.scene.add(flamingo);
  }

  async loadSnowflake() {
    const snowflake = await new SVGObject({name: `snowflake`}).getObject();
    snowflake.position.set(-350, 0, 100);
    snowflake.scale.set(1.2, 1.2, 1.2);
    snowflake.rotation.copy(new THREE.Euler(20 * THREE.Math.DEG2RAD, 40 * THREE.Math.DEG2RAD, 0), `XYZ`);
    this.scene.add(snowflake);
  }

  async loadQuestion() {
    const question = await new SVGObject({name: `question`}).getObject();
    question.position.set(150, -200, 100);
    this.scene.add(question);
  }

  async loadLeaf() {
    const leaf = await new SVGObject({name: `leaf-1`}).getObject();
    leaf.position.set(400, 200, 100);
    leaf.scale.set(-1.2, 1.2, 1.2);
    this.scene.add(leaf);
  }

  end() {
    window.removeEventListener(`resize`, this.handleResize);

    this.animationRequest = null;
  }

  handleResize() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.updateScreenSize();
  }

  updateScreenSize() {
    this.canvasElement.width = this.innerWidth;
    this.canvasElement.height = this.innerHeight;

    this.camera.aspect = this.innerWidth / this.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.innerWidth, this.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);

    if (this.animationRequest) {
      requestAnimationFrame(this.render);
    }
  }
}
