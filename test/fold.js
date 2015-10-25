'use strict';

var tsu = require('..');
var test = require('tape');

// tsu.fold(opts, acc, fn, cb)

test('default `opts`', function(t) {
  t.plan(2);
  var stream = tsu.source({ objectMode: false }, ['x', 'y']);
  var fold = tsu.fold([], function(acc, x, i) {
    this.push([x, i]);
    acc.push([x, i]);
    return acc;
  }, function(acc) {
    this.push(acc);
    t.looseEqual(acc, [['x', 0], ['y', 1]]);
  });
  var toArray = tsu.toArray({ toString: false }, function(xs) {
    t.looseEqual(xs, [
      ['x', 0],
      ['y', 1],
      [['x', 0], ['y', 1]]
    ]);
  });
  stream.pipe(fold).pipe(toArray);
});

test('with `opts.toString` set to `false`', function(t) {
  t.plan(2);
  var stream = tsu.source({ objectMode: false }, ['x', 'y']);
  var fold = tsu.fold({ toString: false }, [], function(acc, x, i) {
    this.push([x, i]);
    acc.push([x, i]);
    return acc;
  }, function(acc) {
    this.push(acc);
    t.looseEqual(acc, [[new Buffer('x'), 0], [new Buffer('y'), 1]]);
  });
  var toArray = tsu.toArray({ toString: false }, function(xs) {
    t.looseEqual(xs, [
      [new Buffer('x'), 0],
      [new Buffer('y'), 1],
      [[new Buffer('x'), 0], [new Buffer('y'), 1]]
    ]);
  });
  stream.pipe(fold).pipe(toArray);
});
