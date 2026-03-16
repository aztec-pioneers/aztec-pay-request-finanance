import { createRequire } from 'module';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (_, argv) => ({
  entry: {
    main: './app/main.ts',
  },
  target: 'web',
  devtool: 'source-map',
  output: {
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          allowTsInNodeModules: true,
          transpileOnly: true,
        },
      },
      {
        test: /\.svelte$/,
        loader: 'svelte-loader',
        options: {
          compilerOptions: {
            css: 'injected',
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index.html',
      filename: 'index.html',
      chunks: ['main'],
      scriptLoading: 'module',
    }),
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
  ],
  resolve: {
    conditionNames: ['svelte', 'browser', 'import'],
    extensions: ['.ts', '.js', '.svelte'],
    alias: {
      '$lib': path.resolve(__dirname, 'src/lib'),
      'pino': path.resolve(__dirname, 'src/lib/pino-browser-stub.ts'),
    },
    fallback: {
      tty: false,
      path: false,
      net: false,
      crypto: false,
      util: require.resolve('util/'),
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
    },
  },
  devServer: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    client: {
      overlay: false,
    },
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    ],
  },
});
