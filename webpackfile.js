module.exports = [
  {
    entry: './src/client/index.js',
    output: {
      path: './dist/public',
      filename: 'client.js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: [
              'babel-preset-es2015'
            ],
            plugins: [
              ['babel-plugin-transform-react-jsx', {pragma:'h'}],
              ['fast-async', {
                env: {
                  'dontMapStackTraces': true,
                  'dontInstallRequireHook': true
                }
              }]
            ]
          }
        }
      ]
    }
  },
  { // Service worker
    entry: './src/client/sw.js',
    output: {
      path: './dist/public',
      filename: 'sw.js'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['babel-preset-es2015']
          }
        }
      ]
    }
  }
];
