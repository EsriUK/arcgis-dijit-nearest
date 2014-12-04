module.exports = function(grunt) {

	var gruntconfig = {
		jshint: {
      		all: [
    			'Gruntfile.js',
    			'tasks/**/*.js'
    		],
      		options: {
    			jshintrc: '.jshintrc'
			}
		},
        debug: {
	        options: {
      			open: true // do not open node-inspector in Chrome automatically
	        }
      	},
		jasmine : {
      		src : './js/Nearest.js',
      		options : {
        		specs : './js/tests/spec/**/*.js'
      		}
    	}
    };


	// Project configuration.
    grunt.initConfig(gruntconfig);

    // Load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Add default task(s)
    grunt.registerTask('default', ['jasmine']);

};








