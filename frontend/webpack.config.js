const path = require('path');
const { merge } = require('webpack-merge');
const BundleTracker = require('webpack-bundle-tracker');

const baseConfig = {
  entry: {
    base: './static/entries/base.js',
  },
  output: {
    filename: '[name].[hash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/static/'
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json',
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
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
    hot: true,
    watchOptions: {
      ignored: /node_modules/
    },
  },
});

const productConfig = merge(baseConfig, {
  mode: 'production',
})

module.exports = (env, options) => {
  const isProduction = options.mode === 'production'
  return isProduction ? productConfig : devConfig
}
