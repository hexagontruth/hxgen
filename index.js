const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptWebpackPlugin = require('html-inline-script-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
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
    name: ['zip', 'z'],
    help: 'Zip output',
  },
  {
    name: ['template', 't'],
    help: 'HTML template file',
    default: 'src/template.html',
  },
  {
    name: ['output', 'o'],
    help: 'Output file name',
    default: 'index.html',
    type: 'string',
    default: 'index.html',
  },
  {
    name: 'filename',
    flag: false,
    default: 'src/default.js',
    help: 'Entrypoint filename',
  },
]);

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
  plugins: [
    new HtmlWebpackPlugin({
      title: opts.filename,
      filename: `${opts.output}`,
      template: path.join(__dirname, opts.template),
    }),
  ],
}

// Build

if (require.main == module) {
  if (opts.dev) {
    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(webpackConfig.devServer, compiler);
    console.log('Starting server...');
    server.start();
  }
  else {
    webpackConfig.plugins.push(new HtmlInlineScriptWebpackPlugin());
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