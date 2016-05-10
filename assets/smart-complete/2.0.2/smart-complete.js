/*!
 * smart-complete - 为input和textarea提供提示补全功能的AngularJS指令
 * @version 2.0.2
 * @link https://github.com/zskymn/smart-complete#readme
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'angular'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('jquery'), require('angular'));
  } else {
    factory(root.jQuery, root.angular);
  }
}(this, function($, angular){
angular
  .module('smart-complete', []);

angular
  .module('smart-complete')
  .service('$scUtil', ["$timeout", "$q", function($timeout, $q) {
    var vm = this;
    vm.debounce = debounce;
    vm.noopSearchFunc = noopSearchFunc;

    function debounce(func, wait) {
      var timeoutPromise = null;
      if (wait !== 0 && !wait) {
        wait = 300;
      }
      return function() {
        var context = this,
          args = arguments;
        $timeout.cancel(timeoutPromise);
        return (timeoutPromise = $timeout(function() {
          return func.apply(context, args);
        }, wait));
      };
    }

    function noopSearchFunc() {
      return $q.when([]);
    }
  }]);

angular
  .module('smart-complete')
  .directive('smartComplete', ["$parse", "$scUtil", "$timeout", function($parse, $scUtil, $timeout) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var tagName, __searchFunc, __sep, __width, __height, __itemClickCb, __enterCb, $$completor, selectedClass;
        activate();

        function activate() {
          tagName = elem[0].tagName.toLowerCase();
          __searchFunc = $parse(attrs.smartComplete);
          __sep = $parse(attrs.scSep);
          __width = $parse(attrs.scWidth);
          __height = $parse(attrs.scHeight);
          __itemClickCb = $parse(attrs.scItemClickCb);
          __enterCb = $parse(attrs.scEnterCb);
          selectedClass = 'current-selected';

          if (tagName !== 'input' && tagName !== 'textarea') {
            throw 'tagName must be input or textarea';
          }
          $$completor = $('<ul class="smart-complete"></ul>');
          elem.after($$completor);
          initStyle();
          registObservers();
        }

        function initStyle() {
          elem.css('font-size', elem.css('font-size'));
          if (tagName === 'textarea') {
            elem.css({
              overflow: 'auto',
              overflowX: 'auto',
              overflowY: 'auto',
              wordBreak: 'break-all'
            });
          }
          $$completor.hide();
        }

        function registObservers() {
          elem
            .off('click.sc')
            .on('click.sc', updateCompletorItems)
            .off('keyup.sc')
            .on('keyup.sc', $scUtil.debounce(function(evt) {
              var code = evt.which;
              if (code === 13 || code === 38 || code === 40 || code === 9) {
                return;
              }
              updateCompletorItems();
            }))
            .off('keydown.sc')
            .on('keydown.sc', function(evt) {
              var code = evt.which,
                isUp;
              if (code === 13) {
                if ($$completor.is(':visible')) {
                  evt.preventDefault();
                  $$completor.hide();
                }
                $timeout(function() {
                  (__enterCb(scope) || angular.noop)(elem.val());
                });
                return;
              } else if (code === 9) {
                if ($$completor.is(':visible')) {
                  $$completor.hide();
                }
                return;
              } else if (code === 38) {
                isUp = true;
              } else if (code === 40) {
                isUp = false;
              } else {
                return;
              }
              evt.preventDefault();
              changeSelectedItem(isUp);
            });

          $$completor
            .off('mouseenter.sc')
            .on('mouseenter.sc', 'li', function() {
              $(this).addClass(selectedClass);
            })
            .off('mouseleave.sc')
            .on('mouseleave.sc', 'li', function() {
              $$completor.children().removeClass(selectedClass);
            })
            .off('click.sc')
            .on('click.sc', 'li', function() {
              appendModelValue($(this).attr('value'));
              var itemVal = $(this).attr('value');
              $timeout(function() {
                (__itemClickCb(scope) || angular.noop)(itemVal, elem.val());
              });
              $$completor.hide();
            });

          $(document).on('click.sc', function() {
            $$completor.hide();
          });
        }


        function getValueSlice() {
          var caretPos = elem.caret('pos'),
            sep = __sep(scope);
          if (!sep) {
            return elem.val();
          }
          sep += '';
          var allVal = elem.val();
          return allVal.substring(0, caretPos).split(sep).pop() + allVal.substring(caretPos).split(sep)[0];
        }


        function getCompletorPosStyle() {
          var width = __width(scope),
            height = parseInt(__height(scope), 10) || 240,
            sep = __sep(scope),
            elemPos = elem.position(),
            elemWidth = elem.outerWidth(),
            elemHeight = elem.outerHeight(),
            caretPos = elem.caret('pos'),
            caretPosition = elem.caret('position'),
            allVal = elem.val(),
            pos, cLeft, cTop;
          if (!sep) {
            pos = elem.caret('position', 0);
            pos.left = 0;
          } else {
            sep += '';
            pos = elem.caret('position', caretPos - allVal.substring(0, caretPos).split(sep).pop().length);
          }
          if (width === '100%') {
            width = elem.outerWidth();
            cLeft = 0;
          } else {
            width = parseInt(width, 10) || 240;
            if (width >= elemWidth) {
              cLeft = 0;
            } else if (pos.left + width >= elemWidth) {
              cLeft = elemWidth - width;
            } else {
              cLeft = pos.left;
            }
          }

          if (tagName === 'input') {
            cTop = elemHeight;
          } else {
            cTop = caretPosition.top + caretPosition.height - elem.scrollTop();
            if (caretPosition.top > pos.top) {
              cLeft = 0;
            }
          }
          return {
            width: width,
            maxHeight: height,
            left: elemPos.left + parseInt(elem.css('marginLeft'), 10) + cLeft,
            top: elemPos.top + parseInt(elem.css('marginTop'), 10) + cTop + 2
          };
        }

        function updateCompletorItems() {
          var sliceVal = getValueSlice();
          (__searchFunc(scope) || $scUtil.noopSearchFunc)(sliceVal)
          .then(function(items) {
            return $.map(items, function(item) {
              if (angular.isObject(item)) {
                return item;
              } else {
                return {
                  label: item,
                  value: item
                };
              }
            });
          }, function() {
            return [];
          }).then(function(items) {
            if (items.length === 0) {
              $$completor.html('').hide();
              return;
            }

            $$completor.html($.map(items, function(item) {
              return '<li value="' + item.value + '">' + item.label + '</li>';
            }).join('')).css(getCompletorPosStyle()).show();
          });
        }

        function changeSelectedItem(isUp) {
          if ($$completor.is(':hidden')) {
            return;
          }
          var items = $$completor.children();
          if (items.length === 0) {
            return;
          }
          var seletedItem = items.filter('.' + selectedClass).first(),
            shouldSelectedItem = seletedItem;
          if (seletedItem.length) {
            if (isUp) {
              var prev = seletedItem.prev();
              if (prev.length) {
                shouldSelectedItem = prev;
              }
            } else {
              var next = seletedItem.next();
              if (next.length) {
                shouldSelectedItem = next;
              }
            }
          } else {
            shouldSelectedItem = isUp ? items.last() : items.first();
          }
          items.removeClass(selectedClass);
          shouldSelectedItem.addClass(selectedClass);
          appendModelValue(shouldSelectedItem.attr('value'));
          var itemTop = shouldSelectedItem.position().top,
            min = 0,
            max = $$completor.height() - shouldSelectedItem.height();
          if (itemTop > max) {
            $$completor.scrollTop($$completor.scrollTop() + itemTop - max);
          }
          if (itemTop < min) {
            return $$completor.scrollTop($$completor.scrollTop() + itemTop - min);
          }
        }

        function appendModelValue(value) {
          var sep = __sep(scope),
            lv, pos, rps, sv, val, sps;
          if (!sep) {
            elem.val(value).focus().trigger('change');
            return;
          }
          sep += '';
          pos = elem.caret('pos');
          val = elem.val();
          lv = val.substring(0, pos);
          sps = lv.split(sep);
          sv = sps.pop();
          sps.push(value);
          if (val.substring(pos)) {
            rps = val.substring(pos).split(sep);
            rps.shift();
            if (rps.join(sep)) {
              sps.push(rps.join(sep));
            }
          }
          elem.val(sps.join(sep))
            .caret('pos', pos + value.length - sv.length);
          elem.focus()
            .trigger('change');
        }
      }
    };
  }]);
}));