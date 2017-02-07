const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');

new WebpackDevServer(webpack(config), config.devServer)
.listen(config.port, 'localhost', function(err) {
	if (err) {
		console.log(err);
	}
	console.log(`Demo running at localhost:${ config.port }`);
});
