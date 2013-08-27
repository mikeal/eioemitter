var events = require('events')
  , util = require('util')
  , eiojson = require('eiojson')
  ;
function Emitter (socket, namespace) {
  events.EventEmitter.call(this)
  this.socket = socket
  this.namespace = namespace

  var _emit = this.emit
  this.emit = function () {
    var args = Array.prototype.slice.call(arguments)
      , name = args.shift()
      , obj =
        { extension: 'eioemitter'
        , namespace: namespace
        , name : name
        , args: args
        }
      ;
    if (obj.name === 'addListener') return
    if (obj.name === 'newListener') return
    if (obj.name === 'removeListener') return
    socket.json(obj)
  }

  var self = this

  socket.on('json', function (obj) {
    if (obj.extension !== 'eioemitter') return
    if (!obj.name || !obj.args) return
    if (namespace && obj.namespace !== namespace) return
    _emit.apply(self, [obj.name].concat(obj.args))
  })
}
util.inherits(Emitter, events.EventEmitter)

module.exports = function (socket, namespace) {
  if (!socket.json) eiojson(socket)
  return new Emitter(socket, namespace)
}