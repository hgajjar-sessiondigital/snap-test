module.exports = function(grunt) {
    var env = grunt.option('env') || 'prod';

    var designPackage = grunt.option('package') || 'heidelberg';

    var themeParam = grunt.option('theme') || 'live';
    
    var themes = [
        'default',
        'au',
        'br',
        'ca',
        'ca_fr',
        'ch',
        'ch_fr',
        'de',
        'dk',
        'fr',
        'id',
        'in',
        'jp',
        'kr',
        'my',
        'nz',
        'ph',
        'se',
        'sg',
        'th',
        'tw',
        'uk',
        'usa',
        'za'
    ];

    switch (themeParam) {
        case 'all':             
        break;
        case 'live': 
            themes = [
                'default',
                'au',
                'br',
                'ca',
                'ca_fr',
                'ch',
                'ch_fr',
                'de',
                'dk',
                'fr',
                'id',
                'in',
                'jp',
                'kr',
                'my',
                'nz',
                'ph',
                'se',
                'sg',
                'th',
                'tw',
                'uk',
                'usa',
                'za'
            ];
        break;
        default:
            themes = [themeParam];    
        break;
    }

    var compassOptions = {
        options: {
            importPath: '<%= var.defaultSassDir %>',
            raw: 'sass_options = {:unix_newlines => true}\n',
            relativeAssets: true,
            outputStyle: (env == 'dev') ? 'expanded' : 'compressed',
            fontsDir: "<%= var.packageDir %>default/css/fonts",
            imagesDir: '<%= var.defaultImagesDir %>',
            generatedImagesDir: '<%= var.defaultImagesDir %>',
            sourcemap: (env == 'dev') ? true : false
        }
    };

    var jsFilesCore = [
        '<%= var.magentoJsDir %>prototype/prototype.js',
        '<%= var.magentoJsDir %>prototype/validation.js',
        '<%= var.magentoJsDir %>lib/ccard.js',
        '<%= var.magentoJsDir %>scriptaculous/builder.js',
        '<%= var.magentoJsDir %>scriptaculous/effects.js',
        '<%= var.magentoJsDir %>scriptaculous/dragdrop.js',
        '<%= var.magentoJsDir %>scriptaculous/controls.js',
        '<%= var.magentoJsDir %>scriptaculous/slider.js',
        '<%= var.magentoJsDir %>varien/js.js',
        '<%= var.magentoJsDir %>varien/form.js',
        '<%= var.magentoJsDir %>varien/menu.js',
        '<%= var.magentoJsDir %>varien/product.js',
        '<%= var.magentoJsDir %>varien/configurable.js',
        '<%= var.magentoJsDir %>mage/translate.js',
        '<%= var.magentoJsDir %>mage/cookies.js',
        '<%= var.skinFEDir %>rwd/default/js/minicart.js'
    ];

    var jsFilesPackage = [
        '<%= var.packageJsDir %>lib/*.js',
        '<%= var.packageJsDir %>plugins/*.js',
        '<%= var.packageJsDir %>layback_treats/*.js',
        '<%= var.packageJsDir %>overrides/_*.js',
        '<%= var.packageJsDir %>_*.js'
    ];

    var concurrentCompassOptions = [];

    for (i in themes) {
        theme = themes[i];
        compassOptions[theme] = {
            options: {
                sassDir: '<%= var.packageDir %>' + theme + '/css/sass',
                cssDir: '<%= var.packageDir %>' + theme + '/css'
            }
        };

        concurrentCompassOptions.push("compass:" + theme);
    }

    var initConfigOptions = {
        pkg: grunt.file.readJSON('package.json'),

        var: {
            packageName: designPackage,
            skinFEDir: 'public/skin/frontend/',
            packageDir: '<%= var.skinFEDir %><%= var.packageName %>/',
            defaultSassDir: '<%= var.packageDir %>default/css/sass',
            defaultImagesDir: '<%= var. packageDir %>default/images/',
            magentoJsDir: 'public/js/',
            generatedMagentoJsDir: '<%= var.magentoJsDir %>/<%= var.packageName %>/',
            packageJsDir: '<%= var.packageDir %>default/js/'
        },
        compass: compassOptions,
        uglify: {
            options: {
                mangle: false,
                beautify: (env == 'dev') ? true : false,
                compress: {
                    drop_console: (env == 'dev') ? false : true
                }
            },
            all: {
                files: {
                    '<%= var.generatedMagentoJsDir %>core.min.js': jsFilesCore,
                    '<%= var.packageJsDir %>scripts.min.js': jsFilesPackage
                }
            }
        },
        watch: {
            css: {
                files: [
                    '<%= var.defaultSassDir %>/{,*/}*.scss'
                ],
                tasks: ['compass']
            },
            js: {
                files: jsFilesCore.concat(jsFilesPackage),
                tasks: ['uglify']
            }
        },
        concurrent: {
            compass: {
                tasks: concurrentCompassOptions,
                options: {
                    logConcurrentOutput: true,
                    limit: 9
                }
            }
        }
    };

    grunt.initConfig(initConfigOptions);

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
};
