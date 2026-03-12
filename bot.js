console.log("🚀 GumballBot iniciando...")

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const { Boom } = require("@hapi/boom")
const P = require("pino")
const axios = require("axios")
const ytdl = require("ytdl-core")

// proteção contra crash
process.on("uncaughtException", console.error)
process.on("unhandledRejection", console.error)

const usuariosIniciados = new Set()

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

sock.ev.on("connection.update", ({connection,lastDisconnect,qr})=>{

if(qr){
console.log("📱 ESCANEIE O QR:")
console.log("QR CODE:", qr)
}

if(connection==="open"){
console.log("✅ BOT CONECTADO")
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
if(!msg) return
if(!msg.message) return
if(msg.key.fromMe) return

const from = msg.key.remoteJid

const text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text ||
""

const args = text.trim().split(/ +/)
const command = args[0]?.toLowerCase()

console.log("📩", text)


// mensagem inicial 1 vez
if(!usuariosIniciados.has(from)){

usuariosIniciados.add(from)

await sock.sendMessage(from,{
text:`😺 Olá! Eu sou o *GumballBot*

"A vida é meio maluca… mas sempre dá pra rir!"

Digite *!menu* para ver os comandos.

🤖 criado por _pauloofc`
})

}


// MENU
if(command==="!menu"){

await sock.sendMessage(from,{
text:`🤖 *GUMBALL BOT*

📥 DOWNLOAD
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

⚙️ BOT
!menu
!voltar
!criador

━━━━━━━━━━━━━━
🤖 criado por _pauloofc`
})

}


// VOLTAR
if(command==="!voltar"){

await sock.sendMessage(from,{
text:"🔙 Voltando ao menu\nDigite *!menu*"
})

}


// CRIADOR
if(command==="!criador"){

await sock.sendMessage(from,{
text:"👑 Bot criado por _pauloofc"
})

}


// HORA
if(command==="!hora"){

await sock.sendMessage(from,{
text:`🕒 ${new Date().toLocaleTimeString()}`
})

}


// DATA
if(command==="!data"){

await sock.sendMessage(from,{
text:`📅 ${new Date().toLocaleDateString()}`
})

}


// PIADA
if(command==="!piada"){

try{

const r = await axios.get("https://official-joke-api.appspot.com/random_joke")

await sock.sendMessage(from,{
text:`😂 ${r.data.setup}\n\n${r.data.punchline}`
})

}catch{

sock.sendMessage(from,{text:"❌ erro pegar piada"})

}

}


// CEP
if(command==="!cep"){

const cep = args[1]
if(!cep) return

try{

const r = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)

await sock.sendMessage(from,{
text:`📍 ${r.data.logradouro}
${r.data.localidade} - ${r.data.uf}`
})

}catch{

sock.sendMessage(from,{text:"❌ erro buscar CEP"})

}

}


// CLIMA
if(command==="!clima"){

const cidade = args.slice(1).join(" ")
if(!cidade) return

try{

const r = await axios.get(`https://wttr.in/${cidade}?format=3`)

await sock.sendMessage(from,{
text:`🌤 ${r.data}`
})

}catch{

sock.sendMessage(from,{text:"❌ erro pegar clima"})

}

}


// YTMP3
if(command==="!ytmp3"){

const url = args[1]

if(!url || !ytdl.validateURL(url)){
return sock.sendMessage(from,{text:"❌ envie link válido do YouTube"})
}

try{

await sock.sendMessage(from,{text:"🎵 Baixando música..."})

const stream = ytdl(url,{filter:"audioonly"})

await sock.sendMessage(from,{
audio: stream,
mimetype:"audio/mpeg"
})

}catch(e){

console.log(e)

sock.sendMessage(from,{text:"❌ erro baixar música"})

}

}


// YTMP4
if(command==="!ytmp4"){

const url = args[1]

if(!url || !ytdl.validateURL(url)){
return sock.sendMessage(from,{text:"❌ envie link válido do YouTube"})
}

try{

await sock.sendMessage(from,{text:"🎬 Baixando vídeo..."})

const stream = ytdl(url,{quality:"18"})

await sock.sendMessage(from,{
video: stream
})

}catch(e){

console.log(e)

sock.sendMessage(from,{text:"❌ erro baixar vídeo"})

}

}


// STICKER
if(command==="!sticker"){

const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

if(!quoted?.imageMessage){

return sock.sendMessage(from,{
text:"📸 responda uma imagem com !sticker"
})

}

try{

const buffer = await sock.downloadMediaMessage(msg)

await sock.sendMessage(from,{
sticker: buffer
})

}catch(e){

console.log(e)

sock.sendMessage(from,{text:"❌ erro criar figurinha"})

}

}

})

}

startBot()

setInterval(()=>{
console.log("💓 BOT ONLINE")
},60000)
