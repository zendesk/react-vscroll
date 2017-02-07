'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _jsx = function () { var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7; return function createRawReactElement(type, props, key, children) { var defaultProps = type && type.defaultProps; var childrenLength = arguments.length - 3; if (!props && childrenLength !== 0) { props = {}; } if (props && defaultProps) { for (var propName in defaultProps) { if (props[propName] === void 0) { props[propName] = defaultProps[propName]; } } } else if (!props) { props = defaultProps || {}; } if (childrenLength === 1) { props.children = children; } else if (childrenLength > 1) { var childArray = Array(childrenLength); for (var i = 0; i < childrenLength; i++) { childArray[i] = arguments[i + 3]; } props.children = childArray; } return { $$typeof: REACT_ELEMENT_TYPE, type: type, key: key === undefined ? null : '' + key, ref: null, props: props, _owner: null }; }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _VItem = require('./VItem');

var _VItem2 = _interopRequireDefault(_VItem);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VContainer = (_temp = _class = function (_Component) {
	_inherits(VContainer, _Component);

	function VContainer(props) {
		_classCallCheck(this, VContainer);

		var _this = _possibleConstructorReturn(this, (VContainer.__proto__ || Object.getPrototypeOf(VContainer)).call(this, props));

		_this.onScroll = function () {
			_this.stop_measuring = false;

			if (_this.prevent_scroll) {
				_this.prevent_scroll = false;
				return;
			}

			_this.rafID = window.requestAnimationFrame(function () {
				var target = _this.refs.container;
				var scroll_bottom = _this.getScrollBottom();
				var scroll_top = target.scrollTop;

				// TODO: we do not know whether it will always be 1px above the bottom
				// Firefox, Safari appears to be at 0 correctly, while chrome is 1

				if (scroll_bottom <= 1) {
					scroll_top += scroll_bottom;
					scroll_bottom = 0;
				}

				_this.scrolling_up = _this.prev_scroll_top - scroll_top > 0;

				_this.at_bottom = scroll_bottom === 0;

				_this.prev_scroll_top = scroll_top;

				_this.setRenderedRows(scroll_top);
			});
		};

		_this.getRowHeights = function () {
			var prev_row_heights = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var items = arguments[1];

			/*
    * We reconstruct the heights but use the previously cached height if the item id hasn't change
    */
			var row_heights = {};
			var l = items.length;

			for (var i = 0; i < l; i++) {
				var id = _this.getItemID(items[i]);
				var height = prev_row_heights[id];

				row_heights[id] = height !== undefined ? height : _this.props.initialHeight;
			}

			return row_heights;
		};

		_this.getRenderedRows = function () {
			var scroll_top = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var view_port_size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 600;
			var allowance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
			var row_heights = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
			var items = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

			var lower = scroll_top - allowance;
			var upper = scroll_top + view_port_size + allowance;
			var rendered_rows = {};
			var sum = 0;

			_this.first_rendered_row_index = null;

			for (var i = 0, l = items.length; i < l; i++) {
				var id = _this.getItemID(items[i]);
				var row_height = row_heights[id];
				var before = sum; // primitives are copied by value

				sum += row_height;

				// Renders all rows within the viewport + extras outside the viewport
				var within_limit = sum > lower && sum < upper;

				// if adding the next value burst the upper limit
				// but not adding it causes our scroll_top to be less than sum accumulated
				// then add it anyway
				// otherwise we will see a large unrendered chunk
				var burst_limit = sum > upper && before < scroll_top + view_port_size;

				if (within_limit || burst_limit) {
					rendered_rows[id] = 1;

					if (_this.first_rendered_row_index === null) {
						_this.first_rendered_row_index = i;
					}
				}
			}

			return rendered_rows;
		};

		_this.stickBottom = function () {
			/*
    * The base idea of the stick bottom algorithm works like this:
    *
    * If we are at the bottom of the container, any updates will trigger new stick bottom
    *
    * The stick bottom algorithm works on 3 parts:
    *
    * 1) stickBottom function will set stop_measuring to false.
    *    This stops the cell measuring from happening and resizing rows,
    *    because this will affect the scrollBottom position
    *
    * 2) The onScroll handler will mark the container with a at_bottom flag.
    *    It does that by checking whether we are at the bottom.
    *    This can be done reliably since rows stop resizing after stickBottom is called.
    *    Only after setting the at_bottom flag do we reset stop_measuring to false.
    *
    * 3) the cell measuring interval will then trigger stickBottom only if at_bottom is true
    */

			var node = _this.refs.container;

			if (!node) return;

			if (node.scrollHeight > node.clientHeight) {
				_this.stop_measuring = true;

				node.scrollTop = 1000000000;
			} else {
				_this.stop_measuring = false;
			}
		};

		_this.isAboveBottomThreshold = function () {
			var scroll_bottom = _this.getScrollBottom();

			return scroll_bottom > _this.props.scrollBottomThreshold;
		};

		_this.state = _this.recomputeState({}, props.items);
		return _this;
	}

	_createClass(VContainer, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.prev_scroll_top = 0;
			this.stop_measuring = false;

			if (this.props.stickBottom) {
				this.stickBottom();
			}

			this.sensor = this.createResizeSensor();

			if (this.props.containerDidMount) this.props.containerDidMount();
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(next_props) {
			var _this2 = this;

			if (this.hasItemsChanged(next_props.items, this.props.items)) {
				(function () {
					// if items has changed, we need to recompute the internal state of heights and rendered rows
					// when new items are added or deleted
					// we will use the cache of row_heights for old items

					var state = _this2.recomputeState(_this2.state.row_heights, next_props.items);

					// when the component mounts, it will always be at the bottom unless the user scroll up
					// this threshold ensures that we scroll down on updates only when the user has not scrolled beyond a threshold
					var is_below_threshold = !_this2.isAboveBottomThreshold();

					_this2.setState(state, function () {
						if (is_below_threshold && _this2.props.stickBottom) {
							_this2.stickBottom();
						}
					});
				})();
			}
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			if (this.props.containerWillUnmount) this.props.containerWillUnmount();

			this.removeSensor(this.sensor);
			window.cancelAnimationFrame(this.rafID);
		}
	}, {
		key: 'render',
		value: function render() {
			return _react2.default.createElement(
				'div',
				{
					style: this.props.style,
					className: this.props.className,
					ref: 'container',
					onScroll: this.onScroll,
					id: 'vscroll-container'
				},
				this.virtualRenderItems(),
				this.at_bottom === false && this.props.renderIfNotBottom && this.props.renderIfNotBottom()
			);
		}
	}, {
		key: 'setRenderedRows',
		value: function setRenderedRows(scroll_top) {
			/*
    * Determine which rows to render:
    * Get current scrollTop position, and use that as an allowance value to subtract row heights
    * We keep rendering rows until we exceed that allowance value or we hit the max rows count
    */

			this.setState({
				rendered_rows: this.getRenderedRows(scroll_top, window.innerHeight, this.props.allowance, this.state.row_heights, this.props.items)
			});
		}
	}, {
		key: 'recomputeState',
		value: function recomputeState(prev_row_heights, items) {
			/*
    * Takes a dictionary of cached row heights, and items
    * then recompute the items to be rendered
    */

			var row_heights = this.getRowHeights(prev_row_heights, items);

			if (this.props.stickBottom && !this.prev_scroll_top) {
				// if we are sticking to the bottom (ie. chat log)
				// render from the bottom (get rows at the bottom by supply container height as prev_scroll_top)
				this.prev_scroll_top = this.calculateContainerHeight(row_heights);
			}

			var rendered_rows = this.getRenderedRows(this.prev_scroll_top, window.innerHeight, this.props.allowance, row_heights, items);

			return {
				row_heights: row_heights,
				rendered_rows: rendered_rows
			};
		}
	}, {
		key: 'calculateContainerHeight',
		value: function calculateContainerHeight(row_heights) {
			var row_heights_arr = Object.keys(row_heights);

			return row_heights_arr.reduce(function (total, id) {
				return total + row_heights[id];
			}, 0);
		}
	}, {
		key: 'correctScrollPosition',
		value: function correctScrollPosition(height_delta) {
			/*
    * When we are scrolling down,
    * element heights are being reported by components below the viewport.
    * When their heights change, content will be pushed DOWN. Therefore there isn't a need to change the scroll position.
    * However when we are scrolling up,
    * element heights are being reported by components ABOVE the viewport.
    * Any change in height of those elements will potentially push the viewport down, which is undesirable.
    * That's why we are only applying scrollTop correction when scrolling up.
    */

			if (this.scrolling_up) {
				this.prevent_scroll = true;
				this.refs.container.scrollTop = this.refs.container.scrollTop + height_delta;
			}
		}
	}, {
		key: 'getScrollBottom',
		value: function getScrollBottom() {
			var node = this.refs.container;

			if (!node) return 0;

			return node.scrollHeight - node.scrollTop - node.clientHeight;
		}
	}, {
		key: 'getItemID',
		value: function getItemID(item) {
			return (0, _isPlainObject2.default)(item) ? item.id : item;
		}
	}, {
		key: 'virtualRenderItems',
		value: function virtualRenderItems() {
			var _this3 = this;

			// render real rows and fake rows
			var items = this.props.items;
			var _state = this.state,
			    row_heights = _state.row_heights,
			    rendered_rows = _state.rendered_rows;


			var rows = [];
			var top_spacer_height = 0;
			var bottom_spacer_height = 0;

			items.forEach(function (item, index) {
				var id = _this3.getItemID(item);

				if (rendered_rows[id]) {
					// grab the reported height in row_heights, if not then use the initial height
					rows.push(_react2.default.createElement(
						_VItem2.default,
						{ height: row_heights[id], id: id, key: id, ref: id },
						_this3.props.renderItem(item, index)
					));
				} else {
					/* if current index is less than first item in list, add to top spacer
      * otherwise add to the bottom spacer
      */

					if (index < _this3.first_rendered_row_index) {
						top_spacer_height += row_heights[id];
					} else {
						bottom_spacer_height += row_heights[id];
					}
				}
			});

			// add spacers
			rows.unshift(_jsx('div', {
				style: { height: top_spacer_height }
			}, 'top_spacer'));
			rows.push(_jsx('div', {
				style: { height: bottom_spacer_height }
			}, 'bottom_spacer'));

			return rows;
		}
	}, {
		key: 'createResizeSensor',
		value: function createResizeSensor() {
			var _this4 = this;

			return setInterval(function () {
				if (_this4.stop_measuring) return;

				var _state2 = _this4.state,
				    row_heights = _state2.row_heights,
				    rendered_rows = _state2.rendered_rows;

				var rendered_rows_arr = Object.keys(rendered_rows);
				var total_delta = 0;
				var row_changed = false;

				rendered_rows_arr.forEach(function (id) {
					var node = _this4.refs[id];

					if (!node) return;

					var old_height = row_heights[id];
					var new_height = node.getHeight();
					var delta = new_height - old_height;

					if (delta !== 0) {
						row_heights[id] = new_height;
						total_delta += delta;
						row_changed = true;
					}
				});

				if (row_changed) {
					_this4.setState({
						row_heights: row_heights
					}, function () {
						_this4.correctScrollPosition(total_delta);

						if (_this4.at_bottom) {
							_this4.stickBottom();
						}
					});
				}
			}, 30);
		}
	}, {
		key: 'hasItemsChanged',
		value: function hasItemsChanged(next_items, curr_items) {
			if (next_items.length !== curr_items.length) return true;

			for (var i = next_items.length - 1; i >= 0; i--) {
				if (next_items[i] !== curr_items[i]) {
					return true;
				}
			}

			return false;
		}
	}, {
		key: 'removeSensor',
		value: function removeSensor(sensor) {
			clearInterval(sensor);
		}
	}]);

	return VContainer;
}(_react.Component), _class.propTypes = {
	initialHeight: _react.PropTypes.number.isRequired,
	items: _react.PropTypes.array.isRequired,
	renderItem: _react.PropTypes.func.isRequired,
	className: _react.PropTypes.string,
	style: _react.PropTypes.object,
	// No. of pixels above the bottom, if new items are added then we should scroll to the bottom
	scrollBottomThreshold: _react.PropTypes.number,
	containerDidMount: _react.PropTypes.func,
	containerWillUnmount: _react.PropTypes.func,
	stickBottom: _react.PropTypes.bool,
	allowance: _react.PropTypes.number,
	renderIfNotBottom: _react.PropTypes.func
}, _class.defaultProps = {
	items: [],
	className: '',
	style: {},
	scrollBottomThreshold: 150,
	stickBottom: true
}, _temp);
exports.default = VContainer;