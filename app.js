const { render } = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const parse = require('url-parse');
const http = require('http');
const app = express();
const session = require('express-session');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

let count = 0;

//const clients = [];
//session.master = null;

io.on('connection', socket => {

    console.log('Webscoket connection working');
    const user = "user";
    if (!session.master){
        session.users = 0;
        console.log(session.users)
        session.master = socket;
    }
    session.users += 1;


    socket.emit('join', {
        joinMessage: "Welcome",
        videoID: session.embedID,
        master: (session.master == socket) ? true : false
    });
    socket.broadcast.emit('join', {
        joinMessage: `${user} has joined the chat`
    });
    // if (Object.keys(io.sockets.connected).length == 1){
    //     session.master = Object.keys(io.sockets.connected)[0];
    // };

    // socket.on('getControl', () => {
    //     session.master = socket;
    //     socket.broadcast.emit('loseControl');
    // });

    socket.on('update', message => {
        io.emit('chatUpdated', message);
    });


    socket.on('sendTime', (info) => {

        session.temp.emit('setTime', info);

    });

    socket.on('sync', () => {
        if (session.master != socket)
        {session.master.emit('getTime');
        session.temp = socket;
    
    }

    });

    socket.on('disconnect', () => {
        session.users--;
        if (session.master == socket){
            session.master = null;
        }
        socket.broadcast.emit('join', `${user} has left the chat`)
        session.embedID = null;
    });

});

server.listen(port, () => {
    console.log('working');
});

app.get('/test', (req, res) => {
    res.render('test');
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/videoID', (req, res) => {
    res.send(JSON.stringify(session.embedID));
})

app.post('/watch', (req, res) => {
    if (session.embedID == undefined || session.embedID == null){
        const url = parse(req.body.url, true);
        session.embedID = url.query.v;
    }
    res.render('watch');
});




