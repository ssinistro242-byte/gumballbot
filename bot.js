const {
default: makeWASocket,
useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const fs = require("fs")

async function startBot(){

const { state, saveCreds } =
await useMultiFileAuthState("./auth")

const sock = makeWASocket({
logger: pino({ level:"silent" }),
auth: state
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async(update)=>{

const { connection, qr } = update

if(qr){

console.log("ESCANEIE O QR CODE:")
console.log(qr)

console.log("TEM 1 MINUTO")

await new Promise(r=>setTimeout(r,60000))

}

if(connection === "open"){
console.log("BOT ONLINE")
}

if(connection === "close"){
startBot()
}

})

sock.ev.on("messages.upsert", async({messages})=>{

const msg = messages[0]

if(!msg.message) return

const from = msg.key.remoteJid

const text =
msg.message.conversation ||
msg.message.extendedTextMessage?.text ||
""

const command = text.split(" ")[0].toLowerCase()

// carregar comandos

const comandos = fs.readdirSync("./comandos")

for(const file of comandos){

const cmd = require(`./comandos/${file}`)

if(cmd.name === command){

cmd.execute(sock,msg,text)

}

}

})

}

startBot()
