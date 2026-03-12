console.log("🚀 GUMBALL BOT INICIANDO...")

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const { Boom } = require("@hapi/boom")
const P = require("pino")
const fetch = require("node-fetch")
const https = require("https")
const WebSocket = require("ws")

process.on("uncaughtException",err=>console.log(err))
process.on("unhandledRejection",err=>console.log(err))

let reconnectDelay = 2000

async function startBot(){

try{

const {state,saveCreds} = await useMultiFileAuthState("auth")

const {version} = await fetchLatestBaileysVersion()

const sock = makeWASocket({

auth: state,
version,

logger: P({level:"silent"}),

browser:["Ubuntu","Chrome","120.0.0"],

connectTimeoutMs:60000,

keepAliveIntervalMs:20000,

markOnlineOnConnect:true,

syncFullHistory:false,

printQRInTerminal:false,

agent:new https.Agent({
keepAlive:true,
maxSockets:1
}),

ws:WebSocket

})

sock.ev.on("creds.update",saveCreds)

sock.ev.on("connection.update",({connection,lastDisconnect,qr})=>{

if(qr){
console.log("📱 ESCANEIE O QR:")
console.log("QR CODE:",qr)
}

if(connection==="open"){
console.log("✅ BOT CONECTADO")
reconnectDelay=2000
}

if(connection==="close"){

const error=lastDisconnect?.error
const code=error?new Boom(error).output.statusCode:0

if(code===DisconnectReason.loggedOut){
console.log("❌ sessão encerrada apague pasta auth")
return
}

console.log("🔄 reconectando...")

setTimeout(startBot,reconnectDelay)

reconnectDelay=Math.min(reconnectDelay*2,30000)

}

})

sock.ev.on("messages.upsert",async({messages})=>{

const msg=messages?.[0]
if(!msg) return
if(!msg.message) return

const from=msg.key.remoteJid

const text=
msg.message.conversation||
msg.message.extendedTextMessage?.text||
""

if(!text) return

const command=text.split(" ")[0]

console.log("📩",text)

if(text==="oi"||text==="ola"){
await sock.sendMessage(from,{
text:`😺 Olá!

Eu sou o *GumballBot*

"A vida pode ser estranha… mas sempre pode ficar divertida."

Digite *!menu*

🤖 Bot criado por _pauloofc`
})
}

if(command==="!menu"){
await sock.sendMessage(from,{
text:`😺 *GUMBALL BOT*

⚙️ Sistema
!ping
!hora
!data
!criador
!id

🌎 Utilidades
!clima cidade
!cep numero
!dolar
!traduz texto

🎲 Diversão
!dado
!moeda
!chance
!numero
!piada
!fato
!conselho

🎮 Jogos
!math
!quiz
!adivinhar

📥 Downloads
!yt link
!ytmp3 link
!tiktok link

🤖 Criado por _pauloofc`
})
}

if(command==="!ping"){
await sock.sendMessage(from,{text:"🏓 pong"})
}

if(command==="!hora"){
await sock.sendMessage(from,{text:`⏰ ${new Date().toLocaleTimeString()}`})
}

if(command==="!data"){
await sock.sendMessage(from,{text:`📅 ${new Date().toLocaleDateString()}`})
}

if(command==="!criador"){
await sock.sendMessage(from,{text:"🤖 bot criado por _pauloofc"})
}

if(command==="!id"){
await sock.sendMessage(from,{text:`🆔 ${from}`})
}

if(command==="!dado"){
let n=Math.floor(Math.random()*6)+1
await sock.sendMessage(from,{text:`🎲 ${n}`})
}

if(command==="!moeda"){
let r=Math.random()<0.5?"cara":"coroa"
await sock.sendMessage(from,{text:`🪙 ${r}`})
}

if(command==="!chance"){
let n=Math.floor(Math.random()*100)
await sock.sendMessage(from,{text:`🎯 ${n}%`})
}

if(command==="!numero"){
let n=Math.floor(Math.random()*100)
await sock.sendMessage(from,{text:`🔢 ${n}`})
}

if(command==="!piada"){
try{
let res=await fetch("https://official-joke-api.appspot.com/random_joke")
let data=await res.json()
await sock.sendMessage(from,{text:`😂 ${data.setup}\n\n${data.punchline}`})
}catch{
sock.sendMessage(from,{text:"erro piada"})
}
}

if(command==="!conselho"){
try{
let res=await fetch("https://api.adviceslip.com/advice")
let data=await res.json()
await sock.sendMessage(from,{text:`💡 ${data.slip.advice}`})
}catch{
sock.sendMessage(from,{text:"erro conselho"})
}
}

if(command==="!fato"){
try{
let res=await fetch("https://uselessfacts.jsph.pl/random.json?language=en")
let data=await res.json()
await sock.sendMessage(from,{text:`📚 ${data.text}`})
}catch{
sock.sendMessage(from,{text:"erro fato"})
}
}

if(command==="!clima"){

let cidade=text.split(" ").slice(1).join(" ")

if(!cidade){
return sock.sendMessage(from,{text:"use !clima cidade"})
}

try{

let res=await fetch(`https://wttr.in/${cidade}?format=j1`)
let data=await res.json()

let temp=data.current_condition[0].temp_C
let desc=data.current_condition[0].weatherDesc[0].value
let hum=data.current_condition[0].humidity

await sock.sendMessage(from,{
text:`🌤️ Clima em ${cidade}

🌡️ Temperatura: ${temp}°C
☁️ Condição: ${desc}
💧 Umidade: ${hum}%`
})

}catch{

sock.sendMessage(from,{text:"erro clima"})

}
}

if(command==="!cep"){

let cep=text.split(" ")[1]

try{

let res=await fetch(`https://viacep.com.br/ws/${cep}/json/`)
let data=await res.json()

await sock.sendMessage(from,{
text:`📍 CEP ${cep}

Rua: ${data.logradouro}
Bairro: ${data.bairro}
Cidade: ${data.localidade}
Estado: ${data.uf}`
})

}catch{

sock.sendMessage(from,{text:"erro cep"})

}
}

if(command==="!dolar"){
try{
let res=await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL")
let data=await res.json()
await sock.sendMessage(from,{text:`💰 dólar: R$ ${data.USDBRL.bid}`})
}catch{
sock.sendMessage(from,{text:"erro dolar"})
}
}

if(command==="!traduz"){

let texto=text.split(" ").slice(1).join(" ")

try{

let res=await fetch(`https://api.mymemory.translated.net/get?q=${texto}&langpair=en|pt`)
let data=await res.json()

await sock.sendMessage(from,{text:`🌎 ${data.responseData.translatedText}`})

}catch{

sock.sendMessage(from,{text:"erro tradução"})

}
}

if(command==="!yt"){

let url=text.split(" ")[1]

try{

let res=await fetch(`https://api.tiklydown.eu.org/api/download/youtube?url=${url}`)
let data=await res.json()

await sock.sendMessage(from,{
video:{url:data.video},
caption:"📥 youtube download"
})

}catch{
sock.sendMessage(from,{text:"erro download"})
}

}

if(command==="!ytmp3"){

let url=text.split(" ")[1]

try{

let res=await fetch(`https://api.tiklydown.eu.org/api/download/youtube?url=${url}`)
let data=await res.json()

await sock.sendMessage(from,{
audio:{url:data.audio},
mimetype:"audio/mp4"
})

}catch{
sock.sendMessage(from,{text:"erro mp3"})
}

}

if(command==="!tiktok"){

let url=text.split(" ")[1]

try{

let res=await fetch(`https://api.tiklydown.eu.org/api/download/tiktok?url=${url}`)
let data=await res.json()

await sock.sendMessage(from,{
video:{url:data.video},
caption:"📥 tiktok download"
})

}catch{
sock.sendMessage(from,{text:"erro tiktok"})
}

}

})

}catch(err){

console.log("erro iniciar",err)

setTimeout(startBot,5000)

}

}

startBot()

setInterval(()=>{
console.log("💓 BOT ONLINE")
},60000)
