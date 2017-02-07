import React, { Component, PropTypes } from 'react';
import VItem from './VItem';
import isPlainObject from 'lodash/isPlainObject';

class VContainer extends Component {
	static propTypes = {
		initialHeight: PropTypes.number.isRequired,
		items: PropTypes.array.isRequired,
		renderItem: PropTypes.func.isRequired,
		className: PropTypes.string,
		style: PropTypes.object,
		// No. of pixels above the bottom, if new items are added then we should scroll to the bottom
		scrollBottomThreshold: PropTypes.number,
		containerDidMount: PropTypes.func,
		containerWillUnmount: PropTypes.func,
		stickBottom: PropTypes.bool,
		allowance: PropTypes.number,
		renderIfNotBottom: PropTypes.func
	};

	static defaultProps = {
		items: [],
		className: '',
		style: {},
		scrollBottomThreshold: 150,
		stickBottom: true
	};

	constructor(props) {
		super(props);

		this.state = this.recomputeState({}, props.items);
	}

	componentDidMount() {
		this.prev_scroll_top = 0;
		this.stop_measuring = false;

		if (this.props.stickBottom) {
			this.stickBottom();
		}

		this.sensor = this.createResizeSensor();

		if (this.props.containerDidMount) this.props.containerDidMount();
	}

	componentWillReceiveProps(next_props) {
		if (this.hasItemsChanged(next_props.items, this.props.items)) {
			// if items has changed, we need to recompute the internal state of heights and rendered rows
			// when new items are added or deleted
			// we will use the cache of row_heights for old items

			const state = this.recomputeState(this.state.row_heights, next_props.items);

			// when the component mounts, it will always be at the bottom unless the user scroll up
			// this threshold ensures that we scroll down on updates only when the user has not scrolled beyond a threshold
			const is_below_threshold = !this.isAboveBottomThreshold();

			this.setState(state, () => {
				if (is_below_threshold && this.props.stickBottom) {
					this.stickBottom();
				}
			});
		}
	}

	componentWillUnmount() {
		if (this.props.containerWillUnmount) this.props.containerWillUnmount();

		this.removeSensor(this.sensor);
		window.cancelAnimationFrame(this.rafID);
	}

	onScroll = () => {
		this.stop_measuring = false;

		if (this.prevent_scroll) {
			this.prevent_scroll = false;
			return;
		}

		this.rafID = window.requestAnimationFrame(() => {
			const target = this.refs.container;
			let scroll_bottom = this.getScrollBottom();
			let scroll_top = target.scrollTop;

			// TODO: we do not know whether it will always be 1px above the bottom
			// Firefox, Safari appears to be at 0 correctly, while chrome is 1

			if (scroll_bottom <= 1) {
				scroll_top += scroll_bottom;
				scroll_bottom = 0;
			}

			this.scrolling_up = this.prev_scroll_top - scroll_top > 0;

			this.at_bottom = scroll_bottom === 0;

			this.prev_scroll_top = scroll_top;

			this.setRenderedRows(scroll_top);
		});
	}

	render() {
		return (
			<div
				style={ this.props.style }
				className={ this.props.className }
				ref='container'
				onScroll={ this.onScroll }
				id='vscroll-container'
			>
				{ this.virtualRenderItems() }
				{ this.at_bottom === false &&
					this.props.renderIfNotBottom &&
					this.props.renderIfNotBottom()
				}
			</div>
		);
	}

	setRenderedRows(scroll_top) {
		/*
		 * Determine which rows to render:
		 * Get current scrollTop position, and use that as an allowance value to subtract row heights
		 * We keep rendering rows until we exceed that allowance value or we hit the max rows count
		 */

		this.setState({
			rendered_rows: this.getRenderedRows(
				scroll_top,
				window.innerHeight,
				this.props.allowance,
				this.state.row_heights,
				this.props.items
			)
		});
	}

	recomputeState(prev_row_heights, items) {
		/*
		 * Takes a dictionary of cached row heights, and items
		 * then recompute the items to be rendered
		 */

		const row_heights = this.getRowHeights(prev_row_heights, items);

		if (this.props.stickBottom && !this.prev_scroll_top) {
			// if we are sticking to the bottom (ie. chat log)
			// render from the bottom (get rows at the bottom by supply container height as prev_scroll_top)
			this.prev_scroll_top = this.calculateContainerHeight(row_heights);
		}

		const rendered_rows = this.getRenderedRows(this.prev_scroll_top, window.innerHeight, this.props.allowance, row_heights, items);

		return {
			row_heights,
			rendered_rows
		};
	}

	calculateContainerHeight(row_heights) {
		const row_heights_arr = Object.keys(row_heights);

		return row_heights_arr.reduce(function(total, id) {
			return total + row_heights[id];
		}, 0);
	}

	getRowHeights = (prev_row_heights = {}, items) => {
		/*
		 * We reconstruct the heights but use the previously cached height if the item id hasn't change
		 */
		const row_heights = {};
		const l = items.length;

		for (let i = 0; i < l; i++) {
			const id = this.getItemID(items[i]);
			const height = prev_row_heights[id];

			row_heights[id] = height !== undefined ? height : this.props.initialHeight;
		}

		return row_heights;
	}

	getRenderedRows = (scroll_top = 0, view_port_size = 600, allowance = 1000, row_heights = {}, items = []) => {
		const lower = scroll_top - allowance;
		const upper = scroll_top + view_port_size + allowance;
		const rendered_rows = {};
		let sum = 0;

		this.first_rendered_row_index = null;

		for (let i = 0, l = items.length; i < l; i++) {
			const id = this.getItemID(items[i]);
			const row_height = row_heights[id];
			const before = sum; // primitives are copied by value

			sum += row_height;

			// Renders all rows within the viewport + extras outside the viewport
			const within_limit = sum > lower && sum < upper;

			// if adding the next value burst the upper limit
			// but not adding it causes our scroll_top to be less than sum accumulated
			// then add it anyway
			// otherwise we will see a large unrendered chunk
			const burst_limit = sum > upper && before < (scroll_top + view_port_size);

			if (within_limit || burst_limit) {
				rendered_rows[id] = 1;

				if (this.first_rendered_row_index === null) {
					this.first_rendered_row_index = i;
				}
			}
		}

		return rendered_rows;
	}

	stickBottom = () => {
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

		const node = this.refs.container;

		if (!node) return;

		if (node.scrollHeight > node.clientHeight) {
			this.stop_measuring = true;

			node.scrollTop = 1000000000;
		}
		else {
			this.stop_measuring = false;
		}
	}

	correctScrollPosition(height_delta) {
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

	isAboveBottomThreshold = () => {
		const scroll_bottom = this.getScrollBottom();

		return scroll_bottom > this.props.scrollBottomThreshold;
	}

	getScrollBottom() {
		const node = this.refs.container;

		if (!node) return 0;

		return node.scrollHeight - node.scrollTop - node.clientHeight;
	}

	getItemID(item) {
		return isPlainObject(item) ? item.id : item;
	}

	virtualRenderItems() {
		// render real rows and fake rows
		const { items } = this.props;
		const { row_heights, rendered_rows } = this.state;

		const rows = [];
		let top_spacer_height = 0;
		let bottom_spacer_height = 0;

		items.forEach((item, index) => {
			const id = this.getItemID(item);

			if (rendered_rows[id]) {
				// grab the reported height in row_heights, if not then use the initial height
				rows.push(
					<VItem height={ row_heights[id] } id={ id } key={ id } ref={ id }>
						{ this.props.renderItem(item, index) }
					</VItem>
				);
			}
			else {
				/* if current index is less than first item in list, add to top spacer
				 * otherwise add to the bottom spacer
				 */

				if (index < this.first_rendered_row_index) {
					top_spacer_height += row_heights[id];
				}
				else {
					bottom_spacer_height += row_heights[id];
				}
			}
		});

		// add spacers
		rows.unshift(<div key='top_spacer' style={ { height: top_spacer_height } }></div>);
		rows.push(<div key='bottom_spacer' style={ { height: bottom_spacer_height } }></div>);

		return rows;
	}

	createResizeSensor() {
		return setInterval(() => {
			if (this.stop_measuring) return;

			const { row_heights, rendered_rows } = this.state;
			const rendered_rows_arr = Object.keys(rendered_rows);
			let total_delta = 0;
			let row_changed = false;

			rendered_rows_arr.forEach((id) => {
				const node = this.refs[id];

				if (!node) return;

				const old_height = row_heights[id];
				const new_height = node.getHeight();
				const delta = new_height - old_height;

				if (delta !== 0) {
					row_heights[id] = new_height;
					total_delta += delta;
					row_changed = true;
				}
			});

			if (row_changed) {
				this.setState({
					row_heights
				}, () => {
					this.correctScrollPosition(total_delta);

					if (this.at_bottom) {
						this.stickBottom();
					}
				});
			}
		}, 30);
	}

	hasItemsChanged(next_items, curr_items) {
		if (next_items.length !== curr_items.length) return true;

		for (let i = next_items.length - 1; i >= 0; i--) {
			if (next_items[i] !== curr_items[i]) {
				return true;
			}
		}

		return false;
	}

	removeSensor(sensor) {
		clearInterval(sensor);
	}
}

export default VContainer;
