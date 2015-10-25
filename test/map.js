'use strict';

var tsu = require('..');
var test = require('tape');

// tsu.map(opts, fn)

test('default `opts`', function(t) {
  t.plan(1);
  var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
  var filter = tsu.map(function(x, i) {
    this.push('foo');
    return [x, i];
  });
  var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
    t.looseEqual(xs, ['foo', ['x', 0], 'foo', ['y', 1]]);
  });
  stream.pipe(filter).pipe(toArray);
});

test('with `opts.toString` set to `false`', function(t) {
  t.plan(1);
  var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
  var filter = tsu.map({ castBuffers: false }, function(x, i) {
    this.push('foo');
    return [x, i];
  });
  var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
    t.looseEqual(xs, ['foo', [new Buffer('x'), 0], 'foo', [new Buffer('y'), 1]]);
  });
  stream.pipe(filter).pipe(toArray);
});
