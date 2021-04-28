import * as THREE from 'three';

import getSvgObject from '../../common/svg-object';
import colors from '../../common/colors';
import materialReflectivity from '../../common/material-reflectivity';
import {loadModel} from '../../common/load-model';
import {setMeshParams, getMaterial} from '../../common/helpers';
import {isMobile} from '../../../helpers';
import Saturn from '../../common/objects/saturn';

import {
  animateEasingWithFramerate,
  tick
} from '../../../canvas/common/helpers';
import bezierEasing from '../../../canvas/common/bezier-easing';

const easeOut = bezierEasing(0.0, 0.0, 0.58, 1.0);
const linear = bezierEasing(0.0, 0.0, 1.0, 1.0);

class IntroRoom extends THREE.Group {
  constructor() {
    super();

    this.svgs = [
      {
        name: `keyhole`,
        scale: 1,
        position: {x: -1000, y: 1000, z: 10},
        ...!isMobile && {
          receiveShadow: true,
        }
      },
      {
        name: `flamingo`,
        scale: {x: -2, y: 2, z: 2},
        position: {x: -200, y: 150, z: 100},
        rotate: {x: 20, y: 0, z: 0},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      },
      {
        name: `snowflake`,
        scale: 1.2,
        position: {x: -300, y: 0, z: 100},
        rotate: {x: 20, y: 40, z: 0},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      },
      {
        name: `question`,
        position: {x: 150, y: -100, z: 100},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      },
      {
        name: `leaf-1`,
        scale: {x: -1.2, y: 1.2, z: 1.2},
        position: {x: 250, y: 200, z: 100},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      },
    ];

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
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      },
      {
        name: `suitcase`,
        type: `gltf`,
        path: `img/models/suitcase.gltf`,
        scale: 0.4,
        position: {x: -50, y: -100, z: 30},
        rotate: {x: 40, y: -120, z: 20},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      },
      {
        name: `watermelon`,
        type: `gltf`,
        path: `img/models/watermelon.gltf`,
        scale: 1,
        position: {x: -370, y: -100, z: 40},
        rotate: {x: 0, y: 0, z: 130},
        ...!isMobile && {
          receiveShadow: true,
          castShadow: true,
        },
        flightAnimation: true,
      },
    ];

    this.saturn = {
      name: `saturn`,
      scale: 0.5,
      position: {x: 300, y: 0, z: 100},
      flightAnimation: true,
    };

    this.animationDuration = 2000;

    this.animationObjects = [...this.svgs, ...this.models, this.saturn].reduce((acc, object) => ({
      ...acc,
      [object.name]: {
        name: object.name,
        finalSettings: {
          position: object.position,
          ...object.scale && {scale: object.scale},
          ...object.rotate && {rotate: object.rotate},
        },
        initialSettings: {
          position: {x: 0, y: 0, z: 0},
          ...object.scale && {scale: typeof object.scale === `number` ? 0 : {x: 0, y: 0, z: 0}},
          ...object.rotate && {rotate: {x: 0, y: 0, z: 0}},
        },
        maxAmplitude: Math.random() * (30 - 5) + 5,
        positionChangeTimeout: Math.random() * 300,
      },
    }), {});

    this.constructChildren();
  }

  constructChildren() {
    this.loadSvgs();
    this.loadModels();
    this.addSaturn();
  }

  loadSvgs() {
    this.svgs.forEach((params) => {
      getSvgObject({name: params.name}, (mesh) => {
        mesh.name = params.name;
        this.add(mesh);
        if (params.flightAnimation) {
          this.animationObjects[params.name].ref = mesh;
          setMeshParams(mesh, this.animationObjects[params.name].initialSettings);
        } else {
          setMeshParams(mesh, params);
        }
      });
    });
  }

  loadModels() {
    this.models.forEach((params) => {
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
    this.add(saturn);
    this.animationObjects.saturn.ref = saturn;
    setMeshParams(saturn, this.animationObjects.saturn.initialSettings);
  }

  flightAnimationTick(object) {
    return (progress) => {
      const {ref, initialSettings, finalSettings} = object;
      const params = progressEachSetting(initialSettings, finalSettings, progress);
      setMeshParams(ref, params);
    };
  }

  positionAnimationTick(object) {
    return (progress) => {
      const {ref, maxAmplitude, finalSettings} = object;
      const offset = maxAmplitude * Math.sin(progress * 10 * Math.PI);
      const y = offset + finalSettings.position.y;

      setMeshParams(ref, {...finalSettings, position: {...finalSettings.position, y}});
      if (progress >= 1) {
        this.onAnimationEnd();
      }
    };
  }

  startAnimation() {
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
        setTimeout(() => {
          animateEasingWithFramerate(this.positionAnimationTick(object), this.animationDuration * 5, linear);
        }, object.positionChangeTimeout);
      });
  }
}

export default IntroRoom;

function progressEachSetting(initial, final, progress) {
  if (typeof initial === `number`) {
    return tick(initial, final, progress);
  }

  return Object.keys(initial).reduce((acc, key) => {
    return {...acc, [key]: progressEachSetting(initial[key], final[key], progress)};
  }, {});
}
