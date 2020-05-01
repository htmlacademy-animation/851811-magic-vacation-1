export default () => {
  const body = document.querySelector(`.js-body`);
  const addReadyClass = () => {
    body.classList.add(`document__body_ready`);
  };
  window.addEventListener(`load`, addReadyClass);
};
