'use strict';

var tsu = require('..');
var test = require('tape');
var concatStream = require('concat-stream');

// tsu.through(opts, transformCb, flushCb)

test('default `opts`', function(t) {
  t.plan(1);
  var stream = tsu.source({ objectMode: true }, [
    { x: 1 },
    { y: 2 }
  ]);
  var through = tsu.through(function(chunk, encoding, transformCb) {
    transformCb(null, chunk);
  }, function(flushCb) {
    this.push({ z: 3 });
    flushCb();
  });
  var concat = concatStream(function(x) {
    t.looseEqual(x, [
      { x: 1 },
      { y: 2 },
      { z: 3 }
    ]);
  });
  stream.pipe(through).pipe(concat);
});

test('with `opts.objectMode` set to `false`', function(t) {
  t.plan(1);
  var stream = tsu.source({ objectMode: false }, ['x', 'y']);
  var through = tsu.through({ objectMode: false }, function(chunk, encoding, transformCb) {
    transformCb(null, chunk);
  }, function(flushCb) {
    this.push('z');
    flushCb();
  });
  var concat = concatStream(function(x) {
    t.looseEqual(x, new Buffer('xyz'));
  });
  stream.pipe(through).pipe(concat);
});
