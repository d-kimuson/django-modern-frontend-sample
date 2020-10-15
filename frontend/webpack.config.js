const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const { merge } = require('webpack-merge');
const BundleTracker = require('webpack-bundle-tracker');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

const entries = {}
for (const fileName of require('fs').readdirSync(path.resolve(__dirname, 'static', 'entries'))) {
  entries[fileName.split('.')[0]] = `./static/entries/${fileName}`
}

const baseConfig = {
  entry: entries,
  output: {
    filename: 'js/[name].[hash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/static/'
  },
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.js', '.ts', '.css', '.scss'],
    plugins: [new TsconfigPathsPlugin({
      configFile: path.resolve(__dirname, 'tsconfig.json'),
    })],
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].bundle.css'
    }),
    new StyleLintPlugin({
      files: ['static/styles/**/*.scss'],
      syntax: 'scss',
      fix: false
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          name: 'vendor',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: false,
            },
          },
          {
            loader: 'eslint-loader',
            options: {
              enforce: 'pre',
              configFile: path.resolve(__dirname, '.eslintrc.js'),
              cache: false,
              fix: false,
            },
          },
        ],
      },
      {
        test: /.(scss|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',

            options: {
              sourceMap: false,
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',

            options: {
              sourceMap: false,
              implementation: require('sass'),
              sassOptions: {
                fiber: require('fibers'),
              },
            },
          },
        ],
      },
    ],
  },
};

const devConfig = merge(baseConfig, {
  mode: 'development',
  output: {
    publicPath: 'http://localhost:3000/static/',
  },
  devServer: {
    port: 3000,
    headers: {
      "Access-Control-Allow-Origin": "*"  // For hot reload
    },
    watchOptions: {
      ignored: /node_modules/
    },

    watchContentBase: true,
    contentBase: [
      path.resolve(__dirname, 'templates'),
      path.resolve(__dirname, 'static'),
    ],
    proxy: {
      '/': 'http://localhost:8000',
    },
  },
});

const productConfig = merge(baseConfig, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*"]
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          extractComments: 'all',
          compress: { drop_console: true }
        }
      }),
    ]
  }
})

module.exports = (env, options) => {
  return options.mode === 'production' ? productConfig : devConfig
}
