module.exports = {
	dashboard: {
		src: [
			'<%= dirs.build %>/dashboard.js',
			'<%= dirs.build %>/dashboard/*.js'
		]
	},
	app: {
		src: [
			'<%= dirs.build %>/app.js',
			'<%= dirs.build %>/plugins/*.js'
		]
	}
};
