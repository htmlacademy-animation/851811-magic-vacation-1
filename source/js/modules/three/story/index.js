import * as THREE from 'three';
import {animateEasing, animateEasingWithFramerate, tick} from '../../canvas/common/helpers';
import bezierEasing from '../../canvas/common/bezier-easing';
import getRawShaderMaterialAttrs from '../common/get-raw-shader-material-attrs';

const easeInOut = bezierEasing(0.42, 0, 0.58, 1);
const easeIn = bezierEasing(0.42, 0, 1, 1);

export default class Intro {
  constructor() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.canvasCenter = {x: this.innerWidth / 2, y: this.innerHeight / 2};

    this.canvasSelector = `screen__canvas--story`;
    this.textures = [
      {
        src: `img/screen__textures/scene-1.png`,
        options: {hueShift: 0.0},
      },
      {
        src: `img/screen__textures/scene-2.png`,
        options: {hueShift: -0.26, magnify: true},
        animationSettings: {
          hue: {
            initalHue: -0.1,
            finalHue: -0.26,
            duration: 3000,
            variation: 0.3,
          },
        },
      },
      {
        src: `img/screen__textures/scene-3.png`,
        options: {hueShift: 0.0},
      },
      {
        src: `img/screen__textures/scene-4.png`,
        options: {hueShift: 0.0},
      },
    ];
    this.textureRatio = 2048 / 1024;
    this.backgroundColor = 0x5f458c;

    this.hueIsAnimating = false;
    this.defaultHueIntensityEasingFn = (timingFraction) => {
      return easeInOut(Math.sin(timingFraction * Math.PI));
    };

    this.bubblesDuration = 3000;

    this.defaultFlareAngles = [5.0 * Math.PI / 8.0, 7 * Math.PI / 8.0];
    this.defaultFlareOffset = 0.8;

    this.bubbles = [
      {
        radius: 120.0,
        flareAngleStart: this.defaultFlareAngles[0],
        flareAngleEnd: this.defaultFlareAngles[1],
        flareOffset: this.defaultFlareOffset,
        initialPosition: [this.canvasCenter.x - this.canvasCenter.x / 10, -100],
        position: [this.canvasCenter.x - this.canvasCenter.x / 10, -100],
        finalPosition: [this.canvasCenter.x - this.canvasCenter.x / 10, this.innerHeight + 100],
        positionAmplitude: 50,
        timeout: 0,
      },
      {
        radius: 80.0,
        flareAngleStart: this.defaultFlareAngles[0],
        flareAngleEnd: this.defaultFlareAngles[1],
        flareOffset: this.defaultFlareOffset,
        initialPosition: [this.canvasCenter.x - this.innerWidth / 4, -100],
        position: [this.canvasCenter.x - this.innerWidth / 4, -100],
        finalPosition: [this.canvasCenter.x - this.innerWidth / 4, this.innerHeight + 100],
        positionAmplitude: 40,
        timeout: this.bubblesDuration / 5,
      },
      {
        radius: 70.0,
        flareAngleStart: this.defaultFlareAngles[0],
        flareAngleEnd: this.defaultFlareAngles[1],
        flareOffset: this.defaultFlareOffset,
        initialPosition: [this.canvasCenter.x, -100],
        position: [this.canvasCenter.x, -100],
        finalPosition: [this.canvasCenter.x, this.innerHeight + 100],
        positionAmplitude: 30,
        timeout: this.bubblesDuration / 4,
      },
    ];

    this.animationRequest = null;

    this.fov = this.getFov();
    this.aspect = this.innerWidth / this.innerHeight;
    this.near = 0.1;
    this.far = 1000;
    this.position = {
      z: 750,
    };

    this.currentScene = 0;

    this.render = this.render.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updateScreenSize = this.updateScreenSize.bind(this);
    this.animateHue = this.animateHue.bind(this);
    this.getHueAnimationSettings = this.getHueAnimationSettings.bind(this);
  }

  resetBubbles() {
    this.bubbles.forEach((_, index) => {
      this.bubbles[index].position = [...this.bubbles[index].initialPosition];
    });
  }

  resetHue() {
    const hueAnimationSettings = this.getHueAnimationSettings(this.currentScene);
    if (!hueAnimationSettings) {
      return;
    }

    this.textures[this.currentScene].options.hueShift = hueAnimationSettings.initalHue;
  }

  addBubbleUniform(index) {
    const {width} = this.getSceneSize();
    const pixelRatio = this.renderer.getPixelRatio();

    if (this.textures[index].options.magnify) {
      return {
        magnification: {
          value: {
            bubbles: this.bubbles,
            resolution: [width * pixelRatio, width / this.textureRatio * pixelRatio],
          }
        },
      };
    }

    return {};
  }

  getFov() {
    if (this.innerWidth > this.innerHeight) {
      return 35;
    }

    return (32 * this.innerHeight) / Math.min(this.innerWidth * 1.3, this.innerHeight);
  }

  getHueAnimationSettings(index) {
    const texture = this.textures[index];

    return texture.animationSettings && texture.animationSettings.hue;
  }

  getSphere() {
    const geometry = new THREE.SphereGeometry(100, 50, 50);

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(`#F1354C`),
      metalness: 0.05,
      emissive: 0x0,
      roughness: 0.5
    });

    return new THREE.Mesh(geometry, material);
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
    const loadedTextures = this.textures.map((texture) => ({src: textureLoader.load(texture.src), options: texture.options}));
    const geometry = new THREE.PlaneGeometry(1, 1);

    loadManager.onLoad = () => {
      this.materials = loadedTextures.map((loadedTexture, index) => {
        const rawShaderMaterialAttrs = getRawShaderMaterialAttrs({
          map: {
            value: loadedTexture.src,
          },
          options: {
            value: loadedTexture.options,
          },
          ...this.addBubbleUniform(index),
        });

        const material = new THREE.RawShaderMaterial(rawShaderMaterialAttrs);

        material.needsUpdate = true;

        const image = new THREE.Mesh(geometry, material);
        image.scale.x = this.innerHeight * this.textureRatio;
        image.scale.y = this.innerHeight;
        image.position.x = this.getScenePosition(index);

        this.scene.add(image);

        return material;
      });
    };

    const sphere = this.getSphere();
    this.scene.add(sphere);

    this.changeScene(0);
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

    this.camera.fov = this.getFov();
    this.camera.aspect = this.innerWidth / this.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.innerWidth, this.innerHeight);

    const magnifiedIndex = this.textures.findIndex((texture) => texture.options.magnify);

    const {width} = this.getSceneSize();
    const pixelRatio = this.renderer.getPixelRatio();

    this.materials[magnifiedIndex].uniforms.magnification.value.resolution = [width * pixelRatio, width / this.textureRatio * pixelRatio];
  }

  changeScene(index) {
    this.currentScene = index;
    this.camera.position.x = this.getScenePosition(index);

    if (this.textures[index].options.magnify) {
      this.resetBubbles();
      this.animateBubbles();
    }

    if (this.getHueAnimationSettings(index)) {
      if (!this.hueIsAnimating) {
        this.resetHue();
        this.animateHue();
      }
    }
  }

  getScenePosition(index) {
    return this.innerHeight * this.textureRatio * index;
  }

  getSceneSize() {
    const size = new THREE.Vector2();
    this.renderer.getSize(size);
    return size;
  }

  bubblePositionAnimationTick(index, from, to) {
    return (progress) => {
      const pixelRatio = this.renderer.getPixelRatio();

      const y = tick(from[1], to[1], progress) * pixelRatio;
      const offset = this.bubbles[index].positionAmplitude * Math.pow(1 - progress, 0.8) * Math.sin(progress * Math.PI * 7);
      const x = (offset + this.bubbles[index].initialPosition[0]) * pixelRatio;

      this.bubbles[index].position = [x, y];
    };
  }

  hueIntensityAnimationTick(index, from, to) {
    return (progress) => {
      const hueAnimationSettings = this.getHueAnimationSettings(index);
      if (!hueAnimationSettings) {
        this.textures[index].options.hueShift = hueAnimationSettings.initalHue;
        return;
      }

      const hueShift = tick(from, to, progress);
      this.textures[index].options.hueShift = hueShift;
    };
  }

  animateBubbles() {
    this.bubbles.forEach((bubble, index) => {
      setTimeout(() => {
        animateEasing(this.bubblePositionAnimationTick(index, this.bubbles[index].initialPosition, this.bubbles[index].finalPosition), this.bubblesDuration, easeIn);
      }, this.bubbles[index].timeout);
    });
  }

  animateHue() {
    const hueAnimationSettings = this.getHueAnimationSettings(this.currentScene);
    if (!hueAnimationSettings) {
      this.hueIsAnimating = false;
      return;
    }

    this.hueIsAnimating = true;

    const {initalHue, finalHue, duration, variation} = hueAnimationSettings;
    const offset = Math.random() * variation * 2 + (1 - variation);

    animateEasingWithFramerate(this.hueIntensityAnimationTick(this.currentScene, initalHue, finalHue * offset), duration * offset, this.defaultHueIntensityEasingFn).then(this.animateHue);
  }

  render() {
    this.renderer.render(this.scene, this.camera);

    if (this.animationRequest) {
      requestAnimationFrame(this.render);
    }
  }
}
