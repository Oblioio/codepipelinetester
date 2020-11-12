const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const appDir = path.resolve(__dirname, '..', 'app');
const distDir = path.resolve(__dirname, '..', '_site');

const entry = {
  mainjs: './js/main.js'
};

const plugins = [
  // new webpack.NamedModulesPlugin(),

  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }),

  new webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false,
  })
];

module.exports = (env) => {
  if (env.production) {
    // plugins.push(
    //   new ImageminWebpWebpackPlugin({
    //     config: [{
    //       test: /\.(jpe?g|png)/,
    //       options: {
    //         method: 6,
    //         quality: 80,
    //         autoFilter: true
    //       }
    //     }],
    //     overrideExtension: true,
    //     detailedLogs: false,
    //     strict: true
    //   }),
    //   new ImageminPlugin({
    //     test: /\.(jpe?g|png|gif)$/i,
    //     plugins: [
    //       imageminMozjpeg({
    //         quality: 85
    //       })
    //     ]
    //   })
    // );
  }

  const options = {
    mode: 'production',

    context: appDir,

    devtool: 'hidden-source-map',

    entry,

    output: {
      filename: 'js/[name].js',
      path: distDir,
      publicPath: '/',
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                sourceMap: true,
                presets: ['@babel/preset-env'],
                // plugins: [require('@babel/plugin-transform-classes')],
                compact: true,
                babelrc: false,
              },
            },
          ],
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
        }
      ],
    },

    resolve: {
      extensions: ['.js'],
      modules: [appDir, 'node_modules'],
    },

    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },

    plugins,
  };

  if (env.development) {
    options.devServer = {
      contentBase: distDir,
      watchContentBase: true,
      port: 3000,
      https: true,
    };
  }

  return options;
};
