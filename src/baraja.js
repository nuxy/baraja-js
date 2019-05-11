/**
 *  BarajaJS
 *  A plugin for spreading items in a card-like fashion.
 *
 *  Copyright 2019, Marc S. Brooks (https://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */
function Baraja(container, options) {
  var self = this;

  var defaults = {
    easing: 'ease-in-out',
    speed:  300
  };

  (function() {
    self.options = Object.assign(defaults, options);

    setDefaultFanSettings();

    self.items = getItemsAsArray();

    self.itemTotal = self.items.length;

    if (self.itemTotal > 1) {
      self.isClosed  = true;
      self.zIndexMin = 1000;

      setStack();

      initClickEvents();
    } else {
      throw new Error('Failed to initialize (no items found)');
    }
  })();

  function setDefaultFanSettings() {
    self.fanSettings = {
      easing:      'ease-out',
      direction:   'right',
      origin:      { x: 25, y: 100 },
      speed:       500,
      range:       90,
      translation: 0,
      center:      true,
      scatter:     false
    };
  }

  /**
   * Validate default fan settings.
   *
   * @param {Object} settings
   *   Fan settings (optional).
   */
  function validateDefaultFanSettings(settings) {
    settings.direction   = settings.direction   || self.fanSettings.direction;
    settings.easing      = settings.easing      || self.fanSettings.easing;
    settings.speed       = settings.speed       || self.fanSettings.speed;
    settings.range       = settings.range       || self.fanSettings.range;
    settings.translation = settings.translation || self.fanSettings.translation;

    if (!settings.origin) {
      settings.origin = self.fanSettings.origin;
    } else {
      settings.origin.x = settings.origin.x || self.fanSettings.origin.x;
      settings.origin.y = settings.origin.y || self.fanSettings.origin.y;
    }

    if (!settings.center) {
      settings.center = self.fanSettings.center;
    }

    if (!settings.scatter) {
      settings.scatter = self.fanSettings.scatter;
    }

    self.direction = settings.direction;

    return settings;
  }

  /**
   * Set the zIndex for the given items.
   *
   * @param {Array} items
   *   Array of HTML items.
   */
  function setStack(items) {
    items = items || self.items;

    items.forEach(function(item, index) {
      item.style.zIndex = (self.zIndexMin + self.itemTotal - 1 - index);
    });
  }

  /**
   * Update the zIndex for the given element.
   *
   * @param {HTMLElement} element
   *   HTML element.
   *
   * @param {String} direction
   *   Stack direction (next|prev).
   */
  function updateStack(element, direction) {
    var stepNext = (direction === 'next');

    var zIndexCurr = parseInt(element.style.zIndex);

    var zIndexNew = (stepNext)
      ? self.zIndexMin - 1
      : self.zIndexMin + self.itemTotal;

    element.style.zIndex = zIndexNew;

    self.items.forEach(function(item) {
      var zIndex = parseInt(item.style.zIndex);

      var update = (stepNext)
        ? (zIndex < zIndexCurr)
        : (zIndex > zIndexCurr);

      if (update) {
        item.style.zIndex = (stepNext)
          ? zIndex + 1
          : zIndex - 1;
      }
    });
  }

  /**
   * Initialize element click event handlers.
   *
   * @param {Array} items
   *   Array of HTML items.
   */
  function initClickEvents(items) {
    items = items || self.items;

    items.forEach(function(item) {
      var eventHandler = function() {
        if (!self.isAnimating) {
          move2front(item);
        }
      };

      item.addEventListener('click', eventHandler, true);
    });
  }

  /**
   * Disable the CSS transition for a given element.
   *
   * @param {HTMLElement} element
   *   HTML element.
   */
  function resetTransition(element) {
    element.style.transition = 'none';
  }

  /**
   * Set the CSS transform-origin for a given element.
   *
   * @param {HTMLElement} element
   *   HTML element.
   *
   * @param {String} x
   *   Horizontal axis.
   *
   * @param {String} y
   *   Verticle axis.
   */
  function setOrigin(element, x, y) {
    element.style.transformOrigin = x + '% ' + y + '%';
  }

  /**
   * Set the CSS transition for a given element.
   *
   * @param {HTMLElement} element
   *   HTML element.
   *
   * @param {String} property
   *   Property (optional).
   *
   * @param {String} duration
   *   Duration (optional).
   *
   * @param {String} timingFunc
   *   Timing-function (optional).
   *
   * @param {String} delay
   *   Delay (optional).
   */
  function setTransition(element, property, duration, timingFunc, delay) {
    if (!property) {
      property = 'all';
    }

    if (!duration) {
      duration = self.options.speed;
    }

    if (!timingFunc) {
      timingFunc = self.options.easing;
    }

    if (!delay) {
      delay = 0;
    }

    if (property === 'transform') {
      element.style.transition = 'transform ' + duration + 'ms ' + timingFunc + ' ' + delay + 'ms';
    } else {
      element.style.transition = property + ' ' + duration + 'ms ' + timingFunc + ' ' + delay + 'ms';
    }
  }

  /**
   * Apply the CSS transform for a given element.
   *
   * @param {HTMLElement} element
   *   HTML element.
   *
   * @param {String} easing
   *   Transform-function.
   *
   * @param {Function} eventHandler
   *   Listener event handler.
   *
   * @param {Boolean} force
   *   Force listener event.
   */
  function applyTransition(element, easing, eventHandler, force) {
    if (eventHandler) {
      element.addEventListener('transitionend', eventHandler, false);

      if (force) {
        eventHandler.call();
      }
    }

    var timer = window.setTimeout(function() {
      if (easing === 'none') {
        element.style.opacity = 1;
      }

      element.style.transform = easing;

      window.clearTimeout(timer);
    }, 25);
  }

  /**
   * Relocate the element on top of the stack.
   *
   * @param {HTMLElement} element
   *   HTML element.
   */
  function move2front(element) {
    self.isAnimating = true;

    var isTop = (parseInt(element.style.zIndex) === self.zIndexMin + self.itemTotal - 1);

    var callback = (isTop)
      ? function() { self.isAnimating = false; }
      : function() { return false;             };

    element = (isTop)
      ? null
      : element;

    if (!self.isClosed) {
      close(callback, element);
    } else {
      fan();
    }

    if (isTop) {
      return;
    }

    resetTransition(element);

    setOrigin(element, 50, 50);

    element.style.opacity   = 0;
    element.style.transform = 'scale(2) translate(100px) rotate(20deg)';

    updateStack(element, 'prev');

    var timer = window.setTimeout(function() {
      setTransition(element, 'all', self.options.speed, 'ease-in');

      var cssTransform = 'none';

      var eventHandler = function() {
        element.removeEventListener('transitionend', eventHandler);

        self.isAnimating = false;
      };

      applyTransition(element, cssTransform, eventHandler);

      window.clearTimeout(timer);
    }, self.options.speed / 2);
  }

  /**
   * Add items to the HTMLElement container.
   *
   * @param {String} html
   *   HTML items as text.
   */
  function add(html) {
    container.insertAdjacentHTML('beforeend', html);

    var oldItemTotal = self.itemTotal;

    var currItems = getItemsAsArray();

    self.items     = currItems.slice();
    self.itemTotal = currItems.length;

    var newItemCount = Math.abs(self.itemTotal - oldItemTotal);

    var newItems = currItems.splice(oldItemTotal, newItemCount);

    newItems.forEach(function(item) {
      item.style.opacity = '0';
    });

    initClickEvents(newItems);

    setStack(newItems);

    newItems = newItems.reverse();

    var count = 0;

    newItems.forEach(function(item, index) {
      item.style.transform = 'scale(1.8) translate(200px) rotate(15deg)';

      setTransition(item, 'all', 500, 'ease-out', index * 200);

      var cssTransform = 'none';

      var eventHandler = function() {
        ++count;

        item.removeEventListener('transitionend', eventHandler);

        resetTransition(item);

        if (count === newItemCount) {
          self.isAnimating = false;
        }
      };

      applyTransition(item, cssTransform, eventHandler);
    });
  }

  /**
   * Close the spreaded fan.
   *
   * @param {Function} callback
   *   Callback function.
   *
   * @param {HTMLElement} element
   *   HTML element.
   */
  function close(callback, element) {
    var items = self.items;

    if (element) {
      items = items.filter(function(item) {
        return (item !== element);
      });
    }

    var force = (self.isClosed);

    var cssTransform = 'none';

    items.forEach(function(item) {
      var eventHandler = function() {
        self.isClosed = true;

        item.removeEventListener('transitionend', eventHandler);

        resetTransition(item);

        var timer = window.setTimeout(function() {
          setOrigin(item, 50, 50);

          if (callback) {
            callback.call();
          }

          window.clearTimeout(timer);
        }, 25);
      };

      applyTransition(item, cssTransform, eventHandler, force);
    });
  }

  /**
   * Spread the stack based on defined settings.
   *
   * @param {Object} settings
   *   Fan settings (optional).
   */
  function fan(settings) {
    self.isClosed = false;

    settings = validateDefaultFanSettings(settings || {});

    var stepLeft = (settings.direction === 'left');

    if (settings.origin.minX && settings.origin.maxX) {
      var max = settings.origin.maxX;
      var min = settings.origin.minX;

      var stepOrigin = (max - min) / self.itemTotal;

      self.items.forEach(function(item) {
        var pos = self.itemTotal - 1 - (parseInt(item.style.zIndex) - self.zIndexMin);

        var originX = pos * (max - min + stepOrigin) / self.itemTotal + min;

        if (stepLeft) {
          originX = max + min - originX;
        }

        setOrigin(item, originX, settings.origin.y);
      });
    } else {
      self.items.forEach(function(item) {
        setOrigin(item, settings.origin.x , settings.origin.y);
      });
    }

    var stepAngle = settings.range / (self.itemTotal - 1);

    var stepTranslation = settings.translation / (self.itemTotal - 1);

    var count = 0;

    self.items.forEach(function(item) {
      setTransition(item, 'transform', settings.speed, settings.easing);

      var pos = self.itemTotal - 1 - (parseInt(item.style.zIndex) - self.zIndexMin);

      var val = (settings.center)
        ? settings.range / 2
        : settings.range;

      var angle = val - stepAngle * pos;

      var position = stepTranslation * (self.itemTotal - pos - 1);

      if (stepLeft) {
        angle    *= -1;
        position *= -1;
      }

      if (settings.scatter) {
        var extraAngle    = Math.floor(Math.random() * stepAngle);
        var extraPosition = Math.floor(Math.random() * stepTranslation);

        if (pos !== self.itemTotal - 1) {
          if (stepLeft) {
            angle    = angle + extraAngle;
            position = position - extraPosition;
          } else {
            angle    = angle - extraAngle;
            position = position + extraPosition;
          }
        }
      }

      var cssTransform = 'translate(' + position + 'px) rotate(' + angle + 'deg)';

      var eventHandler = function() {
        ++count;

        item.removeEventListener('transitionend', eventHandler);

        if (count === self.itemTotal - 1) {
          self.isAnimating = false;
        }
      };

      applyTransition(item, cssTransform, eventHandler);
    });
  }

  /**
   * Show the next/previous item in the stack.
   *
   * @param {String} direction
   *   Stack direction (next|prev).
   */
  function navigate(direction) {
    self.isClosed = false;

    var stepNext = (direction === 'next');

    var zIndexCurr = (stepNext)
      ? self.zIndexMin + self.itemTotal - 1
      : self.zIndexMin;

    var element = self.items.find(function(item) {
      return (parseInt(item.style.zIndex) === zIndexCurr);
    });

    var rotation, translation;

    if (stepNext) {
      rotation = 5;
      translation = element.offsetWidth + 15;
    } else {
      rotation = 5 * -1;
      translation = element.offsetWidth * -1 - 15;
    }

    setTransition(element, 'transform', self.options.speed, self.options.easing);

    var cssTransform = 'translate(' + translation + 'px) rotate(' + rotation + 'deg)';

    var eventHandler = function() {
      element.removeEventListener('transitionend', eventHandler);

      updateStack(element, direction);

      cssTransform = 'translate(0px) rotate(0deg)';

      eventHandler = function() {
        element.removeEventListener('transitionend', eventHandler);

        self.isAnimating = false;
        self.isClosed    = true;
      };

      applyTransition(element, cssTransform, eventHandler);
    };

    applyTransition(element, cssTransform, eventHandler);
  }

  /**
   * Dispatch the fan spread action.
   */
  function dispatch(func, args) {
    if (self.itemTotal > 1 || !self.isAnimating) {
      self.isAnimating = true;

      if (!self.isClosed) {
        close(function() {
          func.call(self, args);
        });
      } else {
        func.call(self, args);
      }
    }
  }

  /**
   * Return HTMLElement container items as array.
   *
   * @return {Array}
   */
  function getItemsAsArray() {
    var elements = container.querySelectorAll('li');
    if (elements) {
      return Array.prototype.slice.call(elements);
    }
  }

  /**
   * Protected members.
   */
  this.add = function(html) {
    dispatch(add, html);
  };

  this.fan = function(settings) {
    dispatch(fan, settings);
  };

  this.next = function() {
    dispatch(navigate, 'next');
  };

  this.previous = function() {
    dispatch(navigate, 'prev');
  };

  this.close = function() {
    if (!self.isAnimating) {
      close();
    }
  };
}

/**
 * Set global instance.
 */
window.baraja = function(container, options) {
  return new Baraja(container, options);
};
