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
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  'targets': '> 2%, not dead'
                }],
                '@babel/preset-typescript'
              ],
              plugins: [
                ['@babel/plugin-transform-react-jsx', { 'pragma': 'h' }]
              ]
            }
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
      rules: [
        {
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
      ]
    }
  }
];
