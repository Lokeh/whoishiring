// grunt config

module.exports = function(grunt) {

	grunt.initConfig({
		browserify: {
			libs: {
				src: ['.'],
				dest: 'dist/libs.js',
				options: {
					alias: ['react:', 'firebase:', 'bluebird:', 'material-ui:', 'react-tap-event-plugin:']
				}
			},
			app: {
				src: ['src/init.jsx'],
				dest: 'dist/app.js',
				options: {
					watch: true,
					keepAlive: true,
					external: ['react', 'firebase', 'bluebird', 'material-ui', 'react-tap-event-plugin']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['browserify']);

};
