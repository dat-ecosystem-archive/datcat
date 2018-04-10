#!/usr/bin/env node
var first = true
var stream = require('./')(process.argv[2])
stream
  .on('data', function (d) {
    if (Buffer.isBuffer(d)) d = d.toString()
    if (typeof d === 'object') d = JSON.stringify(d)
    console.log(d)
  })
  .on('end', function () {
    stream.close()
  })
