const path = require('path');

const SRC = path.resolve(__dirname, 'node_modules');

module.exports = {
  entry: './jsx/App.jsx',
  mode: "development",
  output: {
    path:
        '/java/helios-backend/src/main/resources/static/js'
        // __dirname + '/js/'
    ,
    filename: 'bundle.js'
  },
  devtool: '#sourcemap',
  stats: {
   colors: true,
   reasons: true
  },
  module: {
    rules: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loaders: ['babel-loader']
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true,
              disable: true, 
            },
          },
        ]},
      {
        test: /\.mp3$/,
        include: SRC,
        loader: 'file-loader'
      }

    ]
  }
};