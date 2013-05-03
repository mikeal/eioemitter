var eioemitter = require('./')
  , engine = require('engine.io')
  , broquire = require('broquire')(require)
  , engineClient = broquire('engine.io-client', 'eio')
  , cleanup = require('cleanup')
  , assert = require('assert')
  , ok = require('okdone')
  ;

var d = cleanup(function (error) {
  if (error) process.exit(1)
  ok.done()
  process.exit()
})

var completed = 0

function makeListener (n) {
  function listener (name, nothing) {
    assert.equal(n, name)
    assert.ok(!nothing)
    completed += 1
    ok(name)
    if (completed === 8) {
      d.cleanup()
    }
  }
  return listener
}

function binder (e) {
  e.once('test1', makeListener('test1'))
  e.once('test2', makeListener('test2'))
  e.once('test3', makeListener('test3'))
  e.once('test4', makeListener('test4'))
}

function test (c) {
  c.emit('test1', 'test1')
  c.emit('test2', 'test2')
  c.emit('test3', 'test3')
  c.emit('test4', 'test4')
}

var s = engine.listen(8080, function () {
  var c = eioemitter(engineClient('ws://localhost:8080'))
  binder(c)
  test(c)
})

s.on('connection', function (socket) {
  var c = eioemitter(socket)
  binder(c)
  test(c)
})

exports.test = test
exports.binder = binder
