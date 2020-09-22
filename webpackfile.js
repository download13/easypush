const path = require('path')

const publicOut = path.resolve('./dist/public')

module.exports = [
  {
    entry: './src/client/index.js',
    output: {
      path: publicOut,
      filename: 'client.js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['env', 'typescript'],
            plugins: [
              ['babel-plugin-transform-react-jsx', {pragma:'h'}]
            ]
          }
        }
      ]
    }
  },
  { // Service worker
    entry: './src/client/sw.js',
    output: {
      path: publicOut,
      filename: 'sw.js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['env']
          }
        }
      ]
    }
  }
];
