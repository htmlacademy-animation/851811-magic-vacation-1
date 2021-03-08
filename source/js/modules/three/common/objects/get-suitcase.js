import {loadModel} from '../../common/load-model';
import {setMeshParams} from '../../common/helpers';
import {isMobile} from '../../../helpers';

export default (callback) => {
  const suitcase = {
    name: `suitcase`,
    type: `gltf`,
    path: `img/models/suitcase.gltf`,
    scale: 0.3,
    position: {x: -105, y: -93, z: 30},
    rotate: {x: 0, y: -20, z: 0},
    ...!isMobile && {
      receiveShadow: true,
      castShadow: true,
    }
  };

  loadModel(suitcase, null, (mesh) => {
    mesh.name = suitcase.name;
    setMeshParams(mesh, suitcase);
    callback(mesh);
  });
};
