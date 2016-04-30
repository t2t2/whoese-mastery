<template>
	<div class="notification is-danger">
		<h4 class="title is-5" v-if="message" v-text="message"></h4>
		<ul v-if="errorList && errorList.length">
			<li v-for="error in errorList" v-text="error"></li>
		</ul>
	</div>
</template>

<script>

	export default {
		computed: {
			errorList() {
				if (!this.isErrorObject) {
					return this.errors
				} else if('errors' in this.errors) {
					return this.errors.errors
				}
				return []
			},
			isErrorObject() {
				return !('length' in this.errors)
			},
			message() {
				if (this.isErrorObject && 'message' in this.errors) {
					return this.errors.message
				}
				return null
			}
		},
		props: {
			errors: null
		}
	}
</script>