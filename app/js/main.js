/* eslint-disable */
/* eslint-enable */
/* eslint-disable max-len */

// import 'core-js/features/symbol';
// import 'core-js/features/promise';
// import 'regenerator-runtime';

// import ArrayExecutor from './app/utils/ArrayExecutor';
// import Navigation from './app/utils/Navigation';
// import Preloader from './app/utils/Preloader';

const app = window.codepipelinetest;
app.verbose = false;
app.debug = window.location.hash === '#debug';

// const arrayExecutor = ArrayExecutor(null, 'Main');
// const navigation = Navigation.getInstance();
// const sectionLoader = SectionLoader.getInstance();
// sectionLoader.setPreloadImages(false);
// sectionLoader.verbose = true;
// const preloader = Preloader.getInstance();

function handleResize() {
  if (app.mainMenu) app.mainMenu.resize();
  // app.sections[navigation.currentSection].resize();
}

function siteIsIn() {
  console.log('SITE IS IN');

  handleResize();
}

function init() {
  // // navigation.parseDeepLink();

  // const getPath = (img_path) => {
  //   if (document.documentElement.classList.contains('webp')) {
  //     return `${img_path.split('.')[0]}.webp`;
  //   }

  //   return img_path;
  // };

  // let imagesToLoad = [
  //   getPath('/assets/images/features/2006-2008.png'),
  //   getPath('/assets/images/features/2009-2011.png'),
  //   getPath('/assets/images/features/2012-2014.png'),
  //   getPath('/assets/images/features/2015-2017.png'),
  //   getPath('/assets/images/features/2018-2020.png'),
  //   getPath('/assets/images/title.png'),
  //   '/assets/images/bg-wide-tile.jpg',
  // ];

  // const functionArr = [
  //   // { fn: preloader.load, scope: preloader, vars: [imagesToLoad] },
  //   // { fn: setupMenu, vars: null },
  //   { fn: siteIsIn },
  // ];

  // arrayExecutor.execute(functionArr);
  siteIsIn();
}

function Main() {
  app.settings = app.settings || {};
  app.sections = {};

  document.documentElement.classList.add('no-touch');

  window.addEventListener('touchstart', function setHasTouch() {
    document.documentElement.classList.remove('no-touch');
    document.documentElement.classList.add('touch');
    if (app.mainMenu) app.mainMenu.setTouch();
    window.removeEventListener('touchstart', setHasTouch);
  }, false);

  window.addEventListener('resize', handleResize);
  window.addEventListener('onorientationchange', handleResize);

  // const functionArr = [
  //   { fn: init, vars: null }
  // ];

  init();
  // arrayExecutor.execute(functionArr);
}

Main.prototype.resize = handleResize;

window.addEventListener('load', () => {
  app.main = new Main();
  document.body.scrollTo(0, 0);
  window.scrollTo(0, 0);
});

window.onbeforeunload = () => {
  document.body.style.opacity = 0;
  window.scrollTo(0, 0);
};
