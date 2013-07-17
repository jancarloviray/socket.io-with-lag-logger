
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , socket = require('socket.io');

var app = express();

var server = http.createServer(app);

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('ip',process.env.IP);
  app.set('port',process.env.PORT);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

server.listen(app.get('port'), app.get('ip'), function(){
    console.log('listening...',app.get('ip'),' : ',app.get('port'));
})

// Routes

app.get('/', routes.index);

var io = socket.listen(server);

var connections = [];

io.sockets.on('connection', function(socket){
    socket.emit('connected-self',{selfId:socket.id, currentPlayers:connections});
    
    connections.push(socket.id);
    
    //broadcast to all
    io.sockets.emit('connected-other',{id:socket.id,x:0,y:0});
    
    socket.on('name',function(name){
        console.log('name emitted');
        socket.set('name',name,function(){
            console.log('name set to ',name);
            socket.emit('name set',name); 
        });
    });
    
    socket.on('mv-k',function(data){
       io.sockets.emit('update-k',data); 
    });
    
    socket.on('mousemove',function(data){
        console.log(socket.id);
        socket.emit('boxmousemove',data);
        //io.sockets.emit('broadcast',{id:socket.id,data:data});
    });
    
    socket.on('key',function(data){
        console.log(socket.id);
        socket.emit('boxkeymove',data);
        io.sockets.emit('broadcast',{id:socket.id,data:data});
    });
})