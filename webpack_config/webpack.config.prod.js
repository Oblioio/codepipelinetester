const ImageminPlugin = require('imagemin-webpack-plugin').default;
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin');
const imageminMozjpeg = require('imagemin-mozjpeg');

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const appDir = path.resolve(__dirname, '..', 'app');
const distDir = path.resolve(__dirname, '..', '_site');

const entry = {
  mainjs: './js/main.js',
  styles: './scss/main.scss',
  critical: './scss/critical.scss'
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
  }),

  // Put all css code in this file
  // new ExtractTextPlugin('css/main.css'),
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: 'css/[name].css',
    chunkFilename: 'css/[id].css',
  }),

  new CopyWebpackPlugin({
    patterns: [
      { from: 'assets', to: 'assets' }
    ]
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
          test: /\.(scss|css)$/,
          include: [
            appDir,
          ],
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../',
              },
            },
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [require('autoprefixer')({
                    grid: 'no-autoplace'
                  })],
                }
              },
            },
            {
              loader: 'sass-loader',
            }
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
        },
        {
          test: /\.(woff(2)?|eot|ttf)(\?[a-z0-9]+)?$/,
          include: [
            appDir,
          ],
          use: 'file-loader?name=assets/fonts/[path]/[name].[ext]',
        },
        {
          test: /\.(mp3|ogg)$/,
          include: [
            appDir,
          ],
          use: 'file-loader?name=sounds/[name].[ext]',
        },
        {
          test: /\.(jpg|jpeg|png|gif|ico|webp|svg)$/,
          include: [
            appDir,
          ],
          use: [
            {
              loader: 'file-loader?name=assets/images/[path][name].[ext]&context=app/assets/images',
            },
          ],
        },
      ],
    },

    resolve: {
      extensions: ['.js', '.scss', '.css'],
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
