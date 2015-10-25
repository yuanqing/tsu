'use strict';

var tsu = require('..');
var test = require('tape');
var concatStream = require('concat-stream');

// tsu.noop(opts)

test('default `opts`', function(t) {
  t.plan(1);
  var stream = tsu.source({ objectMode: true }, [
    { x: 1 },
    { y: 2 }
  ]);
  var noop = tsu.noop();
  var concat = concatStream(function(x) {
    t.looseEqual(x, [
      { x: 1 },
      { y: 2 }
    ]);
  });
  stream.pipe(noop).pipe(concat);
});

test('with `opts.objectMode` set to `false`', function(t) {
  t.plan(1);
  var stream = tsu.source({ objectMode: false }, ['x', 'y']);
  var noop = tsu.noop({ objectMode: false });
  var concat = concatStream(function(x) {
    t.looseEqual(x, new Buffer('xy'));
  });
  stream.pipe(noop).pipe(concat);
});
