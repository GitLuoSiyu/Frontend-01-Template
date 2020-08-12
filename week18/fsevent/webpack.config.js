module.exports = {
  entry: './src/watcher.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      }
    ],
  },
  mode: 'development',
  optimization: {
    minimize: false,
  },
}