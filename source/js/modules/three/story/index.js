import * as THREE from 'three';

import getRawShaderMaterialAttrs from '../common/get-raw-shader-material-attrs';

export default class Intro {
  constructor() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.canvasSelector = `screen__canvas--story`;
    this.texturePaths = [
      `img/screen__textures/scene-1.png`,
      `img/screen__textures/scene-2.png`,
      `img/screen__textures/scene-3.png`,
      `img/screen__textures/scene-4.png`,
    ];
    this.textureRatio = 2048 / 1024;
    this.backgroundColor = 0x5f458c;

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
    window.addEventListener(`resize`, this.handleResize);

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
    const loadedTextures = this.texturePaths.map((texturePath) => textureLoader.load(texturePath));
    const geometry = new THREE.PlaneGeometry(1, 1);

    loadManager.onLoad = () => {
      loadedTextures.forEach((loadedTexture, index) => {
        const material = new THREE.RawShaderMaterial(getRawShaderMaterialAttrs({map: {value: loadedTexture}}));
        const image = new THREE.Mesh(geometry, material);
        image.scale.x = this.innerHeight * this.textureRatio;
        image.scale.y = this.innerHeight;
        image.position.x = this.getScenePosition(index);
        this.scene.add(image);
      });
    };

    this.animationRequest = requestAnimationFrame(this.render);
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

  changeScene(index) {
    this.camera.position.x = this.getScenePosition(index);
  }

  getScenePosition(index) {
    return this.innerHeight * this.textureRatio * index;
  }

  render() {
    this.renderer.render(this.scene, this.camera);

    if (this.animationRequest) {
      requestAnimationFrame(this.render);
    }
  }
}
