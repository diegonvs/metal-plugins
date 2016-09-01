'use strict';

import dom from 'metal-dom';
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';
import KeyboardFocusManager from '../src/KeyboardFocusManager';

class TestComponent extends Component {
	render() {
		IncrementalDOM.elementOpen('div');
		IncrementalDOM.elementVoid('button', null, null, 'ref', 'el0');
		IncrementalDOM.elementVoid('button', null, null, 'ref', 'el1');
		IncrementalDOM.elementVoid('button', null, null, 'ref', 'el2');
		IncrementalDOM.elementClose('div');
	}
}
TestComponent.RENDERER = IncrementalDomRenderer;

describe('KeyboardFocusManager', function() {
	let component;
	let manager;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
		if (manager) {
			manager.dispose();
		}
	});

	it('should focus previous element when the left arrow key is pressed', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();

		dom.triggerEvent(component.refs.el1, 'keyup', {
			keyCode: 37
		});
		assert.strictEqual(component.refs.el0, document.activeElement);
	});

	it('should focus previous element when the up arrow key is pressed', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();

		dom.triggerEvent(component.refs.el1, 'keyup', {
			keyCode: 38
		});
		assert.strictEqual(component.refs.el0, document.activeElement);
	});

	it('should not change focus when the left/up arrow keys are pressed on first element', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();

		const prevActiveElement = document.activeElement;
		dom.triggerEvent(component.refs.el0, 'keyup', {
			keyCode: 37
		});
		assert.strictEqual(prevActiveElement, document.activeElement);

		dom.triggerEvent(component.refs.el0, 'keyup', {
			keyCode: 38
		});
		assert.strictEqual(prevActiveElement, document.activeElement);
	});

	it('should focus next element when the right arrow key is pressed', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();

		dom.triggerEvent(component.refs.el0, 'keyup', {
			keyCode: 39
		});
		assert.strictEqual(component.refs.el1, document.activeElement);
	});

	it('should focus next element when the down arrow key is pressed', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();

		dom.triggerEvent(component.refs.el0, 'keyup', {
			keyCode: 40
		});
		assert.strictEqual(component.refs.el1, document.activeElement);
	});

	it('should not change focus when the right/down arrow keys are pressed on last element', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();

		const prevActiveElement = document.activeElement;
		dom.triggerEvent(component.refs.el2, 'keyup', {
			keyCode: 39
		});
		assert.strictEqual(prevActiveElement, document.activeElement);

		dom.triggerEvent(component.refs.el2, 'keyup', {
			keyCode: 40
		});
		assert.strictEqual(prevActiveElement, document.activeElement);
	});

	it('should not change focus when any non arrow keys are pressed', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();

		const prevActiveElement = document.activeElement;
		dom.triggerEvent(component.refs.el0, 'keyup', {
			keyCode: 10
		});
		assert.strictEqual(prevActiveElement, document.activeElement);
	});

	it('should not change focus when key is pressed on element without ref', function() {
		class TestComponentNoRef extends Component {
			render() {
				IncrementalDOM.elementOpen('div');
				IncrementalDOM.elementVoid('button');
				IncrementalDOM.elementVoid('button');
				IncrementalDOM.elementClose('div');
			}
		}
		TestComponentNoRef.RENDERER = IncrementalDomRenderer;

		component = new TestComponentNoRef();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();

		const prevActiveElement = document.activeElement;
		dom.triggerEvent(component.element.childNodes[0], 'keyup', {
			keyCode: 40
		});
		assert.strictEqual(prevActiveElement, document.activeElement);
	});

	it('should not change focus when key is pressed on element with ref outside expected format', function() {
		class TestComponentDifferentRef extends Component {
			render() {
				IncrementalDOM.elementOpen('div');
				IncrementalDOM.elementVoid('button', null, null, 'ref', 'button0');
				IncrementalDOM.elementVoid('button', null, null, 'ref', 'button1');
				IncrementalDOM.elementClose('div');
			}
		}
		TestComponentDifferentRef.RENDERER = IncrementalDomRenderer;

		component = new TestComponentDifferentRef();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();

		const prevActiveElement = document.activeElement;
		dom.triggerEvent(component.refs.button0, 'keyup', {
			keyCode: 40
		});
		assert.strictEqual(prevActiveElement, document.activeElement);
	});

	it('should not change focus when key is pressed on element that doesn\'t match the selector', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'li');
		manager.start();

		dom.triggerEvent(component.refs.el0, 'keyup', {
			keyCode: 40
		});
		assert.notStrictEqual(component.refs.el1, document.activeElement);
	});

	it('should change focus accordingly when key is pressed on any element when no selector is given', function() {
		class TestComponentNoSelector extends Component {
			render() {
				IncrementalDOM.elementOpen('div');
				IncrementalDOM.elementVoid('button', null, null, 'ref', 'el0');
				IncrementalDOM.elementVoid('li', null, null, 'ref', 'el1', 'tabindex', '0');
				IncrementalDOM.elementClose('div');
			}
		}
		TestComponentNoSelector.RENDERER = IncrementalDomRenderer;

		component = new TestComponentNoSelector();
		manager = new KeyboardFocusManager(component);
		manager.start();

		dom.triggerEvent(component.refs.el0, 'keyup', {
			keyCode: 40
		});
		assert.strictEqual(component.refs.el1, document.activeElement);
	});

	it('should not change focus when key is pressed before starting the manager', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');

		dom.triggerEvent(component.refs.el0, 'keyup', {
			keyCode: 40
		});
		assert.notStrictEqual(component.refs.el1, document.activeElement);
	});

	it('should not change focus when key is pressed after stopping the manager', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();
		manager.stop();

		dom.triggerEvent(component.refs.el0, 'keyup', {
			keyCode: 40
		});
		assert.notStrictEqual(component.refs.el1, document.activeElement);
	});

	it('should focus next elements correctly even if "start" is called more than once', function() {
		component = new TestComponent();
		manager = new KeyboardFocusManager(component, 'button');
		manager.start();
		manager.start();

		dom.triggerEvent(component.refs.el1, 'keyup', {
			keyCode: 37
		});
		assert.strictEqual(component.refs.el0, document.activeElement);
	});
});
