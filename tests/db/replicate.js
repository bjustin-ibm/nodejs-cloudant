var vows   = require('vows')
  , assert = require('assert')
  , async  = require('async')
  , cfg    = require('../../cfg/tests.js')
  , nano   = require('../../nano')(cfg);

/*****************************************************************************
 * replicate_db                                                              *
 *****************************************************************************/
function replicate_db(callback) {
  nano.db.create("db_re1", function () {
    var db      = nano.use("db_re1")
      , replica = nano.use("db_re1_replica");
    async.parallel(
      [ function(cb) { db.insert({"foo": "bar"},"foobar",cb); }
      , function(cb) { db.insert({"bar": "foo"},"barfoo",cb); }
      , function(cb) { db.insert({"foo": "baz"},"foobaz",cb); }
      , function(cb) { nano.db.create("db_re1_replica", cb);     }
      ],
      function(err, results) {
        db.replicate("db_re1_replica", function() {
          replica.list(callback);
        });
      });
  });
}

function replicate_db_ok(e,h,b) {
  nano.db.destroy("db_re1");
  nano.db.destroy("db_re1_replica");
  assert.isNull(e);
  assert.equal(b.total_rows, 3);
  assert.ok(b.rows);
}

vows.describe('nano.db.replicate').addBatch({
  "replicate_db": {
    topic: function () { replicate_db(this.callback); }
  , "=": replicate_db_ok
  }
}).exportTo(module);