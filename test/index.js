'use strict';

var concatStream = require('concat-stream');
var test = require('tape');
var tsu = require('..');

test('tsu.fromArray(opts, arr)', function(t) {

  t.test('default `opts`', function(t) {
    t.plan(1);
    var stream = tsu.fromArray(['x', 'y']);
    var concat = concatStream(function(x) {
      t.looseEqual(x, 'xy');
    });
    stream.pipe(concat);
  });

  t.test('with `opts.objectMode` set to `false`', function(t) {
    t.plan(1);
    var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
    var concat = concatStream(function(x) {
      t.looseEqual(x, new Buffer('xy'));
    });
    stream.pipe(concat);
  });

});

test('tsu.toArray(opts, cb)', function(t) {

  t.test('default `opts`', function(t) {
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

  t.test('with `opts.toString` set to `false`', function(t) {
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

});

test('tsu.each(opts, cb)', function(t) {

  t.test('default `opts`', function(t) {
    t.plan(1);
    var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
    var each = tsu.each(function(x, i) {
      this.push([x, i]);
    });
    var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
      t.looseEqual(xs, [['x', 0], ['y', 1]]);
    });
    stream.pipe(each).pipe(toArray);
  });

  t.test('with `opts.toString` set to `false`', function(t) {
    t.plan(1);
    var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
    var each = tsu.each({ castBuffers: false }, function(x, i) {
      this.push([x, i]);
    });
    var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
      t.looseEqual(xs, [[new Buffer('x'), 0], [new Buffer('y'), 1]]);
    });
    stream.pipe(each).pipe(toArray);
  });

});

test('tsu.map(opts, fn)', function(t) {

  t.test('default `opts`', function(t) {
    t.plan(1);
    var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
    var filter = tsu.map(function(x, i) {
      this.push('foo');
      return [x, i];
    });
    var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
      t.looseEqual(xs, ['foo', ['x', 0], 'foo', ['y', 1]]);
    });
    stream.pipe(filter).pipe(toArray);
  });

  t.test('with `opts.toString` set to `false`', function(t) {
    t.plan(1);
    var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
    var filter = tsu.map({ castBuffers: false }, function(x, i) {
      this.push('foo');
      return [x, i];
    });
    var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
      t.looseEqual(xs, ['foo', [new Buffer('x'), 0], 'foo', [new Buffer('y'), 1]]);
    });
    stream.pipe(filter).pipe(toArray);
  });

});

test('tsu.filter(opts, fn)', function(t) {

  t.test('default `opts`', function(t) {
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

  t.test('with `opts.toString` set to `false`', function(t) {
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

});

test('tsu.fold(opts, acc, fn, cb)', function(t) {

  t.test('default `opts`', function(t) {
    t.plan(2);
    var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
    var fold = tsu.fold([], function(acc, x, i) {
      this.push([x, i]);
      acc.push([x, i]);
      return acc;
    }, function(acc) {
      this.push(acc);
      t.looseEqual(acc, [['x', 0], ['y', 1]]);
    });
    var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
      t.looseEqual(xs, [
        ['x', 0],
        ['y', 1],
        [['x', 0], ['y', 1]]
      ]);
    });
    stream.pipe(fold).pipe(toArray);
  });

  t.test('with `opts.toString` set to `false`', function(t) {
    t.plan(2);
    var stream = tsu.fromArray({ objectMode: false }, ['x', 'y']);
    var fold = tsu.fold({ castBuffers: false }, [], function(acc, x, i) {
      this.push([x, i]);
      acc.push([x, i]);
      return acc;
    }, function(acc) {
      this.push(acc);
      t.looseEqual(acc, [[new Buffer('x'), 0], [new Buffer('y'), 1]]);
    });
    var toArray = tsu.toArray({ castBuffers: false }, function(xs) {
      t.looseEqual(xs, [
        [new Buffer('x'), 0],
        [new Buffer('y'), 1],
        [[new Buffer('x'), 0], [new Buffer('y'), 1]]
      ]);
    });
    stream.pipe(fold).pipe(toArray);
  });

});

test('tsu.sort(opts, compare)', function(t) {

  t.test('without `fn`, defaults `opts`', function(t) {
    t.plan(1);
    var stream = tsu.fromArray([3, 1, 2]);
    var sort = tsu.sort();
    var toArray = tsu.toArray({ castBuffers: false },function(xs) {
      t.looseEqual(xs, [1, 2, 3]);
    });
    stream.pipe(sort).pipe(toArray);
  });

  t.test('with `fn`', function(t) {
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

  t.test('with `opts.toString` set to `false`', function(t) {
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

});
