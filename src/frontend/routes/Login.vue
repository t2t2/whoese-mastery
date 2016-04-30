<template>
	<div class="layout__centered-wrapper">
		<div class="layout__centered login" v-if="!$loadingSyncers">
			<div class="login__header">
				<h2 class="title is-2">Summoner Info</h2>
				<p>Enter your summoner name and region so we can find your data</p>
			</div>
			
			<errors v-if="errors" :errors="errors"></errors>
			
			<form class="login__form" @submit.prevent="doLogin">
				<label class="label" for="login-name">Summoner Name:</label>
				<div class="control">
					<input id="login-name" class="input" type="text" v-model="credentials.name" />
				</div>
				<label class="label" for="login-region">Region:</label>
				<div class="control">
					<span class="select is-fullwidth">
						<select id="login-region" class="input" type="text" v-model="credentials.region">
							<option v-for="region in regions" v-text="region.name" :value="region.id"></option>
						</select>
					</span>
				</div>
				<button type="submit" class="button button--main" :disabled="doing">
					Fetch me!
				</button>
			</form>
		</div>
	</div>
</template>

<script>
	import map from 'lodash/map'
	import remove from 'lodash/remove'
	import upperFirst from 'lodash/upperFirst'

	import Errors from '../components/Errors.vue'
	import PageMixin from '../mixins/page'

	export default {
		mixins: [PageMixin],
		components: {
			Errors,
		},
		data() {
			return {
				credentials: {
					type: 'local',
					name: '',
					region: ''
				},
				doing: false,
				errors: null
			}
		},
		methods: {
			async doLogin() {
				if (this.doing) {
					return
				}
				this.errors = null
				
				let errors = remove(map(this.credentials, (value, key) => {
					if (value.length <= 1) {
						return `${upperFirst(key)} must be entered`
					}
				}))
				
				if(errors.length) {
					this.errors = errors
					return
				}

				
				this.doing = true
				try {
					const response = await this.$feathers.authenticate(this.credentials)
					console.log(response)
				} catch(e) {
					this.errors = e
				}
				
				this.doing = false
			}
		},
		sync: {
			regions: 'data/regions'
		}
	}
</script>