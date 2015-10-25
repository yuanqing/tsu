'use strict';

var tsu = require('..');
var test = require('tape');
var concatStream = require('concat-stream');

// tsu.flush(opts, transformCb, flushCb)

test('default `opts`', function(t) {
  t.plan(1);
  var stream = tsu.source({ objectMode: true }, [
    { x: 1 },
    { y: 2 }
  ]);
  var flush = tsu.flush(function() {
    this.push({ z: 3 });
  });
  var concat = concatStream(function(x) {
    t.looseEqual(x, [
      { x: 1 },
      { y: 2 },
      { z: 3 }
    ]);
  });
  stream.pipe(flush).pipe(concat);
});

test('with `opts.objectMode` set to `false`', function(t) {
  t.plan(1);
  var stream = tsu.source({ objectMode: false }, ['x', 'y']);
  var flush = tsu.flush({ objectMode: false }, function() {
    this.push('z');
  });
  var concat = concatStream(function(x) {
    t.looseEqual(x, new Buffer('xyz'));
  });
  stream.pipe(flush).pipe(concat);
});
