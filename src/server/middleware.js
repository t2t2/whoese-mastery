import _ from 'lodash'
import errors from 'feathers-errors/handler'

export default function () {
	const app = this

	app.use(historyAPIFallback.bind(app))
	app.use(errors({
		html: errorRenderer
	}))
}

// Fallback to help with history api on the frontend
// based on https://github.com/cbas/express-history-api-fallback but with views
async function historyAPIFallback(req, res, next) {
	if (req.method === 'GET' && req.accepts('html')) {
		const settings = _.keyBy(await this.service('api/settings').find(Object.assign({}, req.feathers)), 'key')

		res.render('index.html', {
			settings
		})
	} else {
		next()
	}
}

// Error renderer for html responses
function errorRenderer(error, req, res) {
	res.render('errors/default.html', {
		error
	})
}
