# tsu [![npm Version](http://img.shields.io/npm/v/tsu.svg?style=flat)](https://www.npmjs.org/package/tsu) [![Build Status](https://img.shields.io/travis/yuanqing/tsu.svg?style=flat)](https://travis-ci.org/yuanqing/tsu) [![Coverage Status](https://img.shields.io/coveralls/yuanqing/tsu.svg?style=flat)](https://coveralls.io/r/yuanqing/tsu)

> Utilities and functional wrappers over [`through2`](https://github.com/rvagg/through2).

## API

```js
var tsu = require('tsu');
```

All methods take an optional `opts` object which is passed to the `stream.Transform`. `opts` take the following keys:
- `objectMode` &mdash; Defaults to `true`.
- `toString` &mdash; Defaults to `true`. Converts each [`Buffer`](https://nodejs.org/api/buffer.html#buffer_class_buffer) in the stream to a string. Set to `false` to disable this behaviour.

### Utilities

- [`source`](#tsusourceopts--x)
- [`through`](#tsuthroughopts--transform-flush)
- [`flush`](#tsuflushopts--cb)
- [`noop`](#tsunoopopts)
- [`toArray`](#tsutoarrayopts--cb)

### Functional

- [`each`](#tsueachopts--fn)
- [`map`](#tsumapopts--fn)
- [`filter`](#tsufilteropts--fn)
- [`fold`](#tsufoldopts--acc-fn-cb)
- [`sort`](#tsusortopts-compare)

Each functional method also has a `.ctor` method (eg. `tsu.sort.ctor`) that returns a *constructor* for the custom `stream.Transform`.

---

#### tsu.through([opts, ] transform, [flush])

Convenience method that returns a [through](https://github.com/rvagg/through2) stream.

<sup>[&#8617;](#api)</sup>

#### tsu.noop([opts])

Convenience method that returns a no-op through stream.

```js
var stream = tsu.noop();
```

<sup>[&#8617;](#api)</sup>

#### tsu.source([opts, ] x)

Returns a [`stream.Readable`](https://nodejs.org/docs/latest/api/stream.html#stream_class_stream_readable) containing the elements of `x` or that returned by `x`. `x` can be an object or array of objects. `x` can also be a function that returns an object or array of objects.

```js
var fromArray = tsu.source(['x', 'y', 'z']);

var fromFunction = tsu.source(function() {
  return ['x', 'y', 'z'];
});
```

<sup>[&#8617;](#api)</sup>

#### tsu.flush([opts, ] cb)

Returns a through stream where `transform` is a no-op, with the given `cb` called just before the stream ends. Call `this.push(chunk)` in `cb` to pass a chunk down the stream.

```js
var stream = tsu.source(['x', 'y', 'z']);
stream.pipe(tsu.flush(function() {
  this.push('foo');
})).pipe(tsu.toArray(function(arr) {
  console.log(arr);
  //=> [ 'x', 'y', 'z', 'foo' ]
}));
```

<sup>[&#8617;](#api)</sup>

#### tsu.toArray([opts, ] cb)

Accumulates all the items in the stream into an array, and calls `cb` with said array. The signature of `cb` is `(arr)`. Call `this.push(chunk)` in `cb` to pass a chunk down the stream.

```js
var stream = tsu.source(['x', 'y', 'z']);
stream.pipe(tsu.toArray(function(arr) {
  console.log(arr);
  //=> [ 'x', 'y', 'z' ]
}));
```

<sup>[&#8617;](#api)</sup>

#### tsu.each([opts, ] fn)

Calls `fn` with each item in the stream. The signature of `fn` is `(val, i)`. Call `this.push(chunk)` in `fn` to pass a chunk down the stream.

```js
var stream = tsu.source(['x', 'y', 'z']);
stream.pipe(tsu.each(function(val, i) {
  this.push(val); // pass `val` down the stream
  console.log(val, i);
  //=> 'x', 0
  //=> 'y', 1
  //=> 'z', 2
})).pipe(tsu.toArray(function(arr) {
  console.log(arr);
  //=> [ 'x', 'y', 'z' ]
}));
```

<sup>[&#8617;](#api)</sup>

#### tsu.map([opts, ] fn)

Calls `fn` with each item in the stream. The signature of `fn` is `(val, i)`. `fn` must return the value to which `val` is to be mapped. Call `this.push(chunk)` in `fn` to pass a chunk down the stream.

```js
var stream = tsu.source(['x', 'y', 'z']);
stream.pipe(tsu.map(function(val, i) {
  this.push('foo'); // pass 'foo' down the stream
  return i;         // map values to their indices
})).pipe(tsu.toArray(function(arr) {
  console.log(arr);
  //=> [ 'foo', 0, 'foo', 1, 'foo', 2 ]
}));
```

<sup>[&#8617;](#api)</sup>

#### tsu.filter([opts, ] fn)

Calls `fn` with each item in the stream. The signature of `fn` is `(val, i)`. `fn` must return a `falsy` value to remove `val` from the stream. Call `this.push(chunk)` in `fn` to pass a chunk down the stream.

```js
var stream = tsu.source(['x', 'y', 'z']);
stream.pipe(tsu.filter(function(val, i) {
  this.push('foo'); // pass 'foo' down the stream
  return i > 0;     // remove 'x' from the stream
})).pipe(tsu.toArray(function(arr) {
  console.log(arr);
  //=> [ 'foo', 'foo', 'y', 'foo', 'z' ]
}));
```

<sup>[&#8617;](#api)</sup>

#### tsu.fold([opts, ] acc, fn, cb)

Calls `fn` with the `acc` accumulator and each item in the stream. The signature of `fn` is `(acc, val, i)`. `fn` must return the new value of `acc`.

Calls `cb` with the final value of `acc`.

Call `this.push(chunk)` in `fn` or `cb` to pass a chunk down the stream.

```js
var stream = tsu.source(['x', 'y', 'z']);
stream.pipe(tsu.fold({}, function(acc, val, i) {
  this.push('foo'); // pass 'foo' down the stream
  acc[val] = i;     // key is `val`, value is `i`
  return acc;
}, function(acc) {
  this.push(acc);   // pass `acc` down the stream
  console.log(acc);
  //=> { x: 0, y: 1, z: 2 }
})).pipe(tsu.toArray(function(arr) {
  console.log(arr);
  //=> [ 'foo', 'foo', 'foo', { x: 0, y: 1, z: 2 } ]
}));
```

<sup>[&#8617;](#api)</sup>

#### tsu.sort([opts, compare])

Accumulates the items in the stream into an array, sorts the array using the `compare` function, before passing the sorted items back into the stream.

```js
var stream = tsu.source([1, 3, 2]);
stream.pipe(tsu.sort(function(x, y) {
  return x > y ? -1 : 1;
})).pipe(tsu.toArray(function(arr) {
  console.log(arr);
  //=> [ 3, 2, 1 ]
}));
```

<sup>[&#8617;](#api)</sup>

## Installation

Install via [npm](https://npmjs.com/):

```
$ npm i --save tsu
```

## Changelog

- 0.0.1
  - Initial release

## License

[MIT](LICENSE.md)
