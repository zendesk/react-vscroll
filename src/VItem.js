import React, { Component, PropTypes } from 'react';

/**
 * Wraps an item and reports the height of the row
 * It reports new heights for items that contain loading nodes (see below)
 */
class VItem extends Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
		height: PropTypes.number.isRequired,
		children: PropTypes.node.isRequired
	};

	render() {
		const style = {
			height: this.props.height,
			width: '100%'
		};

		const children_style = {
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

		return (
			<div ref='vitem' style={ style }>
				<div ref='vitem_children' style={ children_style }>
					{ this.props.children }
				</div>
			</div>
		);
	}

	getHeight() {
		return this.refs.vitem_children.getBoundingClientRect().height;
	}
}

export default VItem;
