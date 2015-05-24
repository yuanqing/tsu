'use strict';

var extend = require('xtend');
var isBuffer = require('is-buffer');
var stream = require('stream');
var through = require('through2');

var defaultOpts = {
  objectMode: true
};

var toString = function(chunk) {
  return isBuffer(chunk) ? chunk.toString() : chunk;
};

var tsu = {};

// FROM ARRAY

var fromArray = function(opts, arr) {
  if (!arr) {
    arr = opts;
  }
  opts = extend(defaultOpts, opts);
  var rs = new stream.Readable(opts);
  var i = -1;
  var len = arr.length;
  while (++i < len) {
    rs.push(arr[i]);
  }
  rs.push(null);
  return rs;
};
tsu.fromArray = fromArray;

// TO ARRAY

var toArray = function(opts, cb) {
  if (!cb) {
    cb = opts;
  }
  opts = extend(defaultOpts, opts);
  var transform = function(chunk, encoding, transformCb) {
    this.__acc.push(opts.toString ? toString(chunk) : chunk);
    transformCb();
  };
  var flush = function(flushCb) {
    cb.call(this, this.__acc);
    flushCb();
  };
  var ToArray = through.ctor(opts, transform, flush);
  ToArray.prototype.__acc = [];
  return ToArray;
};
tsu.toArray = function(opts, cb) {
  return toArray(opts, cb)();
};
tsu.toArray.ctor = toArray;

// EACH

var each = function(opts, fn) {
  if (!fn) {
    fn = opts;
  }
  opts = extend(defaultOpts, opts);
  var transform = function(chunk, encoding, transformCb) {
    fn.call(this, this.options.toString ? toString(chunk) : chunk, this.__index++);
    transformCb();
  };
  var Each = through.ctor(opts, transform);
  Each.prototype.__index = 0;
  return Each;
};
tsu.each = function(fn, opts) {
  return each(fn, opts)();
};
tsu.each.ctor = each;

// MAP

var map = function(opts, fn) {
  if (!fn) {
    fn = opts;
  }
  return each(opts, function(chunk, index) {
    this.push(fn.call(this, chunk, index));
  });
};
tsu.map = function(fn, opts) {
  return map(fn, opts)();
};
tsu.map.ctor = map;

// FILTER

var filter = function(opts, fn) {
  if (!fn) {
    fn = opts;
  }
  return each(opts, function(chunk, index) {
    if (fn.call(this, chunk, index)) {
      this.push(chunk);
    }
  });
};
tsu.filter = function(fn, opts) {
  return filter(fn, opts)();
};
tsu.filter.ctor = filter;

// FOLD

var fold = function(opts, acc, fn, cb) {
  if (!cb) {
    cb = fn;
    fn = acc;
    acc = opts;
  }
  opts = extend(defaultOpts, opts);
  var transform = function(chunk, encoding, transformCb) {
    this.__acc = fn.call(this, acc, this.options.toString ? toString(chunk) : chunk, this.__index++);
    transformCb();
  };
  var flush = function(flushCb) {
    cb.call(this, this.__acc);
    flushCb();
  };
  var Fold = through.ctor(opts, transform, flush);
  Fold.prototype.__index = 0;
  Fold.prototype.__acc = acc;
  return Fold;
};
tsu.fold = function(opts, acc, fn, cb) {
  return fold(opts, acc, fn, cb)();
};
tsu.fold.ctor = fold;

// SORT

var sort = function(opts, fn, cb) {
  if (!fn) {
    cb = opts;
  } else {
    if (!cb) {
      cb = fn;
      fn = opts;
    }
  }
  opts = extend(defaultOpts, opts);
  var transform = function(chunk, encoding, transformCb) {
    this.__acc.push(opts.toString ? toString(chunk) : chunk);
    transformCb();
  };
  var flush = function(flushCb) {
    cb.call(this, this.__acc.sort(fn));
    flushCb();
  };
  var Sort = through.ctor(opts, transform, flush);
  Sort.prototype.__acc = [];
  return Sort;
};
tsu.sort = function(opts, fn, cb) {
  return sort(opts, fn, cb)();
};
tsu.sort.ctor = sort;

module.exports = tsu;
