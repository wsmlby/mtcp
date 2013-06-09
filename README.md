=mtcp=
----

node.js module for tcp over multi-tcps, in case you need to work around per-connection speed limit.

==usage==

===for developement===
use mtcp as net, you can createServer, connect, etc.
===for socket forwarding===
use 
{{{
node test/test.js localport:remoteaddress:remoteport
}}}

on client(the host you can access)

and 
{{{
node test/test2.js localport:remoteaddress:remoteport
}}}
on server(the other end).




