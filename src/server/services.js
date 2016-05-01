import playersService from '../services/players'
import regionsService from '../services/regions'
import roomsService from '../services/rooms'
import sessionsService from '../services/sessions'
import summonersService from '../services/summoners'

export default function () {
	const app = this

	app.configure(playersService)
	app.configure(regionsService)
	app.configure(roomsService)
	app.configure(sessionsService)
	app.configure(summonersService)
}
