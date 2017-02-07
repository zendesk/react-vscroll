import React from 'react';
import VItem from 'VItem';
import { mount } from 'enzyme';

describe('VItem', () => {
	beforeEach(function() {
		this.height = 80;

		// jest environment shows 0 for all client rect values
		// so we need to mock this method
		// ref: http://stackoverflow.com/questions/38656541/change-element-size-using-jest
		// Maybe we need to use karma for real browser testing?
		Element.prototype.getBoundingClientRect = jest.fn(() => {
			return {
				height: this.height
			};
		});

		this.wrapper = mount(
			<VItem id='1' height={ this.height }>
				<div>text</div>
			</VItem>
		);
	});

	it('renders', function() {
		expect(this.wrapper.childAt(0)).not.toBe(null);
	});

	it('returns height', function() {
		expect(this.wrapper.instance().getHeight()).toBe(this.height);
	});
});
