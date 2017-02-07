const path = require('path');
const port = 5000;
const srcPath = path.join(__dirname, 'src');
const publicPath = '/';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const config = {
	entry: [
		'webpack-dev-server/client?http://127.0.0.1:5000',
		'webpack/hot/only-dev-server',
		'./examples/entry'
	],
	cache: true,
	devtool: 'cheap-module-source-map',
	port,
	debug: true,
	output: {
		path: path.join(__dirname, '/../../dist/assets'),
		filename: '[hash].app.js',
		chunkFilename: '[id].[hash].app.js',
		publicPath
	},
	devServer: {
		contentBase: './src/',
		historyApiFallback: true,
		hot: true,
		inline: true,
		lazy: false,
		quiet: true,
		publicPath,
		stats: {
			colors: true,
			chunks: false
		}
	},
	resolve: {
		extensions: [
			'',
			'.js'
		]
	},
	module: {
		preLoaders: [
			// output console errors for eslint issues
			// linting always gets performed
			{
				test: /\.(js|jsx)$/,
				include: srcPath,
				loader: 'eslint-loader'
			}
		],
		loaders: [
			{
				test: /\.(js)$/,
				loader: 'babel-loader?cacheDirectory',
				include: [
					path.resolve(__dirname, './examples'),
					path.resolve(__dirname, './src')
				],
				exclude: /(node_modules)/
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"development"'
		}),
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			title: 'React VScroll',
			template: 'examples/index.ejs', // Load a custom template
			inject: 'body' // Inject all scripts into the body
		})
	]
};

module.exports = config;
