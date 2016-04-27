import sessionsService from '../services/sessions'

export default function () {
	const app = this

	app.configure(sessionsService)
}
