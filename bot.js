console.log("🚀 Iniciando GumballBot...")

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const P = require("pino")
const axios = require("axios")
const yts = require("yt-search")
const qrcode = require("qrcode-terminal")
const { Boom } = require("@hapi/boom")

// proteção contra crash
process.on("uncaughtException", console.error)
process.on("unhandledRejection", console.error)

const usuarios = new Set()

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState("auth")
const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger: P({ level:"silent" }),
auth: state,
printQRInTerminal:false
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async (update)=>{

const { connection, qr, lastDisconnect } = update

if (qr) {

console.log("📱 ESCANEIE O QR:")
console.log("QR CODE:", qr)

console.log("⏳ Você tem 1 minuto para escanear...")

await new Promise(resolve => setTimeout(resolve, 60000))

}

if(connection==="open"){
console.log("✅ GumballBot conectado!")
}

if(connection==="close"){

const shouldReconnect =
(lastDisconnect?.error instanceof Boom ?
lastDisconnect.error.output.statusCode :
0) !== DisconnectReason.loggedOut

if(shouldReconnect){
console.log("🔄 Reconectando...")
startBot()
}

}

})

sock.ev.on("messages.upsert", async ({messages})=>{

const msg = messages[0]
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


// mensagem inicial
if(!usuarios.has(from)){

usuarios.add(from)

await sock.sendMessage(from,{
text:`╔══════════════╗
  𝙂𝙐𝙈𝘽𝘼𝙇𝙇 𝘽𝙊𝙏 😺
╚══════════════╝

"Às vezes a vida é maluca… mas sempre dá pra rir!"

Digite:
➜ !menu

🤖 criado por _pauloofc`
})

}


// MENU
if(command==="!menu"){

await sock.sendMessage(from,{
text:`╔══════════════╗
     𝙈𝙀𝙉𝙐
╚══════════════╝

🎵 DOWNLOAD
!play musica
!ytmp3 link
!ytmp4 link

🖼 FIGURINHAS
(responda imagem)
!sticker

🌎 UTILIDADES
!clima cidade
!cep numero
!hora
!data
!piada

⚙ BOT
!menu
!voltar
!criador

━━━━━━━━━━━━━━
🤖 _pauloofc`
})

}


// VOLTAR
if(command==="!voltar"){

sock.sendMessage(from,{
text:"🔙 Voltando ao menu\nDigite !menu"
})

}


// CRIADOR
if(command==="!criador"){

sock.sendMessage(from,{
text:"👑 Bot criado por _pauloofc"
})

}


// HORA
if(command==="!hora"){

sock.sendMessage(from,{
text:`🕒 ${new Date().toLocaleTimeString()}`
})

}


// DATA
if(command==="!data"){

sock.sendMessage(from,{
text:`📅 ${new Date().toLocaleDateString()}`
})

}


// PIADA
if(command==="!piada"){

try{

const r = await axios.get("https://official-joke-api.appspot.com/random_joke")

sock.sendMessage(from,{
text:`😂 ${r.data.setup}\n${r.data.punchline}`
})

}catch{

sock.sendMessage(from,{text:"erro pegar piada"})

}

}


// CEP
if(command==="!cep"){

const cep = args[1]

if(!cep) return

try{

const r = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)

sock.sendMessage(from,{
text:`📍 ${r.data.logradouro}
${r.data.localidade} - ${r.data.uf}`
})

}catch{

sock.sendMessage(from,{text:"erro buscar cep"})

}

}


// CLIMA
if(command==="!clima"){

const cidade = args.slice(1).join(" ")

if(!cidade) return

try{

const r = await axios.get(`https://wttr.in/${cidade}?format=3`)

sock.sendMessage(from,{
text:`🌤 ${r.data}`
})

}catch{

sock.sendMessage(from,{text:"erro clima"})

}

}


// PLAY MUSICA
if(command==="!play"){

const nome = args.slice(1).join(" ")

if(!nome) return

try{

sock.sendMessage(from,{text:"🔎 Procurando música..."})

const r = await yts(nome)

const video = r.videos[0]

sock.sendMessage(from,{
text:`🎵 ${video.title}
${video.url}

Use:
!ytmp3 ${video.url}`
})

}catch{

sock.sendMessage(from,{text:"erro buscar musica"})

}

}


// YTMP3
if(command==="!ytmp3"){

const url = args[1]

if(!url) return

sock.sendMessage(from,{
text:`🎧 Baixe aqui:

https://api.vevioz.com/api/button/mp3/${url}`
})

}


// YTMP4
if(command==="!ytmp4"){

const url = args[1]

if(!url) return

sock.sendMessage(from,{
text:`🎬 Baixe aqui:

https://api.vevioz.com/api/button/videos/${url}`
})

}


// STICKER
if(command==="!sticker"){

sock.sendMessage(from,{
text:"📸 Envie uma imagem com legenda !sticker (feature simples)"
})

}

})

}

startBot()

setInterval(()=>{
console.log("💓 BOT ONLINE")
},60000)
