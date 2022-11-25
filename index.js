const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptWebpackPlugin = require('html-inline-script-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const ZipPlugin = require('zip-webpack-plugin');
const webpack = require('webpack');
const simpleArgParser = require('simple-arg-parser');

const { version } = require('./package.json');
const debug = process.env.DEBUG;
const port = process.env.PORT || 8080;

// Options

const opts = simpleArgParser()
.name('hxgen')
.description('Generative art emitter')
.usage('hxgen [options...] [filename]')
.help()
.version(version)
.parse(process.argv.slice(2), [
  {
    name: ['dev', 'd'],
    help: 'Launch dev server',
  },
  {
    name: ['template', 't'],
    help: 'HTML template file',
    type: 'string',
    default: 'src/templates/default.html',
  },
  {
    name: ['output', 'o'],
    help: 'Output file name (zip or html)',
    type: 'string',
    default: 'index.html',
  },
  {
    name: ['title'],
    help: 'Set custom page title',
    type: 'string',
  },
  {
    name: 'filename',
    flag: false,
    default: 'src/default.js',
    help: 'Entrypoint filename',
  },
]);

const isZip = path.extname(opts.output) == '.zip';

// Webpack

const webpackConfig = {
  mode: opts.dev ? 'development' : 'production',
  target: 'web',
  entry: `./${opts.filename}`,
  output: {
    publicPath: '',
  },
  devServer: {
    // watchFiles: [`./${opts.filename}`],
    port: port,
  },
  module: {
    rules: [
      {
        test: /\.(frag|vert|fs|vs)$/,
        loader: 'simple-webgl-loader',
      },
      {
        test: /\.(sass|scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: opts.title || opts.filename,
      filename: isZip ? 'index.html' : `${opts.output}`,
      inject: 'body',
      template: path.join(__dirname, opts.template),
    }),
  ],
}

// Build

if (require.main == module) {
  main();
}

// Functions

module.exports = { main };

function main() {
  if (opts.dev) {
    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(webpackConfig.devServer, compiler);
    console.log('Starting server...');
    server.start();
  }
  else {
    webpackConfig.plugins.push(new HtmlInlineScriptWebpackPlugin());
    if (isZip) {
      webpackConfig.plugins.push(new ZipPlugin({
        filename: opts.output,
      }));
    }
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        console.error(err);
      }
      else {
        console.log(`Done building ${opts.filename}->dist/${opts.output} lol.`);
        debug && console.log(stats);
      }
    });
  }
}