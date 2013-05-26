exports.startServer=function(net,mtcp,back_port,back_address,listen_port){
    net.createServer(function(conn){
    	
	conn.alive=false;
	conn.buffer=[];
	conn.flush=function(){
	    while(conn.buffer.length>0){
		var data=conn.buffer.pop();
		conn.client.write(data);
	    }
	}
	console.log("tryconnect");
	var client=mtcp.connect({port:back_port,host:back_address},function(){
	    console.log('back:connected');
	    conn.alive=true;
	    conn.flush();
	});
	conn.client=client;
	client.on('data',function(data){
		console.log("write["+data.length+"]"+conn.alive);
	    conn.write(data);
	});
	conn.on('data',function(data){
			
		    if(conn.alive)
		    {
				conn.flush();
				conn.client.write(data);
		    }
		    else{
				conn.buffer.unshift(data);
		    }
		});
	client.on('end',function(){
	    console.log('back: end');
	    conn.end();
	});
	client.on('error',function(err){console.log("CLIENT:"+err);});

	conn.on('end',function(){
		console.log('conn: end');
	    conn.client.end();
	});
	conn.on('error',function(err){
	    console.log("CONN:"+err);
	});
    }).listen(listen_port);
}
