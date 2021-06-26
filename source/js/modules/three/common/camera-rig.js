import * as THREE from 'three';
import {setMeshParams} from './helpers';

import TweenState from './tween-state';

const defaultTiltAmplitude = 1;

class CameraRig extends THREE.Group {
  constructor(settings) {
    super();

    this._position = settings.rigPosition;
    this._rotation = settings.rigRotation;
    this._tilt = settings.rigTilt;
    this._positionChanged = true;
    this._rotationChanged = true;
    this._tiltChanged = true;
    this.tween = null;

    this.constructRigElements();

    this.invalidate();

    this.mouseMoveTimer = null;
  }

  constructRigElements() {
    const rotationTrack = new THREE.Group();
    const positionTrack = new THREE.Group();
    const tiltTrack = new THREE.Group();
    const cameraNull = new THREE.Group();

    this.add(rotationTrack);
    rotationTrack.add(positionTrack);
    positionTrack.add(tiltTrack);
    tiltTrack.add(cameraNull);

    this.positionTrack = positionTrack;
    this.rotationTrack = rotationTrack;
    this.tiltTrack = tiltTrack;
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

  set rigTilt(value) {
    if (isValueTheSame(value, this._tilt)) {
      return;
    }
    this._tilt = value;
    this._tiltChanged = true;
  }

  get rigTilt() {
    return this._tilt;
  }

  handleMouseMove(event, callback) {
    const positionY = (window.innerHeight / 2 - event.pageY) / window.innerHeight;
    const x = defaultTiltAmplitude * positionY;

    this._tilt = {...this.rigTilt, x};
    setMeshParams(this.tiltTrack, {rotate: this._tilt});
    this._tiltChanged = true;

    clearTimeout(this.mouseMoveTimer);
    this.mouseMoveTimer = setTimeout(callback, 500);
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

    if (this._tiltChanged) {
      setMeshParams(this.tiltTrack, {rotate: this._tilt});
      this._tiltChanged = false;
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
