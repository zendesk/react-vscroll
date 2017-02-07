'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Wraps an item and reports the height of the row
 * It reports new heights for items that contain loading nodes (see below)
 */
var VItem = (_temp = _class = function (_Component) {
	_inherits(VItem, _Component);

	function VItem() {
		_classCallCheck(this, VItem);

		return _possibleConstructorReturn(this, (VItem.__proto__ || Object.getPrototypeOf(VItem)).apply(this, arguments));
	}

	_createClass(VItem, [{
		key: 'render',
		value: function render() {
			var style = {
				height: this.props.height,
				width: '100%'
			};

			var children_style = {
				width: '100%',
				/*
     * ref: http://stackoverflow.com/questions/19718634/how-to-disable-margin-collapsing
     * Neat trick to disable margin collapsing that has no visual impact
     * The padding is no longer 0 so collapsing won't occur anymore and the padding is less than 0.5px
     * so visually it will round down to 0.
     *
    */
				padding: '0.1px'
			};

			/*
    * vitem mirrors the height of measured vitem_children
    * this allows us to set an initial container height before transforming to the real height
    */

			return _react2.default.createElement(
				'div',
				{ ref: 'vitem', style: style },
				_react2.default.createElement(
					'div',
					{ ref: 'vitem_children', style: children_style },
					this.props.children
				)
			);
		}
	}, {
		key: 'getHeight',
		value: function getHeight() {
			return this.refs.vitem_children.getBoundingClientRect().height;
		}
	}]);

	return VItem;
}(_react.Component), _class.propTypes = {
	id: _react.PropTypes.string.isRequired,
	height: _react.PropTypes.number.isRequired,
	children: _react.PropTypes.node.isRequired
}, _temp);
exports.default = VItem;