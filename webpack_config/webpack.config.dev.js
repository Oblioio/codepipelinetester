const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const hogan = require('hogan.js');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const appDir = path.resolve(__dirname, '..', 'app');
const distDir = path.resolve(__dirname, '..', 'dist');

const settings = require('../app/json/en.json');

const head = settings.precompile;

const entry = {
  mainjs: './js/main.js',
  browsercheck: './js/browserCheck.js',
  fallback: './js/fallback.js',
  styles: './scss/main.scss',
  critical: './scss/critical.scss'
};

/**
 * 
 * 
 */

const templates = {};

Object.keys(settings.widgets).forEach((key) => {
  if (settings.widgets[key].templatePath) {
    templates[key] = hogan.compile(fs.readFileSync(path.resolve(__dirname, '../app', settings.widgets[key].templatePath), 'utf8'));
  }
});

function getPartials(widgetObj) {
  const widgetNames = widgetObj.widgets;
  const partials = [];

  if (!widgetNames || widgetNames.length === 0) return [];

  for (let i = widgetNames.length - 1; i >= 0; i--) {
    const widget = settings.widgets[widgetNames[i]];
    if (widget) {
      if (partials.indexOf(widgetNames[i]) === -1) partials.push(widgetNames[i]);

      const childWidgets = getPartials(widget);

      for (let j = childWidgets.length - 1; j >= 0; j--) {
        if (partials.indexOf(childWidgets[j]) === -1) partials.push(childWidgets[j]);
      }
    }
  }

  return partials;
}

function getWidgets(widgets) {
  const allwidgets = [];

  if (!widgets || widgets.length === 0) return [];

  let widget;
  for (let i = widgets.length - 1; i >= 0; i--) {
    widget = settings.widgets[widgets[i]];
    if (widget) {
      if (allwidgets.indexOf(widgets[i]) === -1) allwidgets.push(widgets[i]);

      const childWidgets = getWidgets(widget.widgets);

      for (let j = childWidgets.length - 1; j >= 0; j--) {
        if (allwidgets.indexOf(childWidgets[j]) === -1) allwidgets.push(childWidgets[j]);
      }
    }
  }

  return allwidgets;
}

function getSectionData(sectionName) {
  const section = settings.widgets[sectionName];
  const widgets = getWidgets(section.widgets);
  // console.log(`THE WIDGETS: ${widgets}`);
  widgets.forEach((widgetName) => {
    section.data[widgetName] = settings.widgets[widgetName].data;
  });

  return section.data;
}

function getSectionContent(sectionName) {
  const section_partials = getPartials(settings.widgets[sectionName]).reduce((acc, partialName) => {
    const template = templates[partialName];
    if (typeof template !== 'undefined') {
      acc[partialName] = template;
    }
    return acc;
  }, {});

  const data = getSectionData(sectionName);
  // console.log(`${sectionName} DATA:`, data);

  return templates[sectionName].render(data, section_partials);
}

const content = getSectionContent('main');
console.log(content);
/**
 * 
 * 
 */


module.exports = (env) => ({
  mode: 'development',

  context: appDir,

  devtool: 'inline-source-map',

  entry,

  output: {
    filename: 'js/[name].js',
    path: distDir,
    publicPath: '/',
    sourceMapFilename: 'js/[name].map',
  },

  devServer: {
    disableHostCheck: true,
    contentBase: appDir,
    publicPath: '/',
    historyApiFallback: true,
    port: 3000,
    https: true,
  },

  module: {
    rules: [
      {
        test: /templates\.js$/,
        use: [
          {
            loader: path.resolve(__dirname, '../loaders/widget-templates-loader.js'),
            options: {
              json: settings.widgets,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        include: [
          appDir,
        ],
        use: [
          {
            loader: path.resolve(__dirname, '../loaders/widget-js-loader.js'),
            options: {
              json: settings,
            },
          },
        ],
      },
      {
        test: /\.(scss|css)$/,
        include: [
          appDir,
        ],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // only enable hot in development
              hmr: process.env.NODE_ENV === 'development',
              // if hmr does not work, this is a forceful method.
              reloadAll: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              config: {
                path: './postcss.config.js',
              },
            },
          },
          {
            loader: 'sass-loader',
          },
          // {
          //   loader: path.resolve(__dirname, '../loaders/widget-css-loader.js'),
          //   options: {
          //     json: settings.widgets,
          //   },
          // },
        ],
      },
      {
        test: /\.js$/,
        include: [
          appDir,
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              sourceMap: true,
              presets: [['@babel/preset-env', {
                modules: false,
                useBuiltIns: 'entry',
              }]],
              plugins: [],
              compact: false,
              babelrc: false,
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|eot|ttf|svg)(\?[a-z0-9]+)?$/,
        use: 'file-loader?name=assets/fonts/[path]/[name].[ext]',
        include: [
          appDir,
        ],
      },
      {
        test: /\.(mp3|ogg)$/,
        use: 'file-loader?name=sounds/[name].[ext]',
        include: [
          appDir,
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|ico|webp|svg)$/,
        use: 'file-loader?name=images/[path][name].[ext]&context=app/assets/images',
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'mustache-loader',
            options: {
              tiny: true,
              noShortcut: true,
            },
          },
        ],
      },
      {
        test: /\.(glsl|frag|vert|template)$/,
        use: 'raw-loader',
        include: [
          appDir,
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.scss', '.css'],
    modules: [appDir, 'node_modules'],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('dev'),
      },
    }),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(appDir, 'index.tmp'),
      jsPath: '/',
      path: distDir,
      filename: 'index.html',
      inject: false,
      base: '',
      env: 'dev',
      content,
      ...head,
    }),

    // Put all css code in this file
    // new ExtractTextPlugin('css/main.css'),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[name].css',
      chunkFilename: 'css/[id].css',
    }),
  ],
});
