/**
 *  BarajaJS
 *  A plugin for spreading items in a card-like fashion.
 *
 *  Copyright 2019, Marc S. Brooks (https://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */
function Baraja(container, options) {
  const self = this;

  const defaults = {
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
      origin:      {x: 25, y: 100},
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
   * @param {Array} items.
   *   Array of HTML elements (optional).
   */
  function setStack(items = self.items) {
    items.forEach(function(item, index) {
      item.style.zIndex = (self.zIndexMin + self.itemTotal - 1 - index)
        .toString();
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
    const stepNext = (direction === 'next');

    const zIndexCurr = parseInt(element.style.zIndex);

    element.style.zIndex = (stepNext)
      ? self.zIndexMin - 1
      : self.zIndexMin + self.itemTotal;

    self.items.forEach(function(item) {
      const zIndex = parseInt(item.style.zIndex);

      const update = (stepNext)
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
   *   Array of HTML elements (optional).
   */
  function initClickEvents(items = self.items) {
    items.forEach(function(item) {
      const eventHandler = function() {
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
   * @param {Number} x
   *   Horizontal axis.
   *
   * @param {Number} y
   *   Vertical axis.
   */
  function setOrigin(element, x, y) {
    element.style.transformOrigin = `${x}% ${y}%`;
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
   * @param {Number} delay
   *   Delay (optional).
   */
  function setTransition(element,
    property   = 'all',
    duration   = self.options.speed,
    timingFunc = self.options.easing,
    delay      = 0) {

    const animation = `${duration}ms ${timingFunc} ${delay}ms`;

    element.style.transition = (property === 'transform')
      ? `transform ${animation}`
      : `${property} ${animation}`;
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
   *   Force listener event (optional).
   */
  function applyTransition(element, easing, eventHandler, force = false) {
    if (eventHandler) {
      element.addEventListener('transitionend', eventHandler, false);

      if (force) {
        eventHandler.call();
      }
    }

    setTimeoutFrame(function() {
      if (easing === 'none') {
        element.style.opacity = '1';
      }

      element.style.transform = easing;
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

    const zIndexCurr = parseInt(element.style.zIndex);

    const isTop = (zIndexCurr === self.zIndexMin + self.itemTotal - 1);

    const callback = (isTop)
      ? function() {
          self.isAnimating = false;
        }
      : function() {
          return false;
        };

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

    element.style.opacity   = '0';
    element.style.transform = 'scale(2) translate(100px) rotate(20deg)';

    updateStack(element, 'prev');

    setTimeoutFrame(function() {
      setTransition(element, 'all', self.options.speed, 'ease-in');

      const cssTransform = 'none';

      const eventHandler = function() {
        element.removeEventListener('transitionend', eventHandler);

        self.isAnimating = false;
      };

      applyTransition(element, cssTransform, eventHandler);
    }, self.options.speed / 2);
  }

  /**
   * Add items to the HTMLElement container.
   *
   * @param {String} html
   *   HTML elements as text.
   */
  function add(html) {
    container.insertAdjacentHTML('beforeend', html);

    const oldItemTotal = self.itemTotal;

    const currItems = getItemsAsArray();

    self.items     = currItems.slice();
    self.itemTotal = currItems.length;

    const newItemCount = Math.abs(self.itemTotal - oldItemTotal);

    let newItems = currItems.splice(oldItemTotal, newItemCount);

    newItems.forEach(function(item) {
      item.style.opacity = '0';
    });

    initClickEvents(newItems);

    setStack(newItems);

    newItems = newItems.reverse();

    let count = 0;

    newItems.forEach(function(item, index) {
      item.style.transform = 'scale(1.8) translate(200px) rotate(15deg)';

      setTransition(item, 'all', '500', 'ease-out', index * 200);

      const cssTransform = 'none';

      const eventHandler = function() {
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
   * Close the spread fan.
   *
   * @param {Function} callback
   *   Callback function (optional).
   *
   * @param {HTMLElement} element
   *   HTML element (optional).
   */
  function close(callback = null, element = null) {
    let items = self.items;

    if (element) {
      items = items.filter(function(item) {
        return (item !== element);
      });
    }

    const force = (self.isClosed);

    const cssTransform = 'none';

    items.forEach(function(item) {
      const eventHandler = function() {
        self.isClosed = true;

        item.removeEventListener('transitionend', eventHandler);

        resetTransition(item);

        setTimeoutFrame(function() {
          setOrigin(item, 50, 50);

          if (callback) {
            callback.call();
          }
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
  function fan(settings = {}) {
    self.isClosed = false;

    settings = validateDefaultFanSettings(settings);

    const stepLeft = (settings.direction === 'left');

    if (settings.origin.minX && settings.origin.maxX) {
      const max = settings.origin.maxX;
      const min = settings.origin.minX;

      const stepOrigin = (max - min) / self.itemTotal;

      self.items.forEach(function(item) {
        const zIndexCurr = parseInt(item.style.zIndex);

        const pos = self.itemTotal - 1 - (zIndexCurr - self.zIndexMin);

        let originX = pos * (max - min + stepOrigin) / self.itemTotal + min;

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

    const stepAngle = settings.range / (self.itemTotal - 1);

    const stepTranslation = settings.translation / (self.itemTotal - 1);

    let count = 0;

    self.items.forEach(function(item) {
      setTransition(item, 'transform');

      const zIndexCurr = parseInt(item.style.zIndex);

      const pos = self.itemTotal - 1 - (zIndexCurr - self.zIndexMin);

      const val = (settings.center)
        ? settings.range / 2
        : settings.range;

      let angle = val - stepAngle * pos;

      let position = stepTranslation * (self.itemTotal - pos - 1);

      if (stepLeft) {
        angle    *= -1;
        position *= -1;
      }

      if (settings.scatter) {
        const extraAngle    = Math.floor(Math.random() * stepAngle);
        const extraPosition = Math.floor(Math.random() * stepTranslation);

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

      const cssTransform = `translate(${position}px) rotate(${angle}deg)`;

      const eventHandler = function() {
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

    const stepNext = (direction === 'next');

    const zIndexCurr = (stepNext)
      ? self.zIndexMin + self.itemTotal - 1
      : self.zIndexMin;

    const element = self.items.find(function(item) {
      return (parseInt(item.style.zIndex) === zIndexCurr);
    });

    let rotation, translation;

    if (stepNext) {
      rotation = 5;
      translation = element.offsetWidth + 15;
    } else {
      rotation = 5 * -1;
      translation = element.offsetWidth * -1 - 15;
    }

    setTransition(element, 'transform');

    let cssTransform = `translate(${translation}px) rotate(${rotation}deg)`;

    let eventHandler = function() {
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
   *
   * @param {Function} func
   *   Function to execute.
   *
   * @param {*} args
   *   Function arguments.
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
   * setTimeout alternative for handling animations.
   *
   * @param {Function} handler
   *   Animation handler.
   *
   * @param {Number} timeout
   *   Timeout in milliseconds (optional).
   */
  function setTimeoutFrame(handler, timeout = 5000) {
    let start = 0;

    const step = function(timestamp) {
      if (!start) {
        start = timestamp;
      }

      let progress = timestamp - start;
      if (progress < timeout) {
        window.requestAnimationFrame(step);
      } else {
        handler();
      }
    };

    window.requestAnimationFrame(step);
  }

  /**
   * Return HTMLElement container items as array.
   *
   * @return {Array}
   */
  function getItemsAsArray() {
    const elements = container.querySelectorAll('li');
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
 * Set global/exportable instance, where supported.
 */
window.baraja = function(container, options) {
  return new Baraja(container, options);
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Baraja;
}
