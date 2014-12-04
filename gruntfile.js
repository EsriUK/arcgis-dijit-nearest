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
        jasmine: {
            test: {
                options: {
                    specs: './js/tests/spec/*.js',
                    template: require('grunt-template-jasmine-dojo'),
                    templateOptions: {
                        dojoConfig: {
                            async: true,
                            has: { 'native-xhr2': false },
                            paths: {
                                app: '/../js'
                            }
                        },
                        dojoFile: 'http://js.arcgis.com/3.11/'
                    }
                }
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








