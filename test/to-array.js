'use strict';

var tsu = require('..');
var test = require('tape');
var concatStream = require('concat-stream');

// tsu.toArray(opts, cb)

test('default `opts`', function(t) {
  t.plan(2);
  var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
  var toArray = tsu.toArray(function(xs) {
    t.looseEqual(xs, ['x', 'y']);
    this.push('foo');
  });
  var concat = concatStream(function(x) {
    t.looseEqual(x, 'foo');
  });
  stream.pipe(toArray).pipe(concat);
});

test('with `opts.toString` set to `false`', function(t) {
  t.plan(2);
  var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
  var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
    t.looseEqual(xs, [new Buffer('x'), new Buffer('y')]);
    this.push('foo');
  });
  var concat = concatStream(function(x) {
    t.looseEqual(x, 'foo');
  });
  stream.pipe(toArray).pipe(concat);
});
