<<<<<<< HEAD
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
=======
console.log("🚀 BOT INICIANDO...")

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const { Boom } = require("@hapi/boom")
const P = require("pino")
const qrcode = require("qrcode-terminal")
const WebSocket = require("ws")
const https = require("https")

// proteção contra crash
process.on("uncaughtException", (err) => {
  console.error("❌ Erro não tratado:", err)
})

process.on("unhandledRejection", (reason) => {
  console.error("❌ Promise rejeitada:", reason)
})

let reconnectDelay = 2000

async function startBot() {

  try {

    const { state, saveCreds } = await useMultiFileAuthState("auth")

    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({

      auth: state,
      version,

      logger: P({ level: "silent" }),

      browser: ["Ubuntu", "Chrome", "120.0.0"],

      connectTimeoutMs: 60000,

      keepAliveIntervalMs: 20000,

      markOnlineOnConnect: true,

      syncFullHistory: false,

      printQRInTerminal: false,

      agent: new https.Agent({
        keepAlive: true,
        maxSockets: 1
      }),

      ws: WebSocket

    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {

      if (qr) {
        console.log("📱 ESCANEIE O QR:")
        qrcode.generate(qr, { small: true })
      }

      if (connection === "open") {

        console.log("✅ BOT CONECTADO")

        reconnectDelay = 2000

      }

      if (connection === "close") {

        const error = lastDisconnect?.error
        const code = error ? new Boom(error).output.statusCode : 0

        console.log(`⚠️ Conexão fechada (code=${code})`)

        if (code === DisconnectReason.loggedOut) {

          console.log("❌ Sessão encerrada. Apague a pasta 'auth' e reconecte.")

          return

        }

        console.log(`🔄 Reconectando em ${reconnectDelay / 1000}s...`)

        setTimeout(startBot, reconnectDelay)

        reconnectDelay = Math.min(reconnectDelay * 2, 30000)

      }

    })

    sock.ev.on("messages.upsert", async ({ messages }) => {

      const msg = messages?.[0]

      if (!msg) return
      if (!msg.message) return

      const from = msg.key.remoteJid

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        ""

      console.log("📩 Mensagem:", text)

      if (text === "!ping") {

        await sock.sendMessage(from, {
          text: "🏓 pong"
        })

      }

      if (text === "!menu") {

        await sock.sendMessage(from, {

          text:
`🤖 GumballBot Online

Comandos:

!menu
!ping
`

        })

      }

    })

  }

  catch (err) {

    console.error("❌ Erro ao iniciar:", err)

    console.log("🔁 Reiniciando em 5 segundos...")

    setTimeout(startBot, 5000)

  }
>>>>>>> 12188c0 (primeira versão do bot)

}

startBot()
<<<<<<< HEAD
=======

// heartbeat para manter o bot ativo
setInterval(() => {

  console.log("💓 BOT ONLINE", new Date().toLocaleTimeString())

}, 60000)
>>>>>>> 12188c0 (primeira versão do bot)
