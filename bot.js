console.log("🚀 GumballBot iniciando")

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const { Boom } = require("@hapi/boom")
const P = require("pino")
const qrcode = require("qrcode-terminal")
const axios = require("axios")

process.on("uncaughtException", console.error)
process.on("unhandledRejection", console.error)

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState("auth")

const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger:P({level:"silent"}),
auth:state
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", ({connection,lastDisconnect,qr})=>{

if(qr){
console.log("📱 ESCANEIE O QR")
qrcode.generate(qr,{small:true})
}

if(connection==="open"){
console.log("✅ BOT CONECTADO")
}

if(connection==="close"){

const shouldReconnect =
(lastDisconnect.error = new Boom(lastDisconnect?.error))?.output?.statusCode !== DisconnectReason.loggedOut

if(shouldReconnect){
console.log("🔄 reconectando")
startBot()
}

}

})

sock.ev.on("messages.upsert", async ({messages})=>{

const msg = messages[0]

if(!msg) return
if(!msg.message) return
if(msg.key.fromMe) return

const from = msg.key.remoteJid

const text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text ||
""

const args = text.split(" ")
const command = args[0].toLowerCase()

console.log("📩",text)

if(!text.startsWith("!")){

await sock.sendMessage(from,{
text:`😺 Olá! Eu sou o *GumballBot*

"Às vezes a vida é maluca… mas sempre dá pra rir!"

Digite *!menu*

🤖 bot criado por _pauloofc`
})

return

}

if(command==="!menu"){

await sock.sendMessage(from,{
text:`🤖 *GUMBALL BOT*

🎵 DOWNLOAD
!play nome
!ytmp3 link
!ytmp4 link
!tiktok link
!instagram link

🖼 FIGURINHA
(responda imagem)
!sticker

🌎 UTILIDADES
!hora
!data
!clima cidade
!cep numero
!ip
!piada

👑 BOT
!criador`
})

}

if(command==="!criador"){

await sock.sendMessage(from,{
text:"👑 Bot criado por _pauloofc"
})

}

if(command==="!hora"){

await sock.sendMessage(from,{
text:`🕒 ${new Date().toLocaleTimeString()}`
})

}

if(command==="!data"){

await sock.sendMessage(from,{
text:`📅 ${new Date().toLocaleDateString()}`
})

}

if(command==="!ip"){

const r = await axios.get("https://api64.ipify.org?format=json")

await sock.sendMessage(from,{
text:`🌐 IP: ${r.data.ip}`
})

}

if(command==="!piada"){

const r = await axios.get("https://official-joke-api.appspot.com/random_joke")

await sock.sendMessage(from,{
text:`😂 ${r.data.setup}\n\n${r.data.punchline}`
})

}

if(command==="!cep"){

const cep = args[1]

if(!cep) return

const r = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)

await sock.sendMessage(from,{
text:`📍 ${r.data.logradouro}
${r.data.localidade} - ${r.data.uf}`
})

}

if(command==="!clima"){

const cidade = args.slice(1).join(" ")

if(!cidade) return

const r = await axios.get(`https://wttr.in/${cidade}?format=3`)

await sock.sendMessage(from,{
text:`🌤 ${r.data}`
})

}

if(command==="!play"){

const nome = args.slice(1).join(" ")

if(!nome) return

try{

const r = await axios.get(`https://api.popcat.xyz/yt?q=${nome}`)

await sock.sendMessage(from,{
audio:{url:r.data.url},
mimetype:"audio/mpeg"
})

}catch{

await sock.sendMessage(from,{
text:"❌ erro baixar música"
})

}

}

if(command==="!ytmp3"){

const url = args[1]

if(!url) return

try{

const r = await axios.get(`https://api.popcat.xyz/ytmp3?url=${url}`)

await sock.sendMessage(from,{
audio:{url:r.data.url},
mimetype:"audio/mpeg"
})

}catch{

await sock.sendMessage(from,{
text:"❌ erro download"
})

}

}

if(command==="!ytmp4"){

const url = args[1]

if(!url) return

try{

const r = await axios.get(`https://api.popcat.xyz/ytmp4?url=${url}`)

await sock.sendMessage(from,{
video:{url:r.data.url}
})

}catch{

await sock.sendMessage(from,{
text:"❌ erro baixar vídeo"
})

}

}

if(command==="!tiktok"){

const url = args[1]

if(!url) return

await sock.sendMessage(from,{
text:`📥 Baixe aqui:\nhttps://snaptik.app`
})

}

if(command==="!instagram"){

const url = args[1]

if(!url) return

await sock.sendMessage(from,{
text:`📥 Baixe aqui:\nhttps://snapinsta.app`
})

}

if(command==="!sticker"){

const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage

if(!quoted?.imageMessage){

return sock.sendMessage(from,{
text:"📸 responda uma imagem com !sticker"
})

}

const buffer = await sock.downloadMediaMessage({
message:{imageMessage:quoted.imageMessage}
})

await sock.sendMessage(from,{
sticker:buffer
})

}

})

}

startBot()

setInterval(()=>{
console.log("💓 BOT ONLINE")
},60000)
