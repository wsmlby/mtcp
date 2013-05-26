/////////////////////////////////
//
//   .. 
//   ..     
//   ..  <===sendcallback  =Addpackage==>  |Queue|=====>recallback
//   ..     
//   ..
//
/////////////////////////////////



var header=require('./mytcpheader').WsmTCPHeader;
var TCPQueue=require('./tcpqueue').TCPQueue;
var TCPSession=function(recvcallback,endcallback){
    this.pindex=0;
    this.sid=header.generateRandomSId();
    this.queue=new TCPQueue(recvcallback,endcallback);
}
TCPSession.prototype.packData=function(data){
	console.log("id:"+this.pindex+"data"+data.slice(0,20).toString('hex'));
    return header.setHeader(data,{sid:this.sid,pid:this.pindex++});
}
TCPSession.prototype.hello=function(){
    return header.makeHeader({sid:this.sid,pid:0},0,1);
}
TCPSession.prototype.responsehello=function(){
    return header.makeHeader({sid:this.sid,pid:0},0,2);
}
TCPSession.prototype.end=function(){
	console.log("End Ready to send"+this.pindex);
    return header.makeHeader({sid:this.sid,pid:this.pindex++},0,3);
}

TCPSession.prototype.addPackage=function(package){
    this.queue.addPackage(package);
}
exports.TCPSession=TCPSession;
