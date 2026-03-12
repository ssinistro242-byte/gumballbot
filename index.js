// index.js
const { default: makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

// Cria ou lê a sessão em session.json
const { state, saveCreds } = useSingleFileAuthState('./session.json');

function startBot() {
  const client = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  // Receber mensagens
  client.ev.on('messages.upsert', m => {
    const msg = m.messages[0];
    if(!msg.message) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if(!text) return;

    if(text.toLowerCase() === 'oi') {
      client.sendMessage(msg.key.remoteJid, { text: 'Fala, parceiro! Bot ativo 😉' });
    }
  });

  // Atualizações da conexão
  client.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'close') {
      const reason = (lastDisconnect?.error)?.output?.statusCode;
      console.log('Conexão fechada. Reason:', reason);

      if(reason !== DisconnectReason.loggedOut) {
        console.log('Tentando reconectar...');
        startBot();
      }
    } else if(connection === 'open') {
      console.log('Bot conectado ao WhatsApp ✅');
    }
  });

  // Salvar credenciais atualizadas
  client.ev.on('creds.update', saveCreds);
}

// Inicia o bot
startBot();
