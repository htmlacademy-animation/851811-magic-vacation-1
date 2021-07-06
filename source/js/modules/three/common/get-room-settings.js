import IntroRoom from '../story/intro-room';
import FirstRoom from '../story/first-room';
import SecondRoom from '../story/second-room';
import ThirdRoom from '../story/third-room';

export const defaultHue = 0.0;

const rooms = [
  {Elements: IntroRoom},
  {Elements: FirstRoom},
  {
    options: {hueShift: -0.26, magnify: true},
    animationSettings: {
      hue: {
        initalHue: -0.1,
        finalHue: -0.26,
        variation: 0.3,
      },
    },
    Elements: SecondRoom,
  },
  {Elements: ThirdRoom},
  {
    Elements: FirstRoom,
    elementsOptions: {dark: true},
  },
].map((room) => ({
  ...room,
  options: room.options || {hueShift: defaultHue, magnify: false},
  animationSettings: room.animationSettings || {hue: {initalHue: defaultHue, finalHue: defaultHue, variation: defaultHue}}
}));

export default rooms;
