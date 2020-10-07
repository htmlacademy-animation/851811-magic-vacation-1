import animateTrip from '../../modules/canvas/trip';

const STROKE = {
  attributeName: `stroke-dasharray`,
  fill: `freeze`,
  keyTimes: `0; 1`,
};

const SCALE = {
  attributeName: `transform`,
  type: `scale`,
  values: `1.2 1.2; 1 1`,
  keyTimes: `0; 1`,
  dur: `0.5s`,
  fill: `freeze`,
  additive: `sum`,
};

const TRANSLATE_OPTIONS = {
  delay: 0.1,
  offset: 150,
};

const TRANSLATE = {
  attributeName: `transform`,
  type: `translate`,
  values: `0 0; 0 ${TRANSLATE_OPTIONS.offset}; 0 ${TRANSLATE_OPTIONS.offset + 20}; 0 ${TRANSLATE_OPTIONS.offset}`,
  keyTimes: `0; 0.8; 0.85; 1`,
  dur: `0.7s`,
  fill: `freeze`,
  additive: `sum`,
};

const OPACITY = {
  attributeName: `opacity`,
};

const createSvgAnimationElement = (tag) => document.createElementNS(`http://www.w3.org/2000/svg`, tag);

const setAnimationAttributes = ({element, attrs}) => {
  Object.keys(attrs).forEach((key) => {
    element.setAttribute(key, attrs[key]);
  });

  return element;
};

const createStrokeAnimation = ({id, begin, length, points, dur}) => {
  const dash = Math.round(length / points);

  return setAnimationAttributes({
    element: createSvgAnimationElement(`animate`),
    attrs: {
      id,
      begin,
      values: `0 ${dash}; ${dash} 0`,
      dur,
      ...STROKE,
    },
  });
};

const createTransformAnimation = ({id, values, begin}) => setAnimationAttributes({
  element: createSvgAnimationElement(`animateTransform`),
  attrs: {
    id,
    begin,
    ...values
  },
});

const createOpacitySet = ({id, to, begin}) => setAnimationAttributes({
  element: createSvgAnimationElement(`set`),
  attrs: {
    id,
    to,
    begin,
    ...OPACITY,
  },
});

const createVictoryAnimation = (element) => {
  const id = element.id.replace(/-/g, `_`);
  const firstAnimationId = `${id}_opacity`;

  element.setAttribute(`style`, `opacity: 0;`);

  element.appendChild(
      createOpacitySet({
        id: firstAnimationId,
        to: 1,
        begin: `indefinite`,
      })
  );

  element.appendChild(
      createTransformAnimation({
        id: `${id}_scale`,
        values: SCALE,
        begin: `${firstAnimationId}.begin`
      })
  );

  const parts = element.querySelectorAll(`path`);
  parts.forEach((part, index) => part.appendChild(
      createStrokeAnimation({
        id: `${id}_${index}_stroke`,
        begin: `${firstAnimationId}.begin`,
        length: part.getTotalLength(),
        points: 3,
        dur: `0.5s`,
      })
  ));

  document.querySelector(`#${firstAnimationId}`).beginElement();
};

const createFailAnimation = (element) => {
  const id = element.id.replace(/-/g, `_`);
  const firstAnimationId = `${id}_0_translate`;

  element.setAttribute(`style`, `transform: translate(0, -${TRANSLATE_OPTIONS.offset}px); overflow: visible;`);

  const parts = element.querySelectorAll(`path`);
  parts.forEach((part, index) => {
    const translationId = index === 0 ? firstAnimationId : `${id}_${index}_translate`;
    const staggeredDelay = TRANSLATE_OPTIONS.delay / 2 + TRANSLATE_OPTIONS.delay * 1 / (1 / index + 1);
    const translationBegin = index === 0 ? `indefinite` : `${id}_${index - 1}_translate.begin + ${staggeredDelay}s`;
    const opacityBegin = index === 0 ? `${firstAnimationId}.begin` : `${id}_${index - 1}_translate.begin + ${staggeredDelay}s`;
    const strokeBegin = opacityBegin;

    part.setAttribute(`style`, `opacity: 0;`);

    part.appendChild(
        createTransformAnimation({
          id: translationId,
          values: TRANSLATE,
          begin: translationBegin,
        })
    );

    part.appendChild(
        createOpacitySet({
          id: `${id}_${index}_opacity`,
          to: 1,
          begin: opacityBegin,
        })
    );

    part.appendChild(
        createStrokeAnimation({
          id: `${id}_${index}_stroke`,
          begin: strokeBegin,
          length: part.getTotalLength(),
          points: 2,
          dur: `0.4s`,
        })
    );
  });

  document.querySelector(`#${firstAnimationId}`).beginElement();
};

const startAnimationByClick = ({elementSelector, buttonSelector, createAnimation, callback}) => {
  const button = document.querySelector(buttonSelector);
  button.addEventListener(`click`, () => {
    const element = document.querySelector(elementSelector);
    createAnimation(element);
    if (callback) {
      callback();
    }
  });
};

export default () => {
  startAnimationByClick({
    elementSelector: `#result__title-svg_victory`,
    buttonSelector: `.js-show-result[data-target=result]`,
    createAnimation: createVictoryAnimation,
    callback: animateTrip,
  });

  startAnimationByClick({
    elementSelector: `#result__title-svg_victory2`,
    buttonSelector: `.js-show-result[data-target=result2]`,
    createAnimation: createVictoryAnimation,
  });

  startAnimationByClick({
    elementSelector: `#result__title-svg_fail`,
    buttonSelector: `.js-show-result[data-target=result3]`,
    createAnimation: createFailAnimation,
  });
};
