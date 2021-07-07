export const tick = (from, to, progress) => from + progress * (to - from);

export const animateDuration = (render, duration) => new Promise((resolve) => {
  let start = Date.now();
  (function loop() {
    let p = Date.now() - start;
    if (p > duration) {
      render(duration);
      resolve(true);
    } else {
      requestAnimationFrame(loop);
      render(p);
    }
  }());
});

export const animateProgress = (render, duration) => new Promise((resolve) => {
  let start = Date.now();
  (function loop() {
    let p = (Date.now() - start) / duration;
    if (p > 1) {
      render(1);
      resolve(true);
    } else {
      requestAnimationFrame(loop);
      render(p);
    }
  }());
});

export const animateEasing = (render, duration, easing) => new Promise((resolve) => {
  let start = Date.now();
  (function loop() {
    let p = (Date.now() - start) / duration;
    if (p > 1) {
      render(1);
      resolve(true);
    } else {
      requestAnimationFrame(loop);
      render(easing(p));
    }
  }());
});

export const animateEasingWithFramerate = (render, duration, easing, framerate = 1000 / 25) => new Promise((resolve) => {
  let start = null;
  let lastFrameUpdateTime = null;
  let timePassedSinceLastUpdate = null;

  function loop(currentTime) {
    if (!start) {
      start = currentTime;
    }

    if (!lastFrameUpdateTime) {
      lastFrameUpdateTime = currentTime;
    }

    let progress = (currentTime - start) / duration;
    if (progress > 1) {
      render(easing(1));
      resolve(true);
      return;
    }

    timePassedSinceLastUpdate = currentTime - lastFrameUpdateTime;
    if (timePassedSinceLastUpdate > framerate) {
      lastFrameUpdateTime = currentTime;

      render(easing(progress));
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});

export const runSerial = async (tasks) => {
  let result = Promise.resolve();
  tasks.forEach((task) => {
    result = result.then(task);
  });
  return result;
};
