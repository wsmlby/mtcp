var net = require('net');
var mtcp = require('../lib/mtcp');

var host="2620:107:300f::b8a9:aee7";
host="127.0.0.1";


var port_local=8003;
var port_remote=8124;
var printhelp=function(){
	console.log("no parameter : port_local="+port_local+" port_remote="+port_remote+ "host="+host);
	console.log("or:");
	console.log("port_local:port_remote");
	console.log("port_local:host:port_remote");
	process.exit(0);
}
if(process.argv.length>2){
	var arg=process.argv[2];
	arg=arg.split(":");
	if(arg.length<2){
		printhelp();
	}
	if(arg.length==2){
		port_local=arg[0];
		port_remote=arg[1];
	}
	if(arg.length==3){
		port_local=arg[0];
		host=arg[1];
		port_remote=arg[2];
			
	}
}
console.log("forward locathost mtcp "+port_local+" to Remote tcp"+host+":"+port_remote);
require('../lib/pipeserver')
    .startServer(mtcp,net,port_remote,host,port_local);
