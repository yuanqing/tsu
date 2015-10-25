'use strict';

var tsu = require('..');
var test = require('tape');
var concatStream = require('concat-stream');

// tsu.fromArray(opts, arr)

test('default `opts`', function(t) {
  t.plan(1);
  var stream = tsu.fromArray(['x', 'y']);
  var concat = concatStream(function(x) {
    t.looseEqual(x, 'xy');
  });
  stream.pipe(concat);
});

test('with `opts.objectMode` set to `false`', function(t) {
  t.plan(1);
  var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
  var concat = concatStream(function(x) {
    t.looseEqual(x, new Buffer('xy'));
  });
  stream.pipe(concat);
});
