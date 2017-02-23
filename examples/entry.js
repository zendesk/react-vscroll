import React, { Component } from 'react';
import { render, findDOMNode } from 'react-dom';
import { List } from 'react-virtualized';

const sample_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras posuere massa non suscipit suscipit. Nullam nisl massa, pretium vel ligula a, auctor mollis velit. Vivamus volutpat eu nulla ac pellentesque. Aliquam leo tortor, congue vitae mattis nec, sagittis non elit. Maecenas suscipit non elit eu ultrices. Maecenas sodales nec orci sit amet tristique. Nulla porttitor, magna a dignissim vestibulum, eros libero sodales ante, ultrices euismod justo augue pellentesque quam. Integer vitae nunc nec nisi ullamcorper dignissim. Nulla sodales sem id arcu interdum, consequat imperdiet odio vehicula. Sed et vulputate diam, ut vestibulum urna. Suspendisse commodo venenatis purus nec ultrices. Praesent velit neque, aliquet non urna viverra, ornare egestas diam. Nulla sapien tortor, rutrum vel tempus a, semper vel metus.';

class Image extends Component {
	render() {
		return <img src={ this.props.src } />;
	}
}

class Text extends Component {
	render() {
		return (
			<div>{ this.props.text }</div>
		);
	}
}

class Iframe extends Component {
	render() {
		return (
			<iframe src='http://example.com/' height='200' width='300' />
		);
	}
}

const items = [...Array(1000).keys()].map(function(item, index) {
	const roll = Math.random();

	if (roll < 0.5) {
		const height = Math.floor(Math.random() * 100 + 20);

		return {
			type: 'image',
			id: `${ item }`, // id must be a string
			src: `http://lorempixel.com/100/${ height }/`
		};
	}
	else if (roll >= 0.5 && roll < 0.9) {
		const slice_index = Math.floor(Math.random() * 800);

		return {
			type: 'text',
			id: `${ item }`, // id must be a string
			text: sample_text.slice(0, slice_index)
		};
	}
	else {
		return {
			type: 'iframe',
			id: `${ item }`, // id must be a string
		};
	}
});

let list_ref, last_total_height;
const refs = {}, heights = {};
const getRowHeight = ({ index }) => {
	const node = refs[index];

	if (node) {
		const dom = findDOMNode(node);
		const height = dom.getBoundingClientRect().height;

		if (height !== heights[index]) {
			heights[index] = height;
		}

		return height;
	}

	return 40;
}

setInterval(() => {
	if (list_ref) {
		const total_height = Object.values(heights).reduce((v, acc) => acc + v, 0);
		// recomputeRowHeights is quite expensive
		// thus we only call it when total height has changed
		if (total_height !== last_total_height) {
			list_ref.recomputeRowHeights();
		}
	}
}, 30);

render(
	<List
		ref={ ref => list_ref = ref }
		height={ window.innerHeight }
		width={ window.innerWidth }
		rowCount={ items.length }
		rowHeight={ getRowHeight }
		rowRenderer ={ function({ key, index, isScrolling, isVisible, style }) {
			const item = items[index];

			// HACK
			// CellRenderer will set width to 100% if it's writable
			// but our items have dynamic width, thus we don't want them to be stretched
			if (style) {
				Object.defineProperty(style, 'width', {
					writable: false,
					value: 'auto'
				});
			}

			switch (item.type) {
				case 'image':
					return (
						<div style={ style } key={ key }>
							<Image ref={ ref => refs[index] = ref } src={ item.src } />
						</div>
					);
				case 'text':
					return (
						<div style={ style } key={ key }>
							<Text ref={ ref => refs[index] = ref } text={ item.text } />
						</div>
					);
				case 'iframe':
					return (
						<div style={ style } key={ key }>
							<Iframe ref={ ref => refs[index] = ref } />
						</div>
					);
				default:
					return null;
			}
		} }
	/>,
	document.getElementById('app')
);
