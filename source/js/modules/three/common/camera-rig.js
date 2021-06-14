import * as THREE from 'three';
import {setMeshParams} from './helpers';

import TweenState from './tween-state';

class CameraRig extends THREE.Group {
  constructor(settings) {
    super();

    this._position = settings.rigPosition;
    this._rotation = settings.rigRotation;
    this._positionChanged = true;
    this._rotationChanged = true;
    this.tween = null;

    this.constructRigElements();

    this.invalidate();
  }

  constructRigElements() {
    const rotationTrack = new THREE.Group();
    const positionTrack = new THREE.Group();
    const cameraNull = new THREE.Group();

    this.add(rotationTrack);
    rotationTrack.add(positionTrack);
    positionTrack.add(cameraNull);

    this.positionTrack = positionTrack;
    this.rotationTrack = rotationTrack;
    this.cameraNull = cameraNull;
  }

  set rigPosition(value) {
    if (isValueTheSame(value, this._position)) {
      return;
    }
    this._position = value;
    this._positionChanged = true;
  }

  get rigPosition() {
    return this._position;
  }

  set rigRotation(value) {
    if (isValueTheSame(value, this._rotation)) {
      return;
    }
    this._rotation = value;
    this._rotationChanged = true;
  }

  get rigRotation() {
    return this._rotation;
  }

  invalidate() {
    if (this._positionChanged) {
      setMeshParams(this.positionTrack, {position: this._position});
      this._positionChanged = false;
    }

    if (this._rotationChanged) {
      setMeshParams(this.rotationTrack, {rotate: this._rotation});
      this._rotationChanged = false;
    }
  }

  addObjectToCameraNull(object) {
    this.cameraNull.add(object);
  }

  update(dt, t) {
    if (this.tween) {
      this.tween.update(dt, t);
    }
    this.invalidate();
  }

  changeStateTo(stateParameters, onComplete) {
    this.tween = new TweenState(this, stateParameters, 1.5, () => {
      this.tween = null;

      if (onComplete) {
        onComplete();
      }
    });
  }
}

export default CameraRig;

function isValueTheSame(current, prev) {
  return Object.keys(current).filter((key) => current[key] !== prev[key]) === 0;
}
