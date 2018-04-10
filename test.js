var first = true
var stream = require('./')(process.argv[2])
stream
  .on('data', function (d) {
    console.log(d)
  })
  .on('end', function () {
    stream.close()
  })
