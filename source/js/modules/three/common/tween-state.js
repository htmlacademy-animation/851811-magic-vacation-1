import {progressEachSetting, smootherEndEasing} from './helpers';
import {tick} from '../../canvas/common/helpers';

class TweenState {
  constructor(object, newPosition, duration, onComplete) {
    this.object = object;
    this.duration = duration;
    this.startTime = -1;
    this.progress = 0;
    this.isComplete = false;
    this.onComplete = onComplete;

    const params = Object.keys(newPosition).filter((param) => object[param] !== newPosition[param]);

    this.params = params.map((paramName) => ({
      paramName,
      from: object[paramName],
      to: newPosition[paramName]
    }));
  }

  update(dt, t) {
    if (this.isComplete) {
      return;
    }

    if (this.progress >= 1) {
      if (!this.isComplete) {
        if (typeof this.onComplete === `function`) {
          this.onComplete.call(null);
        }
        this.isComplete = true;
      }

      return;
    }

    if (this.startTime < 0) {
      if (t) {
        this.startTime = t;
      }

      return;
    }

    let progress = (t - this.startTime) / this.duration;
    let easeProgress = smootherEndEasing(progress);

    if (progress > 1) {
      progress = 1;
    }

    this.progress = progress;

    if (this.params.length < 1) {
      return;
    }

    this.params.forEach(({paramName, from, to}) => {
      this.object[paramName] = progressEachSetting(from, to, easeProgress, tick);
    });
  }

  stop() {
    if (this.onComplete) {
      this.onComplete();
    }
    this.isComplete = true;
  }
}

export default TweenState;
