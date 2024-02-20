
var updateCrumbsFunc = function () {
  var loc = window.location.pathname;
  var segments = loc.split('/');
  var breadcrumbs = '';
  var currentPath = '/';
  for (var i = 0; i < segments.length; i++) {
    if (segments[i] !== '') {
      currentPath += segments[i] + '/';
      // https://github.com/TheInsomniac/Nginx-Fancyindex-Theme/issues/17#issuecomment-782595557
      breadcrumbs += '<a href="' +  currentPath + '">' + window.decodeURIComponent(segments[i]) + '<\/a>';
    } else if (segments.length -1 !== i) {
      currentPath += '';
      // breadcrumbs += '<a href="' + currentPath + '">Root<\/a>';
      breadcrumbs += '<a href="' + currentPath + '">' +window.location.hostname+'<\/a>';
    }
  }
  document.getElementById('breadcrumbs').innerHTML = breadcrumbs;
};


if (!!(window.history && history.pushState)) {

  var addEvent = (function () {
    if (document.addEventListener) {
      return function (el, type, fn) {
        if (el && el.nodeName || el === window) {
          el.addEventListener(type, fn, false);
        } else if (el && el.length) {
          for (var i = 0; i < el.length; i++) {
            addEvent(el[i], type, fn);
          }
        }
      };
    } else {
      return function (el, type, fn) {
        if (el && el.nodeName || el === window) {
          el.attachEvent('on' + type, function () {
            return fn.call(el, window.event);
          });
        } else if (el && el.length) {
          for (var i = 0; i < el.length; i++) {
            addEvent(el[i], type, fn);
          }
        }
      };
    }
  })();

  var updateCrumbs = function() {
    window.document.title = window.location.pathname;
    setTimeout(updateCrumbsFunc, 500);
  };

  var swapPage = function(href) {

    var req = false;
    if (window.XMLHttpRequest) {
      req = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      req = new ActiveXObject('Microsoft.XMLHTTP');
    }
    req.open('GET', href);
    req.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');

    req.onload = function() {
      if (req.status == 200) {
        var target = document.getElementsByClassName('box-content')[0];
        var div = document.createElement('div');
        div.innerHTML = req.responseText;
        var elements = div.getElementsByClassName('box-content')[0];
        target.innerHTML = elements.innerHTML;
        initHistory();
      } else {
        // Terrible error catching implemented! Basically, if the ajax request fails
        // we'll just refresh the entire page with the new URL.
        window.location.replace(href);
      }
    };

    // https://github.com/TheInsomniac/Nginx-Fancyindex-Theme/pull/10
    try {
      req.send(null);
    } catch (e) {
      window.location.replace(href);
      return false;
    }

    return true;
  };

  var initHistory = function() {
    var list = document.getElementById('list');

    addEvent(list, 'click', function (event) {
      if (event.target.nodeName == 'A' && event.target.innerHTML.indexOf('/') !== -1) {
        event.preventDefault();
        swapPage(event.target.href);
        var title = event.target.innerHTML;
        history.pushState({page: title}, title, event.target.href);
        updateCrumbs();
      }
    });
  };

  addEvent(window, 'popstate', function (e) {
    swapPage(window.location.pathname);
    updateCrumbs();
  });

  initHistory();
}
