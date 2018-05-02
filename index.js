var drive = require('hyperdrive/lib/messages.js')
var tree = require('append-tree/messages.js')
var ram = require('random-access-memory')
var hypercore = require('hypercore')
var discoverySwarm = require('discovery-swarm')
var defaults = require('dat-swarm-defaults')
var duplexify = require('duplexify')
var pump = require('pump')
var through = require('through2')

module.exports = function (key) {
  var duplex = duplexify.obj()
  var feed = hypercore(function (filename) {
    return ram()
  }, key)

  var swarmOpts = {
    hash: false,
    stream: function (opts) {
      opts.live = true
      return feed.replicate(opts)
    }
  }

  var sw = discoverySwarm(defaults(swarmOpts))
  sw.listen()

  feed.on('ready', function () {
    sw.join(feed.discoveryKey)
    feed.update(function () {
      var first = true
      var isHyperdrive = false
      var stream = feed.createReadStream()
      var decode = through.obj(function (obj, enc, next) {        
        if (first) {
          first = false
          try {
            var idx = drive.Index.decode(obj)
          } catch (e) {
            return next(null, obj)
          }
          if (idx.type === 'hyperdrive') {
            isHyperdrive = true
            return next(null, idx)
          } else {
            return next(null, obj)
          }
        }
        if (isHyperdrive) {
          var node = tree.Node.decode(obj)
          node.value = drive.Stat.decode(node.value)          
          return next(null, node)
        }
        return next(null, obj)
      })
      pump(stream, decode)
      duplex.setReadable(decode)
    })
  })
  duplex.close = function () {
    sw.close()
    feed.close()
  }
  return duplex
}
