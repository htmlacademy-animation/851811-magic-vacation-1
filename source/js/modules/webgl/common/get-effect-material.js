import * as THREE from 'three';

import bezierEasing from 'js/helpers/bezier-easing';
import {animateEasing, animateEasingWithFramerate, tick} from 'js/helpers/animation';
import hueAndBubblesRawShader from './hue-and-bubbles-raw-shader';
import {defaultHue, effectRoom} from './get-room-settings';

const duration = 3000;
const defaultFlareAngles = [5.0 * Math.PI / 8.0, 7 * Math.PI / 8.0];
const defaultFlareOffset = 0.8;

const getBubbleConfig = (canvasCenter, innerHeight, innerWidth) => ([
  {
    radius: 120.0,
    flareAngleStart: defaultFlareAngles[0],
    flareAngleEnd: defaultFlareAngles[1],
    flareOffset: defaultFlareOffset,
    initialPosition: [canvasCenter.x - canvasCenter.x / 10, -100],
    position: [canvasCenter.x - canvasCenter.x / 10, -100],
    finalPosition: [canvasCenter.x - canvasCenter.x / 10, innerHeight + 100],
    positionAmplitude: 50,
    timeout: 0,
  },
  {
    radius: 80.0,
    flareAngleStart: defaultFlareAngles[0],
    flareAngleEnd: defaultFlareAngles[1],
    flareOffset: defaultFlareOffset,
    initialPosition: [canvasCenter.x - innerWidth / 4, -100],
    position: [canvasCenter.x - innerWidth / 4, -100],
    finalPosition: [canvasCenter.x - innerWidth / 4, innerHeight + 100],
    positionAmplitude: 40,
    timeout: duration / 5,
  },
  {
    radius: 70.0,
    flareAngleStart: defaultFlareAngles[0],
    flareAngleEnd: defaultFlareAngles[1],
    flareOffset: defaultFlareOffset,
    initialPosition: [canvasCenter.x, -100],
    position: [canvasCenter.x, -100],
    finalPosition: [canvasCenter.x, innerHeight + 100],
    positionAmplitude: 30,
    timeout: duration / 4,
  },
]);

export const getBubbles = (canvasCenter, pixelRatio, innerHeight, innerWidth) => {
  const easeIn = bezierEasing(0.42, 0, 1, 1);

  const bubbles = getBubbleConfig(canvasCenter, innerHeight, innerWidth);

  const bubblePositionAnimationTick = (effectMaterial, index, from, to) => {
    return (progress) => {
      const y = tick(from[1], to[1], progress) * pixelRatio;
      const offset = bubbles[index].positionAmplitude * Math.pow(1 - progress, 0.8) * Math.sin(progress * Math.PI * 7);
      const x = (offset + bubbles[index].initialPosition[0]) * pixelRatio;

      effectMaterial.uniforms.magnification.value.bubbles[index].position = [x, y];
    };
  };

  return {
    getUniform: (room, resolution) => {
      if (!(room.options && room.options.magnify)) {
        return {};
      }

      return {magnification: {value: {bubbles, resolution}}};
    },
    animate: (effectMaterial) => {
      if (!effectMaterial.uniforms.magnification) {
        return;
      }

      effectMaterial.uniforms.options.value.magnify = true;

      bubbles.forEach((_, index) => {
        setTimeout(() => {
          animateEasing(bubblePositionAnimationTick(effectMaterial, index, bubbles[index].initialPosition, bubbles[index].finalPosition), duration, easeIn);
        }, bubbles[index].timeout);
      });
    },
    reset: (effectMaterial) => {
      if (!effectMaterial.uniforms.magnification) {
        effectMaterial.uniforms.options.value.magnify = false;

        return;
      }

      effectMaterial.uniforms.magnification.value.bubbles.map((_, index) => {
        bubbles[index].position = [...bubbles[index].initialPosition];
      });
    },
  };
};

export const getHue = () => {
  const easeInOut = bezierEasing(0.42, 0, 0.58, 1);

  let hueAnimating = false;

  const hueIntensityAnimationTick = (effectMaterial, from, to) => {
    if (!hueAnimating) {
      return () => {
        effectMaterial.uniforms.options.value.hueShift = defaultHue;
      };
    }

    return (progress) => {
      const hueShift = tick(from, to, progress);
      effectMaterial.uniforms.options.value.hueShift = hueShift;
    };
  };

  const defaultHueIntensityEasingFn = (timingFraction) => {
    return easeInOut(Math.sin(timingFraction * Math.PI));
  };

  return {
    animate: (effectMaterial) => {
      hueAnimating = true;

      const {initalHue, finalHue, variation} = effectRoom.animationSettings.hue;
      const offset = Math.random() * variation * 2 + (1 - variation);

      const iterate = () => {
        if (!hueAnimating) {
          return;
        }
        animateEasingWithFramerate(hueIntensityAnimationTick(effectMaterial, initalHue, finalHue * offset), duration * offset, defaultHueIntensityEasingFn).then(iterate);
      };

      iterate();
    },
    reset: (effectMaterial) => {
      hueAnimating = false;

      effectMaterial.uniforms.options.value.hueShift = defaultHue;
    },
  };
};

export default (texture, bubbleUniform, options) => {
  const params = hueAndBubblesRawShader({
    map: {
      value: texture
    },
    options: {
      value: {...options, hueShift: options.hueShift || 0.0},
    },
    ...bubbleUniform,
  });

  return new THREE.RawShaderMaterial(params);
};
