// modules
import mobileHeight from './modules/mobile-height-adjust.js';
import slider from './modules/slider.js';
import menu from './modules/menu.js';
import footer from './modules/footer.js';
import chat from './modules/chat.js';
import result from './modules/result.js';
import form from './modules/form.js';
import social from './modules/social.js';
import FullPageScroll from './modules/full-page-scroll';
import document from './modules/document';
import rules from './modules/rules';
import intro from './modules/intro';
import animateResult from './modules/svg/animate-result';

// init modules
mobileHeight();
slider();
menu();
footer();
chat();
result();
form();
social();
document();
rules();
intro();
animateResult();

const fullPageScroll = new FullPageScroll();
fullPageScroll.init();
