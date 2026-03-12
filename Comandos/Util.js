module.exports = {

name: "!ping",

async execute(sock,msg){

const from = msg.key.remoteJid

sock.sendMessage(from,{text:"pong"})

}

}
