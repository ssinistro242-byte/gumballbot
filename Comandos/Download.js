const yts = require("yt-search")
const ytdl = require("ytdl-core")
const fs = require("fs")

module.exports = {

name: "!play",

async execute(sock,msg,text){

const from = msg.key.remoteJid

const query = text.replace("!play ","")

const search = await yts(query)

const video = search.videos[0]

sock.sendMessage(from,{text:"baixando "+video.title})

const stream = ytdl(video.url,{filter:"audioonly"})

const path = "./music.mp3"

stream.pipe(fs.createWriteStream(path))

stream.on("end", async()=>{

await sock.sendMessage(from,{
audio: fs.readFileSync(path),
mimetype:"audio/mp4"
})

fs.unlinkSync(path)

})

}

}
