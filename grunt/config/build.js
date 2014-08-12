module.exports = {
	options: {
		tasks: {
			dev: [
				'copy:js',
				'concat',
				'clean:plugins'
			],
			min: [
				'copy:js',
				'uglify',
				'concat',
				'clean:plugins'
			]
		}
	}
};
