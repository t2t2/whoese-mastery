// Based on https://github.com/vuejs-templates/webpack/blob/master/template/build/dev-server.js
import path from 'path'
import express from 'express'
import proxyMiddleware from 'http-proxy-middleware'
import webpack from 'webpack'
import webpackConfig from '../webpack.config.babel'

let config = webpackConfig({
	prod: false
})

Object.keys(config.entry).forEach(function (name) {
	config.entry[name] = ['eventsource-polyfill', 'webpack-hot-middleware/client?reload=true'].concat(config.entry[name])
})

// webpack2 default
config.devtool = '#cheap-module-eval-source-map'

config.plugins = (config.plugins || []).concat([
	// https://github.com/glenjamin/webpack-hot-middleware#installation--usage
	new webpack.optimize.OccurrenceOrderPlugin(),
	new webpack.HotModuleReplacementPlugin(),
	new webpack.NoErrorsPlugin(),
	
	new require('webpack-notifier')
])

const app = express()
const compiler = webpack(config)

const devMiddleware = require('webpack-dev-middleware')(compiler, {
	publicPath: config.output.publicPath,
	stats: {
		colors: true,
		chunks: false
	}
})

const hotMiddleware = require('webpack-hot-middleware')(compiler)

app.use(devMiddleware)
app.use(hotMiddleware)
app.use(proxyMiddleware('/', {
	target: 'http://localhost:8000',
	ws: true
}))


app.listen(8080)
