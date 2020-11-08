import * as THREE from 'three';

import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import awaitLoader from '../await-loader';

const svgLoader = new SVGLoader();

const svgPaths = [
  {
    name: `flamingo`,
    src: `img/extrude/flamingo.svg`,
    height: 85,
    depth: 8,
    cap: 2,
    color: `#fe6183`,
  },
  {
    name: `snowflake`,
    src: `img/extrude/snowflake.svg`,
    height: 74,
    depth: 8,
    cap: 2,
    color: `#3b7bf2`,
  },
  {
    name: `question`,
    src: `img/extrude/question.svg`,
    height: 56,
    depth: 8,
    cap: 2,
    color: `#3b7bf2`,
  },
  {
    name: `leaf-1`,
    src: `img/extrude/leaf.svg`,
    height: 117,
    depth: 8,
    cap: 2,
    color: `#34df96`,
  },
  {
    name: `keyhole`,
    src: `img/extrude/keyhole.svg`,
    height: 2000,
    depth: 20,
    cap: 2,
    color: `#a67ee5`,
  },
  {
    name: `flower`,
    src: `img/extrude/flower.svg`,
    height: 413,
    depth: 4,
    cap: 2,
    color: `#2873f0`,
  },
  {
    name: `leaf-2`,
    src: `img/extrude/leaf.svg`,
    height: 335.108,
    depth: 3,
    cap: 3,
    color: `#34df96`,
  },
];

const createSvgGroup = (data, settings) => {
  const paths = data.paths;
  const group = new THREE.Group();

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(settings.color),
    });

    const shapes = path.toShapes(true);

    for (let j = 0; j < shapes.length; j++) {

      const shape = shapes[j];
      const geometry = new THREE.ExtrudeBufferGeometry(shape, {
        steps: 2,
        depth: settings.depth,
        bevelEnabled: true,
        bevelThickness: settings.cap,
        bevelSize: settings.cap,
        bevelOffset: 0,
        bevelSegments: 1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    }
  }

  group.name = settings.name;

  return group;
};

export default svgPaths.reduce(async (resultPromise, path) => {
  const data = await awaitLoader(svgLoader, path.src);
  const svgGroup = createSvgGroup(data, path);

  const result = await resultPromise;
  result.add(svgGroup);
  return result;
}, new THREE.Group());
