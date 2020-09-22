const path = require('path')

const publicOut = path.resolve('./dist/public')

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
    entry: './src/client/index.tsx',
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
    entry: './src/client/sw.ts',
    output: {
      path: publicOut,
      filename: 'sw.js'
    },
    module: {
      rules: [
        tsRule,
        babelRule
      ]
    }
  }
];
