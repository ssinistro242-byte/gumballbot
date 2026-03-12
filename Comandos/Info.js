module.exports = {

name: "!bot",

async execute(sock,msg){

const from = msg.key.remoteJid

sock.sendMessage(from,{text:"Gumball Bot online"})

}

}
