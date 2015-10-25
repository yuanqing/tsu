'use strict';

var extend = require('xtend');
var isBuffer = require('is-buffer');
var readableStream = require('readable-stream').Readable;
var through = require('through2');

var defaultOpts = {
  castBuffers: true,
  objectMode: true
};

var toString = function(chunk) {
  return isBuffer(chunk) ? chunk.toString() : chunk;
};

var transformNoop = function(chunk, encoding, transformCb) {
  transformCb(null, chunk);
};

var tsu = {};

// NO-OP

tsu.noop = function(opts) {
  return through(extend(defaultOpts, opts));
};

// SOURCE

tsu.source = function(opts, x) {
  if (!x) {
    x = opts;
  }
  opts = extend(defaultOpts, opts);
  var flush = function(callback) {
    if (typeof x === 'function') {
      x = x();
    }
    if (Array.isArray(x)) {
      var i = -1;
      var length = x.length;
      while (++i < length) {
        this.push(x[i]);
      }
    } else {
      this.push(x);
    }
    callback();
  };
  var stream = through(opts, transformNoop, flush);
  process.nextTick(function() {
    stream.end();
  });
  return stream;
};

// FLUSH

tsu.flush = function(opts, cb) {
  if (!cb) {
    cb = opts;
  }
  opts = extend(defaultOpts, opts);
  var flush = function(flushCb) {
    cb.call(this);
    flushCb();
  };
  return cb ? through(opts, transformNoop, flush) : through(opts);
};

// FROM ARRAY

var fromArray = function(opts, arr) {
  if (!arr) {
    arr = opts;
  }
  opts = extend(defaultOpts, opts);
  var rs = readableStream(opts);
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
    this.__acc.push(opts.castBuffers ? toString(chunk) : chunk);
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
    fn.call(this, this.options.castBuffers ? toString(chunk) : chunk, this.__index++);
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
    this.__acc = fn.call(this, acc, this.options.castBuffers ? toString(chunk) : chunk, this.__index++);
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

var sort = function(opts, compare) {
  if (typeof opts === 'function') {
    compare = opts;
    opts = {};
  }
  opts = extend(defaultOpts, opts);
  var transform = function(chunk, encoding, transformCb) {
    this.__acc.push(opts.castBufferToString ? toString(chunk) : chunk);
    transformCb();
  };
  var flush = function(flushCb) {
    this.__acc.sort(compare);
    var i = -1;
    var len = this.__acc.length;
    while (++i < len) {
      this.push(this.__acc[i]);
    }
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
