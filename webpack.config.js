function buildConfig(env) {

  let file = 'prod';
  // if (env.development) {
  //   file = 'dev';
  // } else if (env.production) {
  //   file = 'prod';
  // } else {
  //   throw new Error('You must set environment to either development or production in webpack call. e.g. webpack --env.production');
  // }

  return require(`./webpack_config/webpack.config.${file}.js`)(env);
}

module.exports = env => buildConfig(env);