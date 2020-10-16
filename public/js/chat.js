
// to-do: broadcast the controler
// toggle classList
const socket = io();
let controller = false;
let state;


socket.on('join', message => {
    document.querySelector("#message").innerText = message.joinMessage;
    // if (message.master){
    //     controller = true;

    // } else {
    //     document.querySelector('iframe').classList.add('okok')
    // }

});

function getVideoId() {
    return videoID
}

document.querySelector('#msgForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.input.value;
    e.target.elements.input.value = '';
    socket.emit('update', message);
});

let chatWindow = document.querySelector('.chat');

socket.on('chatUpdated', message => {
    let p = document.createElement('p');   
    p.innerText = message;
    chatWindow.appendChild(p);
});

const updateState = (e) => {
    
    if (e.data == YT.PlayerState.BUFFERING || controller === false){
    }
    else if (e.data == YT.PlayerState.PLAYING){
        state = YT.PlayerState.PLAYING       
    } else if (e.data == YT.PlayerState.PAUSED) {
        state = YT.PlayerState.PAUSED   
    }
}


const syncUp = () => {
    socket.emit('sync');
}

socket.on('getTime', () => {
    const time = player.getCurrentTime();
    socket.emit('sendTime', {time, state});
});

socket.on('setTime', ({time, state: s}) => {
    console.log('here')
    player.seekTo(time);
    if (s == YT.PlayerState.PLAYING){
        player.playVideo();
        state = s;   
    } else if (s == YT.PlayerState.PAUSED) {
        player.pauseVideo();
        state = s;
    }
});

document.querySelector('.sync').addEventListener('click', (e) => {
    //e.preventDefault();
    syncUp();
})

socket.on('loseControl', () => {
    controller = false;
    document.querySelector('iframe').classList.remove('okok')
})

