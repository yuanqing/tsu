'use strict';

var tsu = require('..');
var test = require('tape');

// tsu.sort(opts, compare)

test('without `fn`, defaults `opts`', function(t) {
  t.plan(1);
  var stream = tsu.fromArray([3, 1, 2]);
  var sort = tsu.sort();
  var toArray = tsu.toArray({ castBuffers: false },function(xs) {
    t.looseEqual(xs, [1, 2, 3]);
  });
  stream.pipe(sort).pipe(toArray);
});

test('with `fn`', function(t) {
  t.plan(1);
  var stream = tsu.fromArray([3, 1, 2]);
  var sort = tsu.sort(function(x, y) {
    return x > y ? -1 : 1;
  });
  var toArray = tsu.toArray({ castBuffers: false },function(xs) {
    t.looseEqual(xs, [3, 2, 1]);
  });
  stream.pipe(sort).pipe(toArray);
});

test('with `opts.toString` set to `false`', function(t) {
  t.plan(1);
  var stream = tsu.fromArray({ objectMode: false }, ['3', '1', '2']);
  var sort = tsu.sort({ castBuffers: false }, function(x, y) {
    return parseInt(x.toString(), 10) < parseInt(y.toString(), 10) ? -1 : 1;
  });
  var toArray = tsu.toArray({ castBuffers: false },function(xs) {
    t.looseEqual(xs, [new Buffer('1'), new Buffer('2'), new Buffer('3')]);
  });
  stream.pipe(sort).pipe(toArray);
});

