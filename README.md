React VScroll
![repo-checks](https://github.com/zendesk/react-vscroll/workflows/repo-checks/badge.svg)
===

**A virtual scrolling container that supports dynamic child elements with heights that could change over time. ie. dynamic subtrees / images / iframes / etc.**

In most other implementations of virtual scrolling, rows are assumed to contain static information that won't change over time. This is problematic because in a highly dynamic real time system, rows could contain large subtrees that may await for data prior to rendering. This prevents most virtual scrollers from accurately determining a row height on mount. The same issues apply for loading images and iframes, which involves asynchronous asset loading and subsequent height change.

This virtual scroller takes into account of heights changing over time, and is designed to react and correct scroll positions when row heights change. Implementation of fake rows is similar to other approaches where we use a top and bottom spacer and only renders rows within the viewport + some configurable allowance.

## Installation

### In NPM

`npm install` this package and
```js
var vscroll = require('react-vscroll');
```

## Usage

```js
import { VContainer } from 'react-vscroll';

export default function Container() {
	return (
		<VContainer
			className={ 'a-container-class' }
			style={ { display: 'flex', flexDirection: 'column' } }
			items={ items }
			initialHeight={ 80 }
			scrollBottomThreshold={ 400 }
			stickBottom={ true }
			renderItem={ function(item){ return <div id={ item.id }>{ item.text }</div> } }
		/>
	)
}
```

## Demo

1. `git clone` this package and `npm install`.

2. `npm start`. This will run the example [here](/examples).

3. Browse to `http://localhost:5000`


## Configuration Options

#### Array `items`

Data for the list of items you want to virtual render.

#### Number `initialHeight`

The virtual scrolling algorithm works by assuming an initial height, then reactively applying height corrections over time.

#### Function `renderItem`

`renderItem` is passed args `(item)`, where item is the value obtained from iterating `items`

#### Number `scrollBottomThreshold`

Number of pixels from the bottom of the scroller where `stickBottom` will no longer work. This is useful for cases where we want to prevent a chat log from auto scrolling to the bottom if the user is viewing a past message somewhere at the top of the chat log.

#### String `className`

Standard `className` prop used for JSX components

#### Object `style`

Standard `style` prop used for JSX components

#### Function `renderIfNotBottom`

Use this function for conditionally rendering a component if the scroller is not at the bottom. This is useful for rendering floating buttons like "Scroll to bottom".

#### Bool `stickBottom`

Determines whether the chat log will attempt to stick to the bottom on mount / update. This is mostly useful for chat logs where the user is viewing chat messages from bottom to top.

#### Function `containerDidMount`

This allows you to specify hooks to run when the virtual scroller has been mounted.

#### Function `containerWillUnmount`

This allows you to specify hooks to run when the virtual scroller has been unmounted.

#### Number `allowance`

Controls the number of rows that are rendered outside the viewport.


## Contributing

Improvements are always welcome. Please follow these steps to contribute

1. For proposed changes, please [create a pull request](https://github.com/zendesk/react-vscroll/compare)

2. For bugs and feature requests, please [create an issue](https://github.com/zendesk/react-vscroll/issues/new)

### License

Use of this software is subject to important terms and conditions as set forth in the [LICENSE](LICENSE) file
