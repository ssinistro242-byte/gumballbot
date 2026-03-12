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

// proteção contra crash
process.on("uncaughtException", console.error)
process.on("unhandledRejection", console.error)

// salvar usuários que já receberam mensagem inicial
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
console.log("🔄 reconectando...")
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
const command = args[0].toLowerCase()

console.log("📩",text)


// mensagem inicial só uma vez
if(!usuariosIniciados.has(from)){

usuariosIniciados.add(from)

await sock.sendMessage(from,{
text:`😺 Olá! Eu sou o *GumballBot*

"A vida é meio maluca… mas sempre dá pra rir!"

Digite *!menu* para ver meus comandos.

🤖 criado por _pauloofc`
})

}


// MENU
if(command==="!menu"){

await sock.sendMessage(from,{
text:`🤖 *GUMBALL BOT*

📥 DOWNLOAD
!play nome
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


// VOLTAR MENU
if(command==="!voltar"){

await sock.sendMessage(from,{
text:`🔙 Voltando ao menu

Digite *!menu*`
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
text:`😂 ${r.data.setup}

${r.data.punchline}`
})

}catch{

await sock.sendMessage(from,{
text:"❌ erro buscar piada"
})

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

await sock.sendMessage(from,{
text:"❌ erro buscar CEP"
})

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

await sock.sendMessage(from,{
text:"❌ erro clima"
})

}

}


// PLAY MUSICA
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


// YTMP3
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


// YTMP4
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


// STICKER
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
