let _ = require('lodash');

module.exports = function (chrome, internals) {

  chrome.setupAngular = function () {
    let modules = require('ui/modules');
    let kibana = modules.get('kibana');

    _.forOwn(chrome.getInjected(), function (val, name) {
      kibana.value(name, val);
    });

    kibana
    .value('kbnVersion', internals.version)
    .value('buildNum', internals.buildNum)
    .value('buildSha', internals.buildSha)
    .value('sessionId', Date.now())
    .value('esUrl', (function () {
      let a = document.createElement('a');
      a.href = chrome.addBasePath('/elasticsearch');
      return a.href;
    }()))
    .config(chrome.$setupXsrfRequestInterceptor);

    require('../directives')(chrome, internals);

    modules.link(kibana);
  };

};
