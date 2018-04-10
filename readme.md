# datcat

module to simplify streaming a remote hypercore feed in memory so you can cat the results. works with 'raw' hypercores or hyperdrives. autodetects hyperdrive/dat encoding and decodes metadata for you automatically.

## usage

```
var stream = require('datcat')(datLink)
stream
  .on('data', function (d) {
    console.log(d)
  })
  .on('end', function () {
    stream.close()
  })
```

note you must call .close() manually to unref and allow your process to exit (if you need that)
