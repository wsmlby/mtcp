var net = require('net');
var mtcp = require('../lib/mtcp');

var host="2620:107:300f::b8a9:aee7";
host="127.0.0.1";
require('./pipeserver')
    .startServer(net,mtcp,8003,host,10029);
require('./pipeserver')
    .startServer(mtcp,net,9999,"127.0.0.1",8003);

