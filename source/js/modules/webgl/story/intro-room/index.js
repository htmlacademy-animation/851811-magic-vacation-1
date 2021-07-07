import * as THREE from 'three';

import getSvgObject from '../../common/get-svg-object';
import {loadModel} from '../../common/load-model';
import {setMeshParams, getMaterial, progressEachSetting} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import Saturn from '../../common/objects/saturn';
import getSuitcase from './get-suitcase';
import getAirplane from './get-airplane';
import {animateKeyholePlane, resetKeyholePlane} from './animate-keyhole-plane';

import {
  animateEasingWithFramerate,
  tick
} from '../../../canvas/common/helpers';
import bezierEasing from '../../../canvas/common/bezier-easing';

const easeOut = bezierEasing(0.0, 0.0, 0.58, 1.0);
const linear = bezierEasing(0.0, 0.0, 1.0, 1.0);

const initialCoords = {x: 0, y: 0, z: 0};

class IntroRoom extends THREE.Group {
  constructor(isPortrait) {
    super();

    this.isPortrait = isPortrait;

    this.svgs = [
      () => ({
        name: `keyhole`,
        scale: 1,
        position: {x: -1000, y: 1000, z: 10},
        ...!isMobile && {
          receiveShadow: true,
        },
      }),
      () => ({
        name: `flamingo`,
        scale: {x: -2, y: 2, z: 2},
        position: {x: this.isPortrait ? -50 : -200, y: 150, z: 100},
        rotate: {x: 20, y: 0, z: 0},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      }),
      () => ({
        name: `snowflake`,
        scale: 1.2,
        position: {x: this.isPortrait ? -200 : -300, y: 0, z: 100},
        rotate: {x: 20, y: 40, z: 0},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      }),
      () => ({
        name: `question`,
        position: {x: this.isPortrait ? 100 : 150, y: this.isPortrait ? -150 : -100, z: 100},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      }),
      () => ({
        name: `leaf-1`,
        scale: {x: -1.2, y: 1.2, z: 1.2},
        position: {x: this.isPortrait ? 200 : 250, y: 200, z: 100},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      }),
    ];

    this.models = [
      () => ({
        name: `watermelon`,
        type: `gltf`,
        path: `img/models/watermelon.gltf`,
        scale: 1,
        position: {x: this.isPortrait ? -200 : -370, y: this.isPortrait ? -200 : -100, z: 40},
        rotate: {x: 0, y: 0, z: 130},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      }),
    ];

    this.saturn = () => ({
      name: `saturn`,
      scale: 0.5,
      position: {x: this.isPortrait ? 100 : 300, y: 0, z: 100},
      flightAnimation: true,
    });

    this.allElements = [
      ...this.svgs,
      ...this.models,
      this.saturn,
    ];

    this.animationDuration = 2000;

    this.animationObjects = getObjectsWithAnimationProps(this.allElements);

    this.fadeOutAnimation = this.fadeOutAnimation.bind(this);
    this.resetFadeOutAnimation = this.resetFadeOutAnimation.bind(this);

    this.constructChildren();
  }

  constructChildren() {
    this.loadSvgs();
    this.loadModels();
    this.addSaturn();
    this.addSuitcase();
    this.addAirplane();
  }

  loadSvgs() {
    this.svgs.forEach((getParams) => {
      const params = getParams();

      getSvgObject({name: params.name}, (mesh) => {
        mesh.name = params.name;
        this.add(mesh);
        if (params.flightAnimation) {
          this.animationObjects[params.name].ref = mesh;
          setMeshParams(mesh, this.animationObjects[params.name].initialSettings);
        } else {
          setMeshParams(mesh, params);
        }
        if (params.name === `keyhole`) {
          const keyholePlane = mesh.getObjectByName(`keyhole-plane`);
          this.animateKeyholePlane = () => animateKeyholePlane(keyholePlane);
          this.resetKeyholePlane = () => resetKeyholePlane(keyholePlane);
        }
      });
    });
  }

  loadModels() {
    this.models.forEach((getParams) => {
      const params = getParams();

      const material = params.color && getMaterial({color: params.color, ...params.materialReflectivity});

      loadModel(params, material, (mesh) => {
        mesh.name = params.name;
        this.add(mesh);
        this.animationObjects[params.name].ref = mesh;
        setMeshParams(mesh, this.animationObjects[params.name].initialSettings);
      });
    });
  }

  addSaturn() {
    const saturn = new Saturn({basic: true});
    saturn.name = this.saturn().name;
    this.add(saturn);
    this.animationObjects.saturn.ref = saturn;
    setMeshParams(saturn, this.animationObjects.saturn.initialSettings);
  }

  addSuitcase() {
    getSuitcase((mesh, animateSuitcase) => {
      this.suitcase = mesh;
      this.add(mesh);
      animateSuitcase(mesh, () => {
        this.setIdleAnimation({
          maxAmplitude: 1,
          positionChangeTimeout: 300,
          ref: mesh,
          finalSettings: {
            position: mesh.position,
          }
        });
      });
    });
  }

  addAirplane() {
    getAirplane((mesh, animateAirplane) => {
      this.add(mesh);
      animateAirplane(mesh, () => {
        this.setIdleAnimation({
          maxAmplitude: 1,
          positionChangeTimeout: 250,
          ref: mesh,
          finalSettings: {
            position: mesh.position,
          }
        });
      });
    });
  }

  flightAnimationTick(object) {
    return (progress) => {
      if (!this.animationRequest) {
        return;
      }

      const {ref, initialSettings, finalSettings} = object;
      const params = progressEachSetting(initialSettings, finalSettings, progress, tick);
      setMeshParams(ref, params);
    };
  }

  positionAnimationTick(object) {
    return (progress) => {
      if (!this.animationRequest) {
        return;
      }
      const {ref, maxAmplitude, finalSettings} = object;
      const offset = maxAmplitude * Math.sin(progress * 10 * Math.PI);
      const y = offset + finalSettings.position.y;

      setMeshParams(ref, {...finalSettings, position: {...finalSettings.position, y}});
    };
  }

  startAnimation() {
    this.animationRequest = true;
    Object.values(this.animationObjects).forEach((object) => {
      this.updateObjectPosition(object);
    });
  }

  updateObjectPosition(object) {
    const ref = object.ref;
    if (!ref) {
      return;
    }

    animateEasingWithFramerate(this.flightAnimationTick(object), this.animationDuration, easeOut)
      .then(() => {
        this.setIdleAnimation(object);
      });
  }

  setIdleAnimation(object) {
    setTimeout(() => {
      animateEasingWithFramerate(this.positionAnimationTick(object), this.animationDuration * 7, linear).then(this.onAnimationEnd);
    }, object.positionChangeTimeout);
  }

  fadeOutAnimation() {
    if (!this.keyholePlaneAnimated && this.animateKeyholePlane) {
      this.animateKeyholePlane();
      this.keyholePlaneAnimated = true;
    }
  }

  resetFadeOutAnimation() {
    if (this.keyholePlaneAnimated && !this.keyholePlaneReset && this.resetKeyholePlane) {
      this.resetKeyholePlane();
      this.keyholePlaneReset = true;
    }
  }

  set portrait(value) {
    this.animationRequest = null;

    this.isPortrait = value;
    this.allElements.forEach((getParams) => {
      const {name, position} = getParams();
      const element = this.getObjectByName(name);
      setMeshParams(element, {position});
    });
  }
}

export default IntroRoom;

function getObjectsWithAnimationProps(objects) {
  const minAmplitude = 2;
  const maxAmplitude = 10;

  const positionChangeTimeout = 500;

  return objects.reduce((acc, getObject) => {
    const object = getObject();

    return {
      ...acc,
      [object.name]: {
        name: object.name,
        finalSettings: {
          position: object.position,
          ...object.scale && {scale: object.scale},
          ...object.rotate && {rotate: object.rotate},
        },
        initialSettings: {
          position: initialCoords,
          ...object.scale && {scale: getInitialObjectScale(object)},
          ...object.rotate && {rotate: initialCoords},
        },
        maxAmplitude: Math.random() * (maxAmplitude - minAmplitude) + minAmplitude,
        positionChangeTimeout: Math.random() * positionChangeTimeout,
      },
    };
  }, {});
}

function getInitialObjectScale(object) {
  return typeof object.scale === `number` ? 0 : initialCoords;
}
