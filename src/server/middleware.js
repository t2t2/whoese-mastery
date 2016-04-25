import errors from 'feathers-errors/handler'

export default function () {
	const app = this

	app.use(historyAPIFallback)
	app.use(errors({
		html: errorRenderer
	}))
}

// Fallback to help with history api on the frontend
// based on https://github.com/cbas/express-history-api-fallback but with views
function historyAPIFallback(req, res, next) {
	if (req.method === 'GET' && req.accepts('html')) {
		res.render('index.html')
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
