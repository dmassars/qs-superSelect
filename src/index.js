const {controller} = require('./controller');
const {paint} = require('./component')
const template = require('./template.html')
const {definition} = require('./definition')

define([], function() {
	'use strict';

	return {
		template,
		initialProperties: {
      version: 1.0,
      support: {
          export: true,
          exportData: false,
          snapshot: false
      }
    },
    definition,
		support : {
			snapshot: false,
			export: true,
			exportData : false
		},
		paint,
		controller
	};

})
