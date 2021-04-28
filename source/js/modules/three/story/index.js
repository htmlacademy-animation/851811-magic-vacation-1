import * as THREE from 'three';
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {animateEasing, animateEasingWithFramerate, tick} from '../../canvas/common/helpers';
import bezierEasing from '../../canvas/common/bezier-easing';
// import getRawShaderMaterialAttrs from '../common/hue-and-bubbles-raw-shader';
import loadManager from '../common/load-manager';
import {isMobile} from '../../helpers';

import IntroRoom from './intro-room';
import FirstRoom from './first-room';
import SecondRoom from './second-room';
import ThirdRoom from './third-room';
import getSuitcase from '../common/objects/get-suitcase';

const easeInOut = bezierEasing(0.42, 0, 0.58, 1);
const easeIn = bezierEasing(0.42, 0, 1, 1);

const ScreenName = {
  intro: `intro`,
  room: `room`,
};

const ScreenId = {
  top: 0,
  story: 1,
};

const box = new THREE.Box3();

export default class Story {
  constructor() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.canvasCenter = {x: this.innerWidth / 2, y: this.innerHeight / 2};

    this.canvasSelector = `background-canvas--story`;

    this.rooms = [
      {
        // src: `img/screen__textures/scene-1.png`,
        options: {hueShift: 0.0},
        Elements: FirstRoom,
      },
      {
        // src: `img/screen__textures/scene-2.png`,
        options: {hueShift: -0.26, magnify: true},
        animationSettings: {
          hue: {
            initalHue: -0.1,
            finalHue: -0.26,
            duration: 3000,
            variation: 0.3,
          },
        },
        Elements: SecondRoom,
      },
      {
        // src: `img/screen__textures/scene-3.png`,
        options: {hueShift: 0.0},
        Elements: ThirdRoom,
      },
      {
        // src: `img/screen__textures/scene-4.png`,
        options: {hueShift: 0.0},
        Elements: FirstRoom,
        elementsOptions: {dark: true},
      },
    ];
    this.textureHeight = 1024;
    this.textureWidth = 2048;
    this.textureRatio = this.textureWidth / this.textureHeight;
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

    this.initialized = false;
    this.animationRequest = null;

    this.fov = this.getFov();
    this.aspect = this.innerWidth / this.innerHeight;
    this.near = 0.1;
    this.far = 1405;
    this.position = {
      z: 1405,
    };

    this.cameraSettings = {
      intro: {
        position: {x: 0, y: 0, z: this.position.z},
        rotation: 0,
      },
      room: {
        position: {x: 0, y: 0, z: 400},
        rotation: 0, // 15
      },
    };

    this.introLights = [
      {
        light: new THREE.HemisphereLight(0xffffff, 0x444444),
        position: {x: 0, y: 300, z: 0},
      },
      {
        light: new THREE.DirectionalLight(0xffffff, 0.3),
        position: {x: 75, y: 300, z: 75},
      },
      {
        light: new THREE.AmbientLight(0x404040),
      }
    ];

    this.roomLights = [
      {
        light: new THREE.DirectionalLight(0xffffff, 0.84),
        position: {x: 0, y: this.position.z * Math.tan(-15 * THREE.Math.DEG2RAD), z: this.position.z},
      },
      {
        light: new THREE.DirectionalLight(0xffffff, 0.5),
        position: {x: 0, y: 500, z: 0},
      },
      {
        light: new THREE.PointLight(0xf6f2ff, 0.6, 875, 2),
        position: {x: -785, y: -350, z: 710},
        ...!isMobile && {castShadow: true},
      },
      {
        light: new THREE.PointLight(0xf5ffff, 0.95, 975, 2),
        position: {x: 730, y: 800, z: 985},
        ...!isMobile && {castShadow: true},
      },
      {
        light: new THREE.AmbientLight(0x404040),
      },
      {
        light: new THREE.AmbientLight(0x404040),
      }
    ];

    this.currentScene = 0;

    this.sceneSize = new THREE.Vector2();

    this.render = this.render.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.updateScreenSize = this.updateScreenSize.bind(this);
    this.animateHue = this.animateHue.bind(this);
    this.getHueAnimationSettings = this.getHueAnimationSettings.bind(this);
    this.createIntroLight = this.createIntroLight.bind(this);
    this.createRoomLight = this.createRoomLight.bind(this);

    this.screenLights = {
      [ScreenName.intro]: this.createIntroLight,
      [ScreenName.room]: this.createRoomLight,
    };
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

    this.rooms[this.currentScene].options.hueShift = hueAnimationSettings.initalHue;
  }

  addBubbleUniform(index) {
    const {width} = this.getSceneSize();
    const pixelRatio = this.renderer.getPixelRatio();

    if (this.rooms[index].options.magnify) {
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
    const texture = this.rooms[index];

    return texture.animationSettings && texture.animationSettings.hue;
  }

  createLight(lights) {
    const lightGroup = new THREE.Group();

    lights.forEach(({light, position, castShadow}) => {
      if (position) {
        light.position.set(...Object.values(position));
      }
      if (castShadow) {
        light.castShadow = true;
      }
      lightGroup.add(light);
    });

    return lightGroup;
  }

  createIntroLight() {
    const light = this.createLight(this.introLights);
    light.name = `light-${ScreenName.intro}`;

    return light;
  }

  createRoomLight() {
    const light = this.createLight(this.roomLights);
    light.name = `light-${ScreenName.room}`;

    return light;
  }

  setLight() {
    const [current, previous] = this.currentScene === 0 ? [ScreenName.intro, ScreenName.room] : [ScreenName.room, ScreenName.intro];

    const currentLight = this.scene.getObjectByName(`light-${current}`);
    const previousLight = this.scene.getObjectByName(`light-${previous}`);

    if (currentLight) {
      currentLight.visible = true;
    } else {
      const light = this.screenLights[current]();
      this.scene.add(light);
    }

    if (previousLight) {
      previousLight.visible = false;
    }
  }

  setCamera() {
    if (this.currentScene === 0) {
      this.camera.position.set(...Object.values(this.cameraSettings.intro.position));
      this.camera.rotation.x = this.cameraSettings.intro.rotation * THREE.Math.DEG2RAD;
    } else {
      this.camera.position.set(...Object.values(this.cameraSettings.room.position));
      this.camera.rotation.x = this.cameraSettings.room.rotation * THREE.Math.DEG2RAD;
    }
  }

  init(screenName) {
    if (!this.initialized) {
      this.prepareScene();
      this.initialized = true;
      this.scene.visible = false;
      loadManager.onLoad = () => {
        this.scene.visible = true;
        this.renderer.render(this.scene, this.camera);
        this.intro.startAnimation();
        this.intro.onAnimationEnd = () => {
          this.introAnimationRequest = false;
        };
      };
    }

    if (!this.animationRequest) {
      window.addEventListener(`resize`, this.handleResize);
      this.animationRequest = requestAnimationFrame(this.render);
    }

    this.changeScene(ScreenId[screenName]);
  }

  prepareScene() {
    this.canvasElement = document.getElementById(this.canvasSelector);
    this.canvasElement.width = this.innerWidth;
    this.canvasElement.height = this.innerHeight;

    this.renderer = new THREE.WebGLRenderer({canvas: this.canvasElement});
    this.renderer.setClearColor(this.backgroundColor, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.innerWidth, this.innerHeight);
    if (!isMobile) {
      this.renderer.shadowMap.enabled = true;
    }

    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
    // this.controls = new OrbitControls(this.camera, this.canvasElement);

    this.setCamera();

    // this.controls.autoRotate = true;
    // this.controls.update();

    this.scene = new THREE.Scene();

    this.intro = new IntroRoom();

    this.roomGroup = new THREE.Group();

    // const geometry = new THREE.PlaneGeometry(1, 1);

    this.materials = this.rooms.map((room, index) => {
      // const rawShaderMaterialAttrs = getRawShaderMaterialAttrs({
      //   map: {
      //     value: loadedTexture.src,
      //   },
      //   options: {
      //     value: loadedTexture.options,
      //   },
      //   ...this.addBubbleUniform(index),
      // });

      // const material = new THREE.RawShaderMaterial(rawShaderMaterialAttrs);

      // material.needsUpdate = true;

      // const image = new THREE.Mesh(geometry, material);
      // image.scale.x = this.innerHeight * this.textureRatio / (this.textureHeight / this.innerHeight);
      // image.scale.y = this.innerHeight / (this.textureHeight / this.innerHeight);
      // image.position.x = this.getScenePosition(index);
      // image.position.z = this.camera.position.z * 0.5;

      // this.scene.add(image);

      const Elements = room.Elements;
      const elements = new Elements(room.elementsOptions);
      elements.rotation.y = index * 90 * THREE.Math.DEG2RAD;
      this.roomGroup.add(elements);

      // return material;
    });

    this.intro.position.z = 400;

    box.setFromObject(this.roomGroup);
    box.center(this.roomGroup.position); // this re-sets the mesh position
    this.roomGroup.position.multiplyScalar(-1);

    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);
    this.pivot.add(this.roomGroup);
    this.pivot.position.z = -200;
    this.pivot.position.y = 130;

    this.scene.add(this.intro);
    this.introAnimationRequest = true;

    getSuitcase((mesh) => {
      this.scene.add(mesh);
    });

    this.setLight();

    // this.scene.overrideMaterial = new THREE.MeshBasicMaterial({color: 'green'});
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

    // const magnifiedIndex = this.rooms.findIndex((texture) => texture.options.magnify);

    // const {width} = this.getSceneSize();
    // const pixelRatio = this.renderer.getPixelRatio();

    // this.materials[magnifiedIndex].uniforms.magnification.value.resolution = [width * pixelRatio, width / this.textureRatio * pixelRatio];
  }

  changeScene(index) {
    this.currentScene = index;
    this.setCamera();
    this.setLight();

    if (index >= 1) {
      const roomIndex = index - 1;

      this.pivot.rotation.y = -roomIndex * 90 * THREE.Math.DEG2RAD;


      if (this.rooms[roomIndex].options.magnify) {
        this.resetBubbles();
        this.animateBubbles();
      }

      if (this.getHueAnimationSettings(roomIndex)) {
        if (!this.hueIsAnimating) {
          this.resetHue();
          this.animateHue();
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  getScenePosition(index) {
    return this.innerWidth * index;
  }

  getSceneSize() {
    this.renderer.getSize(this.sceneSize);
    return this.sceneSize;
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
        this.rooms[index].options.hueShift = hueAnimationSettings.initalHue;
        return;
      }

      const hueShift = tick(from, to, progress);
      this.rooms[index].options.hueShift = hueShift;
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


    if (this.introAnimationRequest) {
      requestAnimationFrame(this.render);
    }
  }
}
