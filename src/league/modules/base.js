export default class ModuleBase {
	constructor(core) {
		this.core = core
		this.name = 'default'
		this.cacheDuration = 5 * 60
	}

	_checkForCached(key, freshDataGetter, cacheDuration = this.cacheDuration) {
		return this.core.utils.checkForCachedResponse(key, cacheDuration, freshDataGetter)
	}

	_makeKey(key) {
		key.moduleName = this.name

		return key
	}
}
