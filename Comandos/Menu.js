module.exports = {

name: "!menu",

async execute(sock,msg,text){

const from = msg.key.remoteJid

const menu = `
╭─ GUMBALL BOT

DOWNLOAD
!play
!yt
!tiktok
!insta

UTIL
!ping
!hora
!data
!calc

DIVERSÃO
!dado
!moeda
!piada
!ship

INFO
!bot
!criador

╰────────
`

sock.sendMessage(from,{text:menu})

}

}
