export default class ModuleBase {
	constructor(core) {
		this.core = core
		this.name = 'default'
		this.cacheDuration = 5 * 60
	}

	_makeKey(key) {
		key.moduleName = this.name

		return key
	}

	_checkForCached(key, freshDataGetter) {
		return this.core.utils.checkForCachedResponse(key, this.cacheDuration, freshDataGetter)
	}
}
