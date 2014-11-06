'use strict';
module.exports = function() {
  var url = require('url');
  var murl = require('murl');

  var delegoat = {
    posts: [],
    gets: [],
    puts: [],
    deletes: [],
    _bindHandler: function(method, route, fn) {
      this[method + 's'].push({
        route: route,
        fn: fn
      });
    },
    post: function(route, fn) {
      this._bindHandler('post', route, fn);
    },
    get: function(route, fn) {
      this._bindHandler('get', route, fn);
    },
    put: function(route, fn) {
      this._bindHandler('put', route, fn);
    },
    delete: function(route, fn) {
      this._bindHandler('delete', route, fn);
    },
    handleIt: function(data) {
      var method = data.method.toLowerCase();
      var methods = method + 's';
      var parsedUrl = url.parse(data.url);
      var serviceData = {
        // TODO: headers: {},
        // TODO: hashes: {},
        parameters: {},
        query: {},
        body: {}
      };
      var index = 0;
      var routePattern;
      var routeHandler;
      var murlPattern;
      var urlParameters;

      for (index; index < this[methods].length; index++) {
        routeHandler = this[methods][index];
        routePattern = routeHandler.route;

        murlPattern = murl(routePattern);
        urlParameters = murlPattern(parsedUrl.pathname);

        if (!!urlParameters) {

          serviceData.parameters = urlParameters;

          if (!!parsedUrl.query) {
            var pairs = parsedUrl.query.split('&');
            var pair = 0;
            for (pair; pair < pairs.length; pair++) {
              var keys = pairs[pair].split('=');
              serviceData.query[keys[0]] = keys[1];
            }
          }

          if (!!data.body) {
            serviceData.body = data.body;
          }

          return routeHandler.fn(serviceData);
        }
      }

      return (function(){
        throw new Error('NO HANDLER FOUND FOR: ' + method + ' ' + data.url);
      })();
    }
  };

  return delegoat;
}();