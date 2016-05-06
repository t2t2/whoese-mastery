export function isAuthenticatedUser(data, connection) {
	if (!connection.user) {
		return false
	}

	return data
}
