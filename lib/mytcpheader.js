
var a={};
//////////////////////////////////////////////////
//
//  Header:|   |   |   |   ||   |   |   |   ||   |   |   |   ||   |   |   |   ||
//         |int32 sessionId||int32 packageId||int32 length   ||flag   |       || 
//                14 byte
//
//////////////////////////////////////////////
var HEADER_LENGTH=16;

//header: {sid: ,pid:, flag:}
// flag:0 :data,  1 :begin, 2: begin ok, 3: end. 
function makeHeader(header,len,flag){
    var buf=new Buffer(HEADER_LENGTH);
    if(!flag)flag=0;
    buf.writeUInt32BE(header.sid,0);
    buf.writeUInt32BE(header.pid,4);
    buf.writeUInt32BE(len,8);
    buf.writeUInt16BE(flag,12);
    buf.write("me",14);
    return buf;
}
function parseHeader(buffer){
    var p={};
    p.sid = buffer.readUInt32BE(0);
    p.pid = buffer.readUInt32BE(4);
    p.len = buffer.readUInt32BE(8);
    p.flag= buffer.readUInt16BE(12);
    return p; 
}
a.makeHeader=makeHeader;
a.setHeader=function(buffer,header){
    var n_buffer=new Buffer(buffer.length+HEADER_LENGTH);
    makeHeader(header,buffer.length).copy(n_buffer);
    buffer.copy(n_buffer,HEADER_LENGTH);
    return n_buffer;
}
var maxint=Math.pow(2,32) - 1;
a.generateRandomSId=function(){
    return Math.floor(Math.random()*maxint);
}
a.getPackage=function(buffer){
    var header=parseHeader(buffer);
    header.data=buffer.slice(HEADER_LENGTH);
    return header;
}
exports.WsmTCPHeader=a;

function DataBuffer(ondata){
    this.ondata=ondata;

}
DataBuffer.prototype.feed=function(data){
    //console.log(data.slice(0,16));

    if(this.dataleft)
	this.dataleft=Buffer.concat([this.dataleft,data]);
    else
	this.dataleft=data;
    var bytestoread;
    
    if(this.dataleft.length<HEADER_LENGTH)return;
    var package=a.getPackage(this.dataleft);
    bytestoread=package.len+HEADER_LENGTH;
    
    while(bytestoread<=this.dataleft.length){
    var package=a.getPackage(this.dataleft.slice(0,bytestoread));
    package.socketid=this.id;
	this.ondata(package);
	if(this.dataleft.length==bytestoread){
	    this.dataleft=null;
	    return;
	}
	
	this.dataleft=this.dataleft.slice(bytestoread);
	if(this.dataleft.length<HEADER_LENGTH)
	    return;
	var package=a.getPackage(this.dataleft);
	this.bytestiread=package.len+HEADER_LENGTH;
    }
}
a.DataBuffer=DataBuffer;

