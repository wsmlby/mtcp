var util = require("util");
var events = require("events");
var net=require("net");
var pool=require("socketpool");
var session=require("../lib/tcpsession");
var header=require('../lib/mytcpheader').WsmTCPHeader;

function Server(cb){
    events.EventEmitter.call(this);
    this.on("connection",cb);
    this.socks={};
    var self=this;
    var getSocket=function(sid){// mtcpSocket
		if(!(sid in self.socks)){
	    	var socket=new Socket();
	    	self.socks[sid]=socket;
	    	self.emit("connection",socket);
		}
		return self.socks[sid];
    }
    this._server=net.createServer(function(conn){//tcp socket
		conn.once('data',function(data){
	    	data=header.getPackage(data);
	    	var s=getSocket(data.sid);
	    	if(data.flag==1){
				console.log("helloed");
				conn.write(s.session.responsehello());
				conn._id=s.__id++;
				s.pool.addReady(conn);
	    	}	
	    	else{
				conn.end();
	    	}
	    
		});
    });
}
util.inherits(Server, events.EventEmitter);
Server.prototype.listen=function(port){
    this._server.listen(port);
}

function Socket(){
    events.EventEmitter.call(this);
    var self=this;
    self.__id=0;
    this.session=new session.TCPSession(function(data){
		self.emit("data",data);
    },function(){
		self.emit("end");
    });
    self.on("end",function(){
        self.pool.removeAllListeners("partlyend");
    })
    self.alive=false;
    //pool to manage socks
    self.pool=new pool.SocketPool(false);
    self.pool.on('data',function(socket,data,stage){
    	var sp=this;

    	if(stage=="connecting"){
    		data=header.getPackage(data);	
    		if(data.flag==2){
				sp.moveToReady(socket);
	    	}
	    	else{
				self.emit('error',"hello not responsed");
    		}
    	}
    	else{
    		console.log(stage,"data["+data.length);
    		socket.buffer.feed(data);
    	}
    	
    });

    self.pool.on("beforeConnect",function(socket){
    	socket.on("error",function(err){console.log("Error")});
    	socket.write(self.session.hello());
    });

    self.pool.on("ready",function(socket){
    	socket.buffer=new header.DataBuffer(function(data){

			console.log("[GET]len:Socket#"+socket._id+data.len+" pid:"+data.pid+" sid:"+data.sid);
			self.session.addPackage(data);
	    });
    	if(!self.alive){
		    self.alive=true;
	    	self.emit("connect");
	 		console.log("socketpool ready");
	    	
		}	

    });
    self.pool.on("partlyend",function(socket){
    	console.log("partlyend #"+socket._id);
    });  
    self.pool.on("error",function(socket,err){
    	self.emit("error",err);
    });
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype.connect=function(port,host,count,cb){
    if(!host)host="127.0.0.1";
    if(!count)count=2;
    var self=this;
    self.alive=false;
    
    var createClient=function(){
	var client=net.connect(port,host);
		client._id=self.__id++;
		client.on('connect',function(){
			self.pool.add(client);
		});

	}
    self.pool.on("partlyend",createClient);
    self.on("connect",cb);
    for(var i = 0;i < count; i++){
		createClient();
    }
};
Socket.prototype.write=function(data){
	console.log("mtcp socket write called: data["+data.length+"]");
	while(data.length>32768){
		var d=this.session.packData(data.slice(0,32768));
		this.pool.send(d);
		data=data.slice(32768);
	}
	var d=this.session.packData(data);
	this.pool.send(d);
}
Socket.prototype.end=function(){
    this.pool.send(this.session.end());
    console.log("Called End");
    //this.emit("end");
};
exports.connect=function(obj,cb){
    var s=new Socket();
    s.connect(obj.port,obj.host,obj.count,cb);
    return s;
}
exports.createConnection=exports.connect;
exports.createServer=function(cb){
    var s=new Server(cb);
    return s;
}
