'use strict';

var tsu = require('..');
var test = require('tape');

// tsu.filter(opts, fn)

test('default `opts`', function(t) {
  t.plan(1);
  var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
  var filter = tsu.filter(function(x, i) {
    this.push('foo');
    return i === 0;
  });
  var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
    t.looseEqual(xs, ['foo', 'x', 'foo']);
  });
  stream.pipe(filter).pipe(toArray);
});

test('with `opts.toString` set to `false`', function(t) {
  t.plan(1);
  var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
  var filter = tsu.filter({ castBuffers: false }, function(x, i) {
    this.push('foo');
    return i === 0;
  });
  var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
    t.looseEqual(xs, ['foo', new Buffer('x'), 'foo']);
  });
  stream.pipe(filter).pipe(toArray);
});
