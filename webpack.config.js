const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = [
  {
    name: 'server',
    entry: path.resolve(__dirname, 'src', 'server.js'),
    mode: 'production',
    target: 'node',
    externalsPresets: { node: true },
    externals: [nodeExternals()],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'server.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/docs'),
            to: path.resolve(__dirname, 'dist/docs'),
          },
        ],
      }),
    ],
    resolve: {
      extensions: ['.js'],
    },
  },
  {
    name: 'client',
    entry: {
      main: [path.resolve(__dirname, 'src', 'main.js')],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [
            'style-loader',
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: false,
              },
            },
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [autoprefixer()],
                },
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [
                [
                  'import',
                  {
                    libraryName: 'ant-design-vue',
                    libraryDirectory: 'es',
                    style: 'css',
                  },
                ],
              ],
            },
          },
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].[contenthash:8].css',
      }),
      new htmlWebpackPlugin({
        template: path.resolve(__dirname, 'public', 'index.html'),
      }),
    ],
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.runtime.esm-bundler.js',
      },
      extensions: ['*', '.js', '.vue', '.json'],
    },
  },
];
