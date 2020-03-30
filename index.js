var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);//将 socket.io 绑定到服务器上，于是任何连接到该服务器的客户端都具备了实时通信功能。

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
})

var onlineUsers = {};
var onlineCount = 0;

io.on('connection',function(socket){//服务器监听所有客户端，并返回该新连接对象，接下来我们就可以通过该连接对象（socket）与客户端进行通信了
    console.log('a user connected');
    socket.on('login',function (obj) {
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.userId;
        if (!onlineUsers.hasOwnProperty(obj.userId)){
            onlineUsers[obj.userId] = obj.username;
        };
        // 在线人数加1
        onlineCount++;
        io.emit('login',{onlineUsers: onlineUsers,onlineCount: onlineCount,user: obj});
        console.log(obj.username + "加入了聊天室");
    })
    socket.on('disconnect',function () {
        //将退出的用户从在线列表中删除
        if (onlineUsers.hasOwnProperty(socket.name)){
        //    退出用户的信息
            var obj = {userId: socket.name,username: onlineUsers[socket.name]};
            delete onlineUsers[socket.name];
            // 在线人数减1
            onlineCount--;
            //向所有客户端广播用户退出
            io.emit('logout',{onlineUsers: onlineUsers, onlineCount: onlineCount, user:obj})
            console.log(obj.username + '退出了聊天室')
        }
    });
    socket.on('message',function(obj){
        console.log(obj.username + "说：" + obj.content);
        io.emit('message',obj);
    })
})


http.listen(3000,function(){
    console.log('listening on:3000');
})

