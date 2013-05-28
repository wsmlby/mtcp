var TCPQueue=function(callback,endcallback){
    this.send_cb=callback;
    this.tosend=0;
    this.packages={}
    this.end_cb=endcallback;
}


var fs = require('fs');
var f;
var stream = fs.createWriteStream("my_file.txt");
stream.once('open', function(fd) {
  f=fd;
});

TCPQueue.prototype.addPackage=function(package){
  //  console.log("id:"+package.pid+"data"+package.data.slice(0,20).toString('hex'));
//    if(package.flag==3){console.log("END!!!!REcV");}
    if(package.pid!=this.tosend){
        //stream.write(this.tosend+"\n");
        //console.log(this.tosend);
        this.packages[package.pid]=package.data;
        return; 
    }
    if(package.flag==3){
        //console.log("END!!!!");
	    this.end_cb();
    }
    console.log("outqueue:"+this.tosend);
    this.send_cb(package.data);
   
    
    this.tosend+=1;
    while(this.packages[this.tosend]){
        if(this.packages[this.tosend].flag==3){
            //console.log("END!!!!");
            this.end_cb();
            return;
        }
       // console.log("Package Send:"+this.packages[this.tosend].pid+"["+this.packages[this.tosend].flag+"]:");
       //console.log("outqueue:"+this.tosend);
        this.send_cb(this.packages[this.tosend]);    
        this.tosend+=1;
    }
}
exports.TCPQueue=TCPQueue;
