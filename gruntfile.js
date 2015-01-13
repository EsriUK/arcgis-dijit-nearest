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
                    helpers: ['./js/tests/helpers/*.js', './js/tests/lib/sinon/sinon.js'],
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
            },
            coverage: {
                src: ['js/*.js', 'js/tasks/*.js'],
                
                options: {
                    specs: ['./js/tests/spec/*.js'],
                    helpers: ['./js/tests/helpers/*.js', './js/tests/lib/sinon/sinon.js'],
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'coverage/coverage.json',
                        report: 'coverage',
                        srcCopy: ['js/templates/Nearest.html', 'js/templates/NearestItem.html', 'js/templates/NearestLayer.html'],
                        template: require('grunt-template-jasmine-dojo'),
                        templateOptions: {
                            dojoConfig: {
                                async: true,
                                has: { 'native-xhr2': false },
                                paths: {
                                    app: '/../.grunt/grunt-contrib-jasmine/js'
                                }
                            },
                            dojoFile: 'http://js.arcgis.com/3.11/'
                        }
                    }
                }
            }
        }
    };


	// Project configuration.
    grunt.initConfig(gruntconfig);

    // Load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Debug task
    grunt.loadNpmTasks('grunt-debug-task');

    // Add default task(s)
    grunt.registerTask('default', ['jasmine:test']);

    grunt.registerTask('cover', ['jasmine:coverage']);

    grunt.registerTask('travis', ['jasmine:test', 'jasmine:coverage']);
};








