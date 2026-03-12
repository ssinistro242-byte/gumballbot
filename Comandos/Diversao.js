module.exports = {

name: "!dado",

async execute(sock,msg){

const from = msg.key.remoteJid

const n = Math.floor(Math.random()*6)+1

sock.sendMessage(from,{text:"🎲 "+n})

}

}
