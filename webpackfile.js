const path = require('path')

const publicOut = path.resolve('./dist/public')
const clientDir = path.resolve('./src/client')

const tsRule = {
  test: /\.tsx?$/,
  exclude: /node_modules/,
  use: {
    loader: 'ts-loader'
  }
}

const babelRule = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', {
          'targets': '> 2%, not dead'
        }]
      ]
    }
  }
}

module.exports = [
  {
    entry: path.join(clientDir, 'index.tsx'),
    output: {
      path: publicOut,
      filename: 'client.js'
    },
    module: {
      rules: [
        tsRule,
        babelRule
      ]
    }
  },
  { // Service worker
    entry: path.join(clientDir, 'sw.js'),
    output: {
      path: publicOut,
      filename: 'sw.js'
    },
    module: {
      rules: [
        babelRule
      ]
    }
  }
];
