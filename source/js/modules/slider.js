import Swiper from "swiper";

export default () => {
  let storySlider;

  const setSlider = function () {
    if (((window.innerWidth / window.innerHeight) < 1) || window.innerWidth < 769) {
      storySlider = new Swiper(`.js-slider`, {
        pagination: {
          el: `.swiper-pagination`,
          type: `bullets`
        },
        keyboard: {
          enabled: true
        },
        on: {
          slideChange: () => {
            if (storySlider.activeIndex === 0 || storySlider.activeIndex === 1) {
              //
            } else if (storySlider.activeIndex === 2 || storySlider.activeIndex === 3) {
              //
            } else if (storySlider.activeIndex === 4 || storySlider.activeIndex === 5) {
              //
            } else if (storySlider.activeIndex === 6 || storySlider.activeIndex === 7) {
              //
            }
          },
          resize: () => {
            storySlider.update();
          }
        },
        observer: true,
        observeParents: true,
        slideActiveClass: `slider__item_current`,
        slidePrevClass: `slider__item_previous`,
        slideNextClass: `slider__item_next`,
      });
    } else {
      storySlider = new Swiper(`.js-slider`, {
        slidesPerView: 2,
        slidesPerGroup: 2,
        pagination: {
          el: `.swiper-pagination`,
          type: `fraction`
        },
        navigation: {
          nextEl: `.js-control-next`,
          prevEl: `.js-control-prev`,
        },
        keyboard: {
          enabled: true
        },
        on: {
          slideChange: () => {
            if (storySlider.activeIndex === 0) {
              //
            } else if (storySlider.activeIndex === 2) {
              //
            } else if (storySlider.activeIndex === 4) {
              //
            } else if (storySlider.activeIndex === 6) {
              //
            }
          },
          resize: () => {
            storySlider.update();
          }
        },
        observer: true,
        observeParents: true,
        slideActiveClass: `slider__item_current`,
        slidePrevClass: `slider__item_previous`,
        slideNextClass: `slider__item_next`,
      });
    }
  };

  window.addEventListener(`resize`, function () {
    if (storySlider) {
      storySlider.destroy();
    }
    setSlider();
  });

  setSlider();
};
