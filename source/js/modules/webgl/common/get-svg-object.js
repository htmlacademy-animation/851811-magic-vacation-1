import * as THREE from 'three';

import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import colors from './colors';
import materialReflectivity from './material-reflectivity';
import loadManager from './load-manager';
import {getMaterial} from './helpers';

const size = new THREE.Vector3();
const box = new THREE.Box3();

const svgPaths = [
  {
    name: `flamingo`,
    src: `img/extrude/flamingo.svg`,
    height: 85,
    depth: 8,
    cap: 2,
    color: colors.LightDominantRed,
    materialReflectivity: materialReflectivity.soft,
  },
  {
    name: `snowflake`,
    src: `img/extrude/snowflake.svg`,
    height: 74,
    depth: 8,
    cap: 2,
    color: colors.Blue,
    materialReflectivity: materialReflectivity.basic,
  },
  {
    name: `question`,
    src: `img/extrude/question.svg`,
    height: 56,
    depth: 8,
    cap: 2,
    color: colors.Blue,
    materialReflectivity: materialReflectivity.basic,
  },
  {
    name: `leaf-1`,
    src: `img/extrude/leaf.svg`,
    height: 117,
    depth: 8,
    cap: 2,
    color: colors.Green,
    materialReflectivity: materialReflectivity.basic,
  },
  {
    name: `keyhole`,
    src: `img/extrude/keyhole.svg`,
    height: 2000,
    depth: 20,
    cap: 2,
    color: colors.DarkPurple,
    materialReflectivity: materialReflectivity.basic,
    children: [
      {
        name: `keyhole-plane`,
        content: new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), getMaterial({
          color: colors.Purple,
          side: THREE.DoubleSide,
          ...materialReflectivity.basic,
        })),
      }
    ],
  },
  {
    name: `flower`,
    src: `img/extrude/flower.svg`,
    height: 413,
    depth: 4,
    cap: 2,
    color: colors.Blue,
    materialReflectivity: materialReflectivity.basic,
  },
  {
    name: `flower-dark`,
    src: `img/extrude/flower.svg`,
    height: 413,
    depth: 4,
    cap: 2,
    color: colors.DarkBlue,
    materialReflectivity: materialReflectivity.basic,
  },
  {
    name: `leaf-2`,
    src: `img/extrude/leaf.svg`,
    height: 335.108,
    depth: 3,
    cap: 3,
    color: colors.Green,
    materialReflectivity: materialReflectivity.basic,
  },
];

const createSvgGroup = (data, settings) => {
  const {paths} = data;
  const group = new THREE.Group();

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];

    const material = getMaterial({
      color: settings.color,
      side: THREE.DoubleSide,
      ...settings.materialReflectivity,
    });

    const shapes = path.toShapes();

    for (let j = 0; j < shapes.length; j++) {

      const shape = shapes[j];
      const geometry = new THREE.ExtrudeBufferGeometry(shape, {
        steps: 2,
        depth: settings.depth,
        bevelEnabled: true,
        bevelThickness: settings.cap,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 10,
      });
      geometry.applyMatrix4(new THREE.Matrix4().makeScale(1, -1, 1));
      const mesh = new THREE.Mesh(geometry, material);

      if (settings.children && Array.isArray(settings.children)) {
        settings.children.forEach(({name, content}) => {
          content.castShadow = true;
          content.receiveShadow = true;
          content.name = name;

          box.setFromObject(content).getSize(size);
          content.position.set(size.x / 2, -size.y / 2, 1);

          group.add(content);
        });
      }

      group.add(mesh);
    }
  }

  group.name = settings.name;

  return group;
};

const loader = new SVGLoader(loadManager);
const cache = {};

const getSvg = ({name, ...params}, callback) => {
  if (cache[name]) {
    callback(cache[name]);
  } else {
    const path = svgPaths.find((item) => item.name === name);
    loader.load(path.src, (data) => {
      const result = createSvgGroup(data, {...path, ...params});
      cache[name] = result;
      callback(result);
    });
  }
};

export default getSvg;
