import authentication from 'feathers-authentication'
import config from '../config'

export default function () {
	const app = this

	app.configure(authentication({
		setUpSuccessRedirect: false,
		setUpFailureRedirect: false,
		local: false, // replaced by custom
		token: {
			secret: config.get('key')
		},
		userEndpoint: 'api/sessions',
		idField: 'id'
	}))
}
