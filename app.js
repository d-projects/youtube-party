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

/**
 * Handles the websocket connections
 */

io.on('connection', socket => {

    console.log('Webscoket connection working');
    const user = "user";
    if (!session.master){
        session.users = 0;
        
        session.master = socket;
    }
    session.users += 1;
    console.log(session.users)
    console.log(session.embedID);


    socket.emit('join', {
        joinMessage: "Welcome",
        videoID: session.embedID,
        master: (session.master == socket) ? true : false
    });
    socket.broadcast.emit('join', {
        joinMessage: `${user} has joined the chat`
    });

    socket.on('updateChat', message => {
        io.emit('chatUpdated', message);
    });


    socket.on('sendTime', (info) => {

        session.temp.emit('setTime', info);
        session.temp = null;

    });

    socket.on('sync', () => {

        if (session.master != socket) {
            session.master.emit('getTime');
            session.temp = socket;
        }

    });

    socket.on('disconnect', () => {
        session.users--;
        console.log(session.users)
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

/**
 * Used by Fetch API to get youtube video ID
 */

app.get('/videoID', (req, res) => {
    res.send(JSON.stringify(session.embedID));
})

/**
 * Home Page
 */

app.get('/', (req, res) => {
    res.render('index', {title: 'Home'});
});

/**
 * Synced Video Page
 */

app.post('/watch', (req, res) => {
    if (session.embedID == undefined || session.embedID == null){
        const url = parse(req.body.url, true);
        session.embedID = url.query.v;
    }
    res.render('watch', {title: 'Watch'});
});




