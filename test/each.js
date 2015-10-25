'use strict';

var tsu = require('..');
var test = require('tape');

// tsu.each(opts, cb)

test('default `opts`', function(t) {
  t.plan(1);
  var stream = tsu.source({ objectMode: false }, ['x', 'y']);
  var each = tsu.each(function(x, i) {
    this.push([x, i]);
  });
  var toArray = tsu.toArray({ toString: false }, function(xs) {
    t.looseEqual(xs, [['x', 0], ['y', 1]]);
  });
  stream.pipe(each).pipe(toArray);
});

test('with `opts.toString` set to `false`', function(t) {
  t.plan(1);
  var stream = tsu.source({ objectMode: false }, ['x', 'y']);
  var each = tsu.each({ toString: false }, function(x, i) {
    this.push([x, i]);
  });
  var toArray = tsu.toArray({ toString: false }, function(xs) {
    t.looseEqual(xs, [[new Buffer('x'), 0], [new Buffer('y'), 1]]);
  });
  stream.pipe(each).pipe(toArray);
});
