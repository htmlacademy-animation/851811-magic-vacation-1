// modules
import mobileHeight from './modules/mobile-height-adjust.js';
import slider from './modules/slider.js';
import menu from './modules/menu.js';
import footer from './modules/footer.js';
import chat from './modules/chat.js';
import form from './modules/form.js';
import social from './modules/social.js';
import FullPageScroll from './modules/full-page-scroll';
import document from './modules/document';
import rules from './modules/rules';
import intro from './modules/intro';

const fullPageScroll = new FullPageScroll();
fullPageScroll.init();

// init modules
mobileHeight();
slider({scene: fullPageScroll.getScene()});
menu();
footer();
chat();
form();
social();
document();
rules();
intro({scene: fullPageScroll.getScene()});
