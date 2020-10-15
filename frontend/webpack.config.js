const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { merge } = require('webpack-merge');
const BundleTracker = require('webpack-bundle-tracker');

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
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].bundle.css'
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
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader'
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
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*"  // For hot reload
    },
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
