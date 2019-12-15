const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require('webpack')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    vendors: [
      'vue'
    ],
    bundle: path.join(__dirname, './utils/app.js')
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist/scripts/')
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js',
      Components: path.resolve(__dirname, './components/'),
      Utils: path.resolve(__dirname, './utils/')
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          chunks: 'initial',
          test: 'vendors',
          name: 'vendors',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader'
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                indentedSyntax: true
              }
            }
          }
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      /** ADD HERE RUNTIME ENV VARIABLES */
      // ENV: JSON.stringify(config.ENV)
      /** END OF RUNTIME ENV VARIABLES */
    })
  ]
}
