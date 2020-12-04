import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const loadObj = (path, onComplete) => {
  const loaderObj = new OBJLoader();

  loaderObj.load(path, onComplete);
};

const loadGltf = (path, onComplete) => {
  const loaderGltf = new GLTFLoader();

  loaderGltf.load(path, onComplete);
};

export const loadModel = (params, material, callback) => {
  if (!params) {
    return;
  }

  const onComplete = (obj3d) => {
    if (material) {
      obj3d.traverse((child) => {
        if (child.isMesh) {
          child.material = material;
        }
      });
    }

    if (typeof callback === `function`) {
      callback.call(null, obj3d);
    }
  };

  const onGltfComplete = (gltf) => {
    if (!gltf.scene) {
      return;
    }
    onComplete(gltf.scene);
  };

  switch (params.type) {
    case `gltf`:
      loadGltf(params.path, onGltfComplete);

      break;
    default:
      loadObj(params.path, onComplete);

      break;
  }
};
