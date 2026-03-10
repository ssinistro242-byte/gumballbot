const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState("auth")

const sock = makeWASocket({
auth: state
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update",(update)=>{

if(update.qr){
qrcode.generate(update.qr,{small:true})
}

})

sock.ev.on("messages.upsert", async ({ messages }) => {

const msg = messages[0]
if(!msg.message) return

const from = msg.key.remoteJid
const text = msg.message.conversation || ""

if(text === "!menu"){

await sock.sendMessage(from,{
text:"🐱 GumballBot online!"
})

}

})

}

startBot()
