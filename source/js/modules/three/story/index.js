import * as THREE from 'three';
import {animateEasing, animateEasingWithFramerate, tick} from '../../canvas/common/helpers';
import bezierEasing from '../../canvas/common/bezier-easing';
import loadManager from '../common/load-manager';
import {isMobile} from '../../helpers';
import CameraRig from '../common/camera-rig';
import {getLightConfig, createLight} from '../common/lights';
import {ScreenName, ScreenId} from '../common/vars';
import {setMeshParams} from '../common/helpers';
import hideObjectsMobile from '../common/hide-objects-on-mobile';

import rooms from '../common/get-room-settings';
import getSuitcase from '../common/objects/get-suitcase';
import getCameraSettings from '../common/get-camera-settings';
import ProgressBar from './progress-bar';

const easeInOut = bezierEasing(0.42, 0, 0.58, 1);
const easeIn = bezierEasing(0.42, 0, 1, 1);

const box = new THREE.Box3();

export default class Story {
  constructor() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.isPortrait = window.innerHeight > window.innerWidth;

    this.canvasCenter = {x: this.innerWidth / 2, y: this.innerHeight / 2};

    this.canvasSelector = `background-canvas--story`;

    this.roomAnimations = {};
    this.roomAnimationsCount = 0;
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
    this.far = 1605;
    this.position = {
      z: 1605,
    };

    this.cameraSettings = getCameraSettings(this.position.z, this.isPortrait);

    const lights = getLightConfig(this.position.z);
    this.screenLights = {
      [ScreenName.intro]: () => createLight(lights.intro, ScreenName.intro),
      [ScreenName.room]: () => createLight(lights.room, ScreenName.room),
    };

    this.currentScene = 0;

    this.sceneSize = new THREE.Vector2();

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

  setLight() {
    if (isMobile) {
      return;
    }

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

  setRigPosition(index) {
    this.rigUpdating = true;
    if (this.currentScene === 0) {
      const isBack = this.previousScene > 1;

      const rigRotation = {
        ...this.cameraSettings.intro.rigRotation,
        y: isBack ? this.rig.rigRotation.y : this.cameraSettings.intro.rigRotation.y
      };
      const settings = {
        ...this.cameraSettings.intro,
        rigRotation,
      };

      this.rig.changeStateTo(settings, () => {
        if (isBack) {
          setMeshParams(this.introPivot, {rotate: {x: 0, y: 0, z: 0}});
          this.rig.rigRotation = this.cameraSettings.intro.rigRotation;
        }

        this.rigUpdating = false;
      });
    } else {
      const roomIndex = index - 1;
      const rotate = roomIndex * 90;

      const rigRotation = {...this.cameraSettings.room.rigRotation, y: rotate};
      const rigTilt = {
        ...this.cameraSettings.room.rigTilt,
        ...roomIndex === 0 && {x: 0}
      };

      const settings = {
        ...this.cameraSettings.room,
        rigRotation,
        rigTilt,
      };

      this.intro.fadeOutAnimation();
      this.rig.changeStateTo(settings, () => {
        this.intro.resetFadeOutAnimation();
        this.rigUpdating = false;
      });

      if (this.rotateSuitcase) {
        this.rotateSuitcase({x: 0, y: rotate, z: 0});
      }

      const light = this.scene.getObjectByName(`light-room`);
      if (light) {
        setMeshParams(light, {rotate: {x: 0, y: rotate, z: 0}});
      }
      if (this.introPivot) {
        setMeshParams(this.introPivot, {rotate: {x: 0, y: rotate, z: 0}});
      }
    }

    if (this.controls) {
      this.controls.update();
    }
  }

  init(rawName) {
    const screenName = ScreenName[rawName];

    if (!this.initialized) {
      this.prepareScene(screenName);
      this.initialized = true;

      this.intro.visible = false;
      this.roomGroup.visible = false;

      this.progressBar = new ProgressBar();
      this.scene.add(this.progressBar);
      this.position.z = 700;

      loadManager.onProgress = (_, itemsLoaded, itemsTotal) => {
        this.progressBar.setRatio(Math.round(itemsLoaded / itemsTotal * 100) / 100);
      };

      loadManager.onLoad = () => {
        this.scene.remove(this.progressBar);

        this.intro.visible = true;
        this.roomGroup.visible = true;
        this.renderer.render(this.scene, this.camera);
        this.intro.startAnimation();
        this.intro.onAnimationEnd = () => {
          this.introAnimationRequest = false;
        };
      };

      window.addEventListener(`mousemove`, (event) => {
        this.mouseMoving = true;

        this.rig.handleMouseMove(event, () => {
          this.mouseMoving = false;
        });
      });
    }

    if (!this.animationRequest) {
      window.addEventListener(`resize`, this.handleResize);
      this.animationRequest = requestAnimationFrame(this.render);
    }

    this.changeScene(ScreenId[screenName]);
  }

  prepareScene(screenName) {
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

    this.scene = new THREE.Scene();

    this.rig = new CameraRig(this.cameraSettings[screenName]);
    this.rig.addObjectToCameraNull(this.camera);
    this.scene.add(this.rig);
    this.setRigPosition();
    this.setRigAnimation();

    const [intro, ...slider] = rooms;

    const {Elements: IntroRoom} = intro;
    this.intro = new IntroRoom(this.isPortrait);

    this.roomGroup = new THREE.Group();
    slider.forEach((room, index) => {
      const Elements = room.Elements;
      const elements = new Elements(room.elementsOptions);
      elements.rotation.y = index * 90 * THREE.Math.DEG2RAD;
      this.roomGroup.add(elements);
      this.roomAnimations = {
        ...this.roomAnimations,
        [index + 1]: elements.startAnimation,
      };
    });

    box.setFromObject(this.roomGroup);
    box.center(this.roomGroup.position); // this re-sets the mesh position
    this.roomGroup.position.multiplyScalar(-1);

    box.setFromObject(this.intro);
    box.center(this.intro.position); // this re-sets the mesh position
    this.intro.position.multiplyScalar(-1);

    this.roomPivot = new THREE.Group();
    this.scene.add(this.roomPivot);
    this.roomPivot.add(this.roomGroup);
    setMeshParams(this.roomPivot, {position: {x: 0, y: 130, z: 0}, scale: this.isPortrait ? 0.8 : 1});

    this.introPivot = new THREE.Group();
    this.scene.add(this.introPivot);
    this.introPivot.add(this.intro);
    this.intro.position.z = 600;

    this.introAnimationRequest = true;

    getSuitcase((suitcase, animateSuitcase, rotateSuitcase) => {
      const rotationGroup = new THREE.Group();
      this.roomGroup.add(rotationGroup);
      rotationGroup.add(suitcase);
      rotationGroup.position.y = 0;

      this.animateSuitcase = (callback) => animateSuitcase(suitcase, callback);
      this.rotateSuitcase = (rotation) => rotateSuitcase(rotation, rotationGroup);
      if (this.currentScene === 1 && !this.suitcaseAnimated) {
        this.roomAnimationsCount += 1;
        this.render();
        this.animateSuitcase(() => {
          this.roomAnimationsCount -= 1;
        });
        this.suitcaseAnimated = true;
      }
    });

    this.setLight();
    hideObjectsMobile(this.scene);
  }

  end() {
    window.removeEventListener(`resize`, this.handleResize);

    this.animationRequest = null;
  }

  handleResize() {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    const isPortrait = window.innerHeight > window.innerWidth;

    if (isPortrait !== this.isPortrait) {
      this.isPortrait = isPortrait;
      this.cameraSettings = getCameraSettings(this.position.z, this.isPortrait);
      this.setRigPosition(this.currentScene);
      this.intro.portrait = this.isPortrait;
      setMeshParams(this.roomPivot, {scale: this.isPortrait ? 0.8 : 1});
    }

    this.updateScreenSize();
  }

  updateScreenSize() {
    this.canvasElement.width = this.innerWidth;
    this.canvasElement.height = this.innerHeight;

    this.camera.fov = this.getFov();
    this.camera.aspect = this.innerWidth / this.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.innerWidth, this.innerHeight);
  }

  changeScene(index) {
    if (index === this.currentScene) {
      return;
    }

    this.previousScene = this.currentScene;
    this.currentScene = index;
    this.setRigPosition(index);
    this.setLight();

    if (this.currentScene === 1 && this.animateSuitcase && !this.suitcaseAnimated) {
      this.animateSuitcase();
    }

    const roomAnimation = this.roomAnimations[this.currentScene];
    if (roomAnimation) {
      this.roomAnimationsCount += 1;

      this.render();
      roomAnimation(() => {
        this.roomAnimationsCount -= 1;
      });
    }

    if (index >= 1) {
      const roomIndex = index - 1;

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

  setRigAnimation() {
    let startTime = -1;
    let time = -1;
    this.updateRig = () => {
      const nowT = Date.now();

      if (startTime < 0) {
        startTime = time = nowT;

        return;
      }

      const t = (nowT - startTime) * 0.001;
      const dt = (nowT - time) * 0.001;

      this.rig.update(dt, t);

      time = nowT;
    };
  }

  render() {
    this.renderer.render(this.scene, this.camera);

    if (this.introAnimationRequest || this.roomAnimationsCount > 0 || this.mouseMoving) {
      requestAnimationFrame(this.render);
    }

    if (this.rigUpdating) {
      this.updateRig();
    }
  }
}
