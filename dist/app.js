(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/will/Code/hnjobs/node_modules/lodash/date/now.js":[function(require,module,exports){
var getNative = require('../internal/getNative');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeNow = getNative(Date, 'now');

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Date
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => logs the number of milliseconds it took for the deferred function to be invoked
 */
var now = nativeNow || function() {
  return new Date().getTime();
};

module.exports = now;

},{"../internal/getNative":"/Users/will/Code/hnjobs/node_modules/lodash/internal/getNative.js"}],"/Users/will/Code/hnjobs/node_modules/lodash/function/debounce.js":[function(require,module,exports){
var isObject = require('../lang/isObject'),
    now = require('../date/now');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed invocations. Provide an options object to indicate that `func`
 * should be invoked on the leading and/or trailing edge of the `wait` timeout.
 * Subsequent calls to the debounced function return the result of the last
 * `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify invoking on the leading
 *  edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be
 *  delayed before it's invoked.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // ensure `batchLog` is invoked once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }));
 *
 * // cancel a debounced call
 * var todoChanges = _.debounce(batchLog, 1000);
 * Object.observe(models.todo, todoChanges);
 *
 * Object.observe(models, function(changes) {
 *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
 *     todoChanges.cancel();
 *   }
 * }, ['delete']);
 *
 * // ...at some point `models.todo` is changed
 * models.todo.completed = true;
 *
 * // ...before 1 second has passed `models.todo` is deleted
 * // which cancels the debounced `todoChanges` call
 * delete models.todo;
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = wait < 0 ? 0 : (+wait || 0);
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = !!options.leading;
    maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
    }
    lastCalled = 0;
    maxTimeoutId = timeoutId = trailingCall = undefined;
  }

  function complete(isCalled, id) {
    if (id) {
      clearTimeout(id);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (isCalled) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = undefined;
      }
    }
  }

  function delayed() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0 || remaining > wait) {
      complete(trailingCall, maxTimeoutId);
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  }

  function maxDelayed() {
    complete(trailing, timeoutId);
  }

  function debounced() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0 || remaining > maxWait;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      }
      else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    }
    else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = undefined;
    }
    return result;
  }
  debounced.cancel = cancel;
  return debounced;
}

module.exports = debounce;

},{"../date/now":"/Users/will/Code/hnjobs/node_modules/lodash/date/now.js","../lang/isObject":"/Users/will/Code/hnjobs/node_modules/lodash/lang/isObject.js"}],"/Users/will/Code/hnjobs/node_modules/lodash/internal/getNative.js":[function(require,module,exports){
var isNative = require('../lang/isNative');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

module.exports = getNative;

},{"../lang/isNative":"/Users/will/Code/hnjobs/node_modules/lodash/lang/isNative.js"}],"/Users/will/Code/hnjobs/node_modules/lodash/internal/isObjectLike.js":[function(require,module,exports){
/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],"/Users/will/Code/hnjobs/node_modules/lodash/lang/isFunction.js":[function(require,module,exports){
var isObject = require('./isObject');

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 which returns 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

module.exports = isFunction;

},{"./isObject":"/Users/will/Code/hnjobs/node_modules/lodash/lang/isObject.js"}],"/Users/will/Code/hnjobs/node_modules/lodash/lang/isNative.js":[function(require,module,exports){
var isFunction = require('./isFunction'),
    isObjectLike = require('../internal/isObjectLike');

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isNative;

},{"../internal/isObjectLike":"/Users/will/Code/hnjobs/node_modules/lodash/internal/isObjectLike.js","./isFunction":"/Users/will/Code/hnjobs/node_modules/lodash/lang/isFunction.js"}],"/Users/will/Code/hnjobs/node_modules/lodash/lang/isObject.js":[function(require,module,exports){
/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],"/Users/will/Code/hnjobs/src/components/App.jsx":[function(require,module,exports){
// App.jsx
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var React = require('react');
var Firebase = require('firebase');
var Promise = require('bluebird');
var debounce = require('lodash/function/debounce');
var mui = require('material-ui');
var MediaQuery = require('react-responsive');
var ThemeManager = new mui.Styles.ThemeManager();

var Card = mui.Card;
var CardHeader = mui.CardHeader;
var CardText = mui.CardText;
var CardActions = mui.CardActions;
var CircularProgress = mui.CircularProgress;
var LeftNav = mui.LeftNav;
var AppBar = mui.AppBar;
var TextField = mui.TextField;
var FontIcon = mui.FontIcon;
var Avatar = mui.Avatar;
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;
var IconButton = mui.IconButton;
var ClearFix = mui.ClearFix;

var userRef = new Firebase('https://hacker-news.firebaseio.com/v0/user');
var itemRef = new Firebase('https://hacker-news.firebaseio.com/v0/item');

function retrieveItems() {
	for (var _len = arguments.length, ids = Array(_len), _key = 0; _key < _len; _key++) {
		ids[_key] = arguments[_key];
	}

	return new Promise(function (resolve, reject) {
		var count = ids.length;
		var results = [];
		ids.forEach(function (id) {
			itemRef.child(id).once('value', function (d) {
				results.push(d.val());
				if (--count === 0) {
					resolve(results);
				}
			});
		});
	});
}

var App = React.createClass({
	displayName: 'App',

	getInitialState: function getInitialState() {
		return {
			threadIds: [],
			selectedIndex: 0,
			currentThread: [],
			search: "",
			page: 1
		};
	},
	childContextTypes: {
		muiTheme: React.PropTypes.object
	},
	getChildContext: function getChildContext() {
		return {
			muiTheme: ThemeManager.getCurrentTheme()
		};
	},
	componentWillMount: function componentWillMount() {
		var _this = this;

		// MUI theme
		ThemeManager.setPalette({
			primary1Color: "#ff6600"
		});
		ThemeManager.setComponentThemes({
			textField: {
				textColor: mui.Styles.Colors.darkWhite
			}
		});

		// Firebase HN API
		userRef.child('whoishiring/submitted').on('value', function (data) {
			var ids = data.val();
			retrieveItems.apply(undefined, _toConsumableArray(ids)).then(function (threads) {
				var threadIds = threads.filter(function (post) {
					return post.title && post.title.substr(0, "Ask HN: Who is hiring?".length).toLowerCase() === "ask hn: who is hiring?";
				});
				_this.setState({ threadIds: threadIds });
				_this.threadRef = itemRef.child(threadIds[0].id + '/kids');
				_this.threadRef.on('value', function (postIds) {
					retrieveItems.apply(undefined, _toConsumableArray(postIds.val())).then(function (thread) {
						_this.setState({
							currentThread: thread,
							page: 1
						});
					});
				});
			});
		});
	},
	_toggleNav: function _toggleNav() {
		this.refs.leftNav.toggle();
	},
	_navSelect: function _navSelect(e, selectedIndex, menuItem) {
		var _this2 = this;

		// get selected thread
		this.threadRef.off(); // clean up previous firebase listeners
		this.threadRef = itemRef.child(this.state.threadIds[selectedIndex].id + '/kids');
		this.setState({ currentThread: [], selectedIndex: selectedIndex });
		this.threadRef.on('value', function (threadIds) {
			retrieveItems.apply(undefined, _toConsumableArray(threadIds.val())).then(function (thread) {
				_this2.setState({
					currentThread: thread,
					page: 1
				});
			});
		});
	},
	_nextPage: function _nextPage() {
		this.setState({
			page: this.state.page + 1
		});
	},
	render: function render() {
		var _this3 = this;

		console.log('update');
		var menuItems = this.state.threadIds.map(function (post) {
			return { text: post.title.slice('Ask HN: Who is hiring? ('.length, -1), postId: post.id };
		});
		return React.createElement(
			'div',
			null,
			React.createElement(AppBar, { title: 'Who\'s Hiring?',
				onLeftIconButtonTouchTap: this._toggleNav,
				iconElementRight: React.createElement(
					'div',
					null,
					React.createElement(
						MediaQuery,
						{ minDeviceWidth: 600 },
						React.createElement(Search, { onChange: debounce(function (value) {
								return _this3.setState({ search: value, page: 1 });
							}, 400) })
					),
					React.createElement(
						MediaQuery,
						{ maxDeviceWidth: 599 },
						React.createElement(IconButton, { iconClassName: 'fa fa-search', iconStyle: { color: mui.Styles.Colors.darkWhite } })
					)
				)
			}),
			React.createElement(LeftNav, { ref: 'leftNav', menuItems: menuItems, selectedIndex: this.state.selectedIndex, docked: false, onChange: this._navSelect }),
			this.state.currentThread.length ? React.createElement(Page, { posts: this.state.currentThread, search: this.state.search, page: this.state.page, nextPage: this._nextPage }) : React.createElement(
				'div',
				{ style: { textAlign: "center" } },
				React.createElement(CircularProgress, { mode: 'indeterminate', size: 2 })
			),
			React.createElement(ClearFix, null),
			React.createElement(
				'p',
				{ style: { textAlign: "center", fontFamily: "Roboto, sans-serif" } },
				'Design and code by ',
				React.createElement(
					'a',
					{ href: 'http://willacton.com' },
					'Will Acton'
				)
			)
		);
	}
});

module.exports = App;

// {title={post.text
// 							.split('<p>')[0]
// 							.replace(/(<([^>]+)>)/ig,"")
// 							.replace(/&#x27;/g,"'")
// 							.replace(/&#x2F;/g,"/")
// 							.slice(0, 60)+'...'}
// 						subtitle={post.by}}

var Page = React.createClass({
	displayName: 'Page',

	render: function render() {
		var _this4 = this;

		var thread = this.props.posts.filter(function (el) {
			return el && !el.deleted;
		}).filter(function (post) {
			return post.text.toLowerCase().match(_this4.props.search.toLowerCase());
		});

		console.log(this.props.page, Math.ceil(thread.length / 10));
		return React.createElement(
			'div',
			{ style: { width: "90%", margin: "5px auto", wordWrap: 'break-word' } },
			thread.slice(0, this.props.page * 10).map(function (post, i) {
				return React.createElement(
					Card,
					{ key: post.id, style: { margin: "10px 0" }, initiallyExpanded: true },
					React.createElement(CardHeader, {
						title: 'Post',
						subtitle: React.createElement(
							'a',
							{ href: "https://news.ycombinator.com/user?id=" + post.by },
							'by ',
							post.by
						),
						avatar: React.createElement(
							Avatar,
							null,
							'H'
						),
						showExpandableButton: true
					}),
					React.createElement(CardText, { dangerouslySetInnerHTML: { __html: post.text }, expandable: true }),
					React.createElement(
						CardActions,
						{ expandable: true, style: { textAlign: "right" } },
						React.createElement(FlatButton, { linkButton: true, labelStyle: { marginRight: "12px" }, href: "https://news.ycombinator.com/item?id=" + post.id, target: '_blank', label: 'Link' })
					)
				);
			}),
			React.createElement(
				'div',
				{ style: { textAlign: "center" } },
				this.props.page < Math.ceil(thread.length / 10) ? React.createElement(RaisedButton, { backgroundColor: '#ff6600', labelColor: mui.Styles.Colors.darkWhite, label: 'More', onClick: this.props.nextPage, fullWidth: true }) : ''
			)
		);
	}
});

var Search = React.createClass({
	displayName: 'Search',

	handleChange: function handleChange(e) {
		this.props.onChange(e.target.value);
	},
	render: function render() {
		return React.createElement(
			'div',
			{ style: { marginRight: "50px" } },
			React.createElement(FontIcon, { className: 'fa fa-search', color: mui.Styles.Colors.darkWhite, style: { margin: "0 5px", top: "5px", fontSize: "20px" } }),
			React.createElement(TextField, { onChange: this.handleChange, hintText: 'regexp' })
		);
	}
});
/*this.state.page > 1
? (<FlatButton label="Previous" onClick={this._prevPage} />)
: ''
*/

},{"bluebird":"bluebird","firebase":"firebase","lodash/function/debounce":"/Users/will/Code/hnjobs/node_modules/lodash/function/debounce.js","material-ui":"material-ui","react":"react","react-responsive":"react-responsive"}],"/Users/will/Code/hnjobs/src/init.jsx":[function(require,module,exports){
'use strict';

var React = require('react');
var App = require('./components/App.jsx');
var injectTapEventPlugin = require("react-tap-event-plugin");

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

React.render(React.createElement(App, null), document.getElementById('app'));

},{"./components/App.jsx":"/Users/will/Code/hnjobs/src/components/App.jsx","react":"react","react-tap-event-plugin":"react-tap-event-plugin"}]},{},["/Users/will/Code/hnjobs/src/init.jsx"]);
