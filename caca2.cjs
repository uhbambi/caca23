const puppeteer = require('puppeteer');
const { Client, GatewayIntentBits } = require('discord.js');

// Mapeo de códigos de país a banderas en formato código de país
const countryFlags = {
    "do": ":flag_do:", "us": ":flag_us:", "mx": ":flag_mx:", "es": ":flag_es:", "fr": ":flag_fr:", "de": ":flag_de:", "br": ":flag_br:", "ar": ":flag_ar:",
    "it": ":flag_it:", "jp": ":flag_jp:", "ca": ":flag_ca:", "gb": ":flag_gb:", "ru": ":flag_ru:", "cn": ":flag_cn:", "in": ":flag_in:", "au": ":flag_au:",
    "za": ":flag_za:", "kr": ":flag_kr:", "ng": ":flag_ng:", "pl": ":flag_pl:", "se": ":flag_se:", "no": ":flag_no:", "fi": ":flag_fi:", "dk": ":flag_dk:",
    "nl": ":flag_nl:", "ch": ":flag_ch:", "be": ":flag_be:", "at": ":flag_at:", "cz": ":flag_cz:", "gr": ":flag_gr:", "hu": ":flag_hu:", "ro": ":flag_ro:",
    "bg": ":flag_bg:", "il": ":flag_il:", "hr": ":flag_hr:", "pk": ":flag_pk:", "ke": ":flag_ke:", "sa": ":flag_sa:", "th": ":flag_th:", "ae": ":flag_ae:",
    "my": ":flag_my:", "ph": ":flag_ph:", "id": ":flag_id:", "vn": ":flag_vn:", "ua": ":flag_ua:", "kw": ":flag_kw:", "qa": ":flag_qa:", "om": ":flag_om:",
    "eg": ":flag_eg:", "cl": ":flag_cl:", "pe": ":flag_pe:", "ec": ":flag_ec:", "co": ":flag_co:", "ve": ":flag_ve:", "py": ":flag_py:", "uy": ":flag_uy:",
    "zz": ":hammer_and_pick:" // Bandera desconocida
};

// Configuración del cliente Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1314014143044386877'; // Cambia esto por tu canal

// Ruta de Google Chrome
const chromePath = '/usr/bin/google-chrome'; // Aquí coloca la ruta a tu instalación de Chrome, si no está en este directorio.

// Monitorear la página
const startBot = async () => {
  const browser = await puppeteer.launch({
    executablePath: puppeteer.executablePath(), // Obtiene la ruta automáticamente
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Importante para entornos sin GUI como Koyeb
  });

    const page = await browser.newPage();
    await page.goto('https://pixelplanet.fun/chat/1');

    // Esperar el contenedor de mensajes
    await page.waitForSelector('.chatmsg');

    // Exponer función para enviar mensajes a Discord
    await page.exposeFunction('sendMessageToDiscord', async (message, username, time, countryCode, type) => {
        if (username.toLowerCase() === 'sallbot' || type === 'event') {
            const cleanMessage = message.replace(/(@everyone|@here)/g, '[MENCIÓN FILTRADA]').trim();
            const updatedMessage = cleanMessage.startsWith("#d,") ? `${cleanMessage} https://pixelplanet.fun/${cleanMessage}` : cleanMessage;

            const countryFlag = countryFlags[countryCode.toLowerCase()] || countryFlags['zz'];
            const formattedMessage = type === 'event'
                ? `:robot: | **Evento** [${time}] \`${updatedMessage}\``
                : `${countryFlag} | **${username}** [${time}] \`${updatedMessage}\``;

            const channel = await client.channels.fetch(CHANNEL_ID);
            await channel.send(formattedMessage);
        }
    });

    // Configurar MutationObserver
    await page.evaluate(() => {
        const observer = new MutationObserver(mutationsList => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.matches('.chatmsg')) {
                            const time = node.querySelector('.chatts')?.innerText || 'Hora no disponible';
                            const user = node.querySelector('.chatname')?.innerText || 'Usuario desconocido';
                            const text = node.querySelector('.msg')?.innerText || 'Mensaje vacío';
                            const type = node.querySelector('.msg.event') ? 'event' : 'message';
                            const countryCode = node.querySelector('.chatflag')?.getAttribute('title') || 'unknown';

                            window.sendMessageToDiscord(text, user, time, countryCode, type);
                        }
                    });
                }
            }
        });

        const container = document.querySelector('.chatmsg');
        if (container) observer.observe(container.parentElement, { childList: true, subtree: true });
    });
}

// Verificar instalación de Chrome/Chromium
const { exec } = require('child_process');
exec('which google-chrome', (err, stdout, stderr) => {
    if (err) console.log('Google Chrome no encontrado:', stderr.trim());
    else console.log('Google Chrome encontrado:', stdout.trim());
});

exec('which chromium', (err, stdout, stderr) => {
    if (err) console.log('Chromium no encontrado:', stderr.trim());
    else console.log('Chromium encontrado:', stdout.trim());
});

// Inicializar el bot
client.once('ready', () => {
    console.log('Bot conectado a Discord');
    monitorPage().catch(console.error);
});

client.login(DISCORD_TOKEN);
