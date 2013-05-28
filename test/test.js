var net = require('net');
var mtcp = require('../lib/mtcp');

var host="2620:107:300f::b8a9:b32f";
host="127.0.0.1";
//host="www.wsmlby.info";

var port_local=10029;
var port_remote=8003;
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

console.log("forward locathost tcp "+port_local+" to Remote mtcp"+host+":"+port_remote);
require('../lib/pipeserver')
    .startServer(net,mtcp,port_remote,host,port_local);


