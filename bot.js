console.log("🚀 Iniciando GumballBot...")

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const P = require("pino")
const qrcode = require("qrcode-terminal")
const { Boom } = require("@hapi/boom")
const fs = require("fs")

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

console.clear()

console.log("===================================")
console.log("📱 ESCANEIE O QR CODE NO WHATSAPP")
console.log("===================================\n")

// QR CODE EM TEXTO (ASCII)
qrcode.generate(qr, {
small: false
})

console.log("\n⏳ Tempo para escanear: 1 MINUTO\n")

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


// CARREGAR COMANDOS
const pastas = [
"./comandos",
"./comandos/util",
"./comandos/download",
"./comandos/diversao",
"./comandos/figurinhas"
]

for(const pasta of pastas){

if(!fs.existsSync(pasta)) continue

const arquivos = fs.readdirSync(pasta)

for(const file of arquivos){

const cmd = require(`${pasta}/${file}`)

if(cmd.name === command){

cmd.execute(sock, msg, args, text)

}

}

}

})

}

startBot()

setInterval(()=>{
console.log("💓 BOT ONLINE")
},60000)
