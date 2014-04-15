'use strict';


var es = require('event-stream');
var cssValidator = require('css-validator');
var gutil = require('gulp-util');
var errorText = gutil.colors.red.bold('CSS Error:');
var warningText = gutil.colors.yellow.bold('CSS Warning:');
var validatorError = gutil.colors.red.bold('Error:');


module.exports = function (options) {
  var opts = options || {};

  return es.map(function (file, callback) {

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new PluginError('gulp-css-validation', 'Streaming not supported'));
    }

    cssValidator(file.contents.toString(), function (err, data) {
      if (err) {
        gutil.log(validatorError, err.code)
        return callback(err);
      }

      if (opts.logWarnings) {
        data.warnings.forEach(function (v) {
          var location = 'Line ' + v.line + ':';
          gutil.log(warningText, file.relative, v.errortype, location, v.message.trim());
        });
      }

      if (!data.validity) {
        var verr = new gutil.PluginError('gulp-css-validation', 'CSS File not valid', {showStack: true});

        data.errors.forEach(function (v) {
          var location = 'Line ' + v.line + ':';
          gutil.log(errorText, file.relative, v.errortype, location, v.message.trim());
        });

        return callback(verr);
      }

      callback(null, file);
    });
  });
};
