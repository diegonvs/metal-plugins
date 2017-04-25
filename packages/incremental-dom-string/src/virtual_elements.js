/**
 * A noop function that can be used when no
 * callback function is passed to patch
 * @const
 */
const noop = function() {};

/**
 * The offset in the virtual element declaration where the attributes are
 * specified.
 * @const
 */
const ATTRIBUTES_OFFSET = 3;

/**
 * An array used to store the strings generated by calls to
 * elementOpen, elementOpenStart, elementOpenEnd, elementEnd and elementVoid
 */
let buffer_ = [];

/**
 * A string used to print the current output
 */
let output_ = '';

/**
 * A counter to keep track of the nesting level when generating DOM strings.
 */
let nestingCount_ = 1;

/**
 * Pushes an element in the buffer.
 *
 * @param {string} token The string to push into the buffer.
 * @param {boolean} close A flag indicating if the buffer should be flushed.
 * @return {void} Nothing.
 */
const push_ = function(token, close = false) {
  buffer_.push(token);

  if (close) {
    output_ = buffer_.join('');
    buffer_ = [];
  }
};

/**
 * Returns the constructred DOM string at this point.
 *
 * @param {!Boolean} flush Should the string be flushed.
 * @return {string} The constructed DOM string.
 */
const getOutput = function(flush = false) {
  output_ = flush ? '' : output_;
  return output_;
};

/***
 * Defines a virtual attribute at this point of the DOM. This is only valid
 * when called between elementOpenStart and elementOpenEnd.
 *
 * @param {string} name The attribute's name.
 * @param {*} value The attribute's value.
 * @return {void} Nothing.
 */
const attr = function(name, value) {
  push_(` ${name}="${value}"`);
};

/**
 * Closes an open virtual Element.
 *
 * @param {string} The Element's tag.
 * @return {void} Nothing.
 */
const elementClose = function(nameOrCtor) {
  let close = false;
  nestingCount_--;
  if (nestingCount_ === 1) {
    close = true;
  }
  push_(`</${nameOrCtor}>`, close);
};

/**
 * Declares a virtual Element at the current location in the document that has
 * no children.
 *
 * @param {string} The Element's tag or constructor.
 * @param {?string=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
 *     static attributes for the Element. These will only be set once when the
 *     Element is created.
 * @param {...*} var_args Attribute name/value pairs of the dynamic attributes
 *     for the Element.
 * @return {void} Nothing.
 */
const elementVoid = function(nameOrCtor, key, statics, var_args) {
  elementOpen.apply(null, arguments);
  return elementClose(nameOrCtor);
};

/**
 * @param {!string} nameOrCtor The Element's tag or constructor.
 * @param {?string=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
 *     static attributes for the Element. These will only be set once when the
 *     Element is created.
 * @param {...*} var_args, Attribute name/value pairs of the dynamic attributes
 *     for the Element.
 * @return {void} Nothing.
 */
const elementOpen = function(nameOrCtor, key, statics, var_args) {
  elementOpenStart(nameOrCtor, key, statics);

  let i = ATTRIBUTES_OFFSET;
  let j = 0;

  for (; i < arguments.length; i += 2, j += 2) {
    const name = arguments[i];
    const value = arguments[i + 1];
    attr(name, value);
  }

  return elementOpenEnd();
};

/**
 * Closes an open tag started with elementOpenStart.
 *
 * @return {void} Nothing.
 */
const elementOpenEnd = function() {
  push_('>');
  nestingCount_++;
};

/**
 * Declares a virtual Element at the current location in the document. This
 * corresponds to an opening tag and a elementClose tag is required. This is
 * like elementOpen, but the attributes are defined using the attr function
 * rather than being passed as arguments. Must be folllowed by 0 or more calls
 * to attr, then a call to elementOpenEnd.
 * @param {string} nameOrCtor The Element's tag or constructor.
 * @param {?string=} key The key used to identify this element. This can be an
 *     empty string, but performance may be better if a unique value is used
 *     when iterating over an array of items.
 * @param {?Array<*>=} statics An array of attribute name/value pairs of the
 *     static attributes for the Element. These will only be set once when the
 *     Element is created.
 * @return {void} Nothing.
 */
const elementOpenStart = function(nameOrCtor, key, statics) {
  push_(`<${nameOrCtor}`);
  if (statics) {
    for (let i = 0; i < statics.length; i += 2) {
      const name = /** @type {string} */(statics[i]);
      const value = statics[i + 1];
      attr(name, value);
    }
  }
};

/**
 * Patches an Element with the the provided function. Exactly one top level
 * element call should be made corresponding to `node`.
 *
 * @param {?object} node The Element where the patch should start.
 * @param {!function(T)} fn A function containing open/close/etc. calls that
 *     describe the DOM. This should have at most one top level element call.
 * @param {T=} data An argument passed to fn to represent DOM state.
 * @return {void} Nothing.
 */
const patch = function(node, description, data) {
  const fn = typeof description === 'function' ? description : noop;

  if (typeof node === 'function') {
    node(() => fn(data));
  } else {
    fn(data);
  }

  const output = getOutput();
  buffer_ = [];
  output_ = '';

  if (Object.prototype.hasOwnProperty.call(node, 'innerHTML')) {
    node.innerHTML = output;
  }
};

const patchOuter = patch;
const patchInner = patch;

/**
 * Declares a virtual Text at this point in the document.
 *
 * @param {string|number|boolean} value The value of the Text.
 * @param {...(function((string|number|boolean)):string)} var_args
 *     Functions to format the value which are called only when the value has
 *     changed.
 *
 * @return {void} Nothing.
 */
const text = function(value, var_args) {
  let formatted = value;
  for (let i = 1; i < arguments.length; i += 1) {
    const fn = arguments[i];
    formatted = fn(formatted);
  }
  push_('' + formatted);
};

export {
  attr,
  elementClose,
  elementOpen,
  elementOpenEnd,
  elementOpenStart,
  elementVoid,
  getOutput,
  patch,
  patchInner,
  patchOuter,
  text
};
