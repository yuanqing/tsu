'use strict';

var tsu = require('..');
var test = require('tape');
var concatStream = require('concat-stream');

// tsu.source(opts, x)

test('default `opts`, with `x` as an array', function(t) {
  t.plan(1);
  var stream = tsu.source([
    { x: 1 },
    { y: 2 }
  ]);
  var concat = concatStream(function(x) {
    t.looseEqual(x, [
      { x: 1 },
      { y: 2 }
    ]);
  });
  stream.pipe(concat);
});

test('default `opts`, with `x` as a function', function(t) {
  t.plan(1);
  var stream = tsu.source(function() {
    return { x: 1 };
  });
  var concat = concatStream(function(x) {
    t.looseEqual(x, [
      { x: 1 }
    ]);
  });
  stream.pipe(concat);
});

test('default `opts`, with `x` as a function returning an array', function(t) {
  t.plan(1);
  var stream = tsu.source(function() {
    return [
      { x: 1 },
      { y: 2 }
    ];
  });
  var concat = concatStream(function(x) {
    t.looseEqual(x, [
      { x: 1 },
      { y: 2 }
    ]);
  });
  stream.pipe(concat);
});

test('with `opts.objectMode` set to `false`', function(t) {
  t.plan(1);
  var stream = tsu.source({ objectMode: false }, ['x', 'y']);
  var concat = concatStream(function(x) {
    t.looseEqual(x, new Buffer('xy'));
  });
  stream.pipe(concat);
});
