import React from 'react';
import VContainer from 'VContainer';
import VItem from 'VItem';
import { mount } from 'enzyme';

function makeId(_, index) {
	return `id:${ index }`;
}

function mountWrapper(height, count, stickBottom) {
	const items = [...new Array(count)].map(makeId); // eslint-disable-line

	return mount(
		<VContainer
			initialHeight={ height }
			items={ items }
			renderItem={ function(item) {
				return <div>{ item }</div>;
			} }
			stickBottom={ stickBottom }
		/>
	);
}

describe('VContainer', function() {
	const ROW_HEIGHT = 80;
	const ROW_COUNT = 1000;

	describe('when stickBottom is true', function() {
		beforeEach(function() {
			this.wrapper = mountWrapper(ROW_HEIGHT, ROW_COUNT, true);
		});

		afterEach(function() {
			this.wrapper = null;
		});

		it('renders only a partial list', function() {
			expect(this.wrapper.find(VItem).length).not.toBe(0);
			expect(this.wrapper.find(VItem).length).toBeLessThan(ROW_COUNT);
		});

		it('renders from the back', function() {
			const first_id = makeId(null, 0);
			const last_id = makeId(null, ROW_COUNT - 1);

			expect(this.wrapper.find(VItem).first().prop('id')).not.toBe(first_id);
			expect(this.wrapper.find(VItem).last().prop('id')).toBe(last_id);
		});
	});

	describe('when stickBottom is false', function() {
		beforeEach(function() {
			this.wrapper = mountWrapper(ROW_HEIGHT, ROW_COUNT, false);
			this.first_id = makeId(null, 0);
			this.last_id = makeId(null, ROW_COUNT - 1);

			jest.useFakeTimers();
		});

		afterEach(function() {
			this.wrapper = null;
			this.first_id = null;
			this.last_id = null;

			jest.useRealTimers();
		});

		it('renders from the front', function() {
			expect(this.wrapper.find(VItem).first().prop('id')).toBe(this.first_id);
			expect(this.wrapper.find(VItem).last().prop('id')).not.toBe(this.last_id);
		});

		it('renders rows in the middle when we scroll to the center', function() {
			const spy = jest.fn();
			const instance = this.wrapper.instance();
			const oldOnScroll = instance.onScroll;
			const scrollPosition = ROW_COUNT * ROW_HEIGHT / 2;

			function onScroll() {
				spy();
				oldOnScroll();
			}

			instance.onScroll = onScroll;

			this.wrapper.update();

			// this 2 lines simulate scrolling to a specified location
			instance.refs.container.scrollTop = scrollPosition;
			this.wrapper.simulate('scroll', { });

			jest.runAllTimers();
			expect(spy).toHaveBeenCalled();
			expect(this.wrapper.find(VItem).first().prop('id')).not.toBe(this.first_id);
			expect(this.wrapper.find(VItem).last().prop('id')).not.toBe(this.last_id);
		});
	});
});
