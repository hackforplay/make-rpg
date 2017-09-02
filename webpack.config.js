const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FeelesWebpackPlugin = require('./feeles-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

const cdn = 'https://assets.feeles.com/public/v1122/h4p.js';
// const cdn = 'http://localhost:8081/h4p.js';
const port = process.env.PORT || 8082;
const dist = 'public/';

module.exports = {
	entry: './support-hot-reload.js',
	output: {
		path: path.resolve(dist),
		filename: '[name].js'
	},
	module: {
		loaders: [{
			test: /\.(html|hbs)$/,
			loaders: ['handlebars-loader']
		}]
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'template.hbs',
			cdn
		}),
		new FeelesWebpackPlugin({
			paths: ['src'],
			output: 'make-rpg.json',
			ignore: /\.DS_Store$/
		}),

		// https://medium.com/webpack/webpack-3-official-release-15fd2dd8f07b
		new webpack.optimize.ModuleConcatenationPlugin(),

		new OpenBrowserPlugin({
			url: `http://localhost:${port}`
		})
	],
	devServer: {
		contentBase: dist,
		port,
		// https://github.com/webpack/webpack-dev-server/issues/882
		// ngrok で https のテストをするとき "Invalid Host header" になるので.
		disableHostCheck: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': '*'
		}
	}
};
