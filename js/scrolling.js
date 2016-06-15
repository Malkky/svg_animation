/*=======only draw svg when scrolled to=========*/
/*=== from my other pen http://codepen.io/JayPea21/pen/jscaf ===*/
(function() {
  'use strict';
  var docElem = window.document.documentElement;
  window.requestAnimFrame = function() {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function( /* function */ callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  }();
  window.cancelAnimFrame = function() {
    return (
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.oCancelAnimationFrame ||
      window.msCancelAnimationFrame ||
      function(id) {
        window.clearTimeout(id);
      }
    );
  }();

  function SVGEl(el) {
    this.el = el;
    this.image = this.el.previousElementSibling;
    this.current_frame = 0;
    this.total_frames = 60;
    this.path = new Array();
    this.length = new Array();
    this.handle = 0;
    this.init();
  }
  SVGEl.prototype.init = function() {
    var self = this;
    [].slice.call(this.el.querySelectorAll('path')).forEach(function(path, i) {
      self.path[i] = path;
      var l = self.path[i].getTotalLength();
      self.length[i] = l;
      self.path[i].style.strokeDasharray = l + ' ' + l;
      self.path[i].style.strokeDashoffset = l;
    });
  };
  SVGEl.prototype.render = function() {
    if (this.rendered) return;
    this.rendered = true;
    this.draw();
  };
  SVGEl.prototype.draw = function() {
    var self = this,
      progress = this.current_frame / this.total_frames;
    if (progress > 1) {
      window.cancelAnimFrame(this.handle);
      this.showImage();
    } else {
      this.current_frame++;
      for (var j = 0, len = this.path.length; j < len; j++) {
        this.path[j].style.strokeDashoffset = Math.floor(this.length[j] * (1 - progress));
      }
      this.handle = window.requestAnimFrame(function() {
        self.draw();
      });
    }
  };
  SVGEl.prototype.showImage = function() {
    //classie.add( this.image, 'show' );
    //classie.add( this.el, 'hide' );
  };

  function getViewportH() {
    var client = docElem['clientHeight'],
      inner = window['innerHeight'];
    if (client < inner)
      return inner;
    else
      return client;
  }

  function scrollY() {
    return window.pageYOffset || docElem.scrollTop;
  }
  // http://stackoverflow.com/a/5598797/989439
  function getOffset(el) {
    var offsetTop = 0,
      offsetLeft = 0;
    do {
      if (!isNaN(el.offsetTop)) {
        offsetTop += el.offsetTop;
      }
      if (!isNaN(el.offsetLeft)) {
        offsetLeft += el.offsetLeft;
      }
    } while (el = el.offsetParent)
    return {
      top: offsetTop,
      left: offsetLeft
    };
  }

  function inViewport(el, h) {
    var elH = el.offsetHeight,
      scrolled = scrollY(),
      viewed = scrolled + getViewportH(),
      elTop = getOffset(el).top,
      elBottom = elTop + elH,
      // if 0, the element is considered in the viewport as soon as it enters.
      // if 1, the element is considered in the viewport only when it's fully inside
      // value in percentage (1 >= h >= 0)
      h = h || 1;
    return (elTop + elH * h) <= viewed && (elBottom) >= scrolled;
  }

  function init() {
    var svgs = Array.prototype.slice.call(document.querySelectorAll('.draw svg')),
      svgArr = new Array(),
      didScroll = false,
      resizeTimeout;
    // the svgs already shown...
    svgs.forEach(function(el, i) {
      var svg = new SVGEl(el);
      svgArr[i] = svg;
      setTimeout(function(el) {
        return function() {
          if (inViewport(el.parentNode)) {
            svg.render();
          }
        };
      }(el), 250);
    });
    var scrollHandler = function() {
        if (!didScroll) {
          didScroll = true;
          setTimeout(function() {
            scrollPage();
          }, 60);
        }
      },
      scrollPage = function() {
        svgs.forEach(function(el, i) {
          if (inViewport(el.parentNode, 0.5)) {
            svgArr[i].render();
          }
        });
        didScroll = false;
      },
      resizeHandler = function() {
        function delayed() {
          scrollPage();
          resizeTimeout = null;
        }
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(delayed, 200);
      };
    window.addEventListener('scroll', scrollHandler, false);
    window.addEventListener('resize', resizeHandler, false);
  }
  init();
})();

/*======= slide in for boxes =========*/
/*=== from my other pen http://codepen.io/JayPea21/pen/NPPeOG ===*/
jQuery(document).ready(function() {
  jQuery('.boxL').addClass("").viewportChecker({
    classToAdd: 'showLeft',
    offset: 100
  });
  jQuery('.boxR').addClass("").viewportChecker({
    classToAdd: 'showRight',
    offset: 100
  });
});

(function($) {
  $.fn.viewportChecker = function(useroptions) {
    // Define options and extend with user
    var options = {
      classToAdd: 'show',
      offset: 200,
      callbackFunction: function(elem) {}
    };
    $.extend(options, useroptions);
    // Cache the given element and height of the browser
    var $elem = this,
      windowHeight = $(window).height();
    this.checkElements = function() {
      // Set some vars to check with
      var scrollElem = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html'),
        viewportTop = $(scrollElem).scrollTop(),
        viewportBottom = (viewportTop + windowHeight);
      $elem.each(function() {
        var $obj = $(this);
        // define the top position of the element and include the offset which makes is appear earlier or later
        var elemTop = Math.round($obj.offset().top) + options.offset,
          elemBottom = elemTop + ($obj.height());

        // Add class if in viewport
        if ((elemTop < viewportBottom) && (elemBottom > viewportTop)) {
          $obj.addClass(options.classToAdd);
          // Do the callback function. Callback wil send the jQuery object as parameter
          options.callbackFunction($obj);
        }
        // Remove class if not in viewport
        if (!(elemTop < viewportBottom)) {
          /*alert("hi");*/
          $obj.removeClass(options.classToAdd);
          options.callbackFunction($obj);
        }
      });
    };
    // Run checkelements on load and scroll
    $(window).scroll(this.checkElements);
    this.checkElements();
    // On resize change the height var
    $(window).resize(function(e) {
      windowHeight = e.currentTarget.innerHeight;
    });
  };
})(jQuery);