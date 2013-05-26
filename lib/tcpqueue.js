var TCPQueue=function(callback,endcallback){
    this.send_cb=callback;
    this.tosend=0;
    this.packages={}
    this.end_cb=endcallback;
}
TCPQueue.prototype.addPackage=function(package){
    if(package.flag==3){console.log("END!!!!REcV");}
    console.log("Package InQueue:"+package.pid);
    if(package.pid!=this.tosend){
        this.packages[package.pid]=package.data;
        return; 
    }
    if(package.flag==3){
        console.log("END!!!!");
	    this.end_cb();
    }
    
    console.log("Package Send:"+package.pid+":"+package.data.slice(0,16));
    this.send_cb(package.data);
   
    
    this.tosend+=1;
    while(this.packages[this.tosend]){
        if(this.packages[this.tosend].flag==3){
            console.log("END!!!!");
            this.end_cb();
            return;
        }
        console.log("Package Send:"+this.packages[this.tosend].pid+"["+this.packages[this.tosend].flag+"]:");

        this.send_cb(this.packages[this.tosend]);    
        this.tosend+=1;
    }
}
exports.TCPQueue=TCPQueue;
