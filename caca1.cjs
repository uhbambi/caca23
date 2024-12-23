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
    "kw": ":flag_kw:", "eg": ":flag_eg:", "cl": ":flag_cl:", "pe": ":flag_pe:", "ec": ":flag_ec:", "co": ":flag_co:", "ve": ":flag_ve:", "py": ":flag_py:",
    "uy": ":flag_uy:", "gt": ":flag_gt:", "hn": ":flag_hn:", "ni": ":flag_ni:", "cr": ":flag_cr:", "pa": ":flag_pa:", "sv": ":flag_sv:", "bo": ":flag_bo:",
    "py": ":flag_py:", "bs": ":flag_bs:", "jm": ":flag_jm:", "tt": ":flag_tt:", "ky": ":flag_ky:", "dm": ":flag_dm:", "bb": ":flag_bb:", "lc": ":flag_lc:",
    "ms": ":flag_ms:", "sx": ":flag_sx:", "bl": ":flag_bl:", "gp": ":flag_gp:", "mq": ":flag_mq:", "wf": ":flag_wf:", "pf": ":flag_pf:", "nc": ":flag_nc:",
    "sc": ":flag_sc:", "pm": ":flag_pm:", "mf": ":flag_mf:", "gf": ":flag_gf:", "tf": ":flag_tf:", "re": ":flag_re:", "bq": ":flag_bq:", "kp": ":flag_kp:",
    "kr": ":flag_kr:", "trans": ":flag_trans:", // Bandera Transgénero
    "zz": ":hammer_and_pick:" // Bandera desconocida, usamos el emoji de Martillo y Pico
};

// Configura el bot de Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1314014143044386877'; // Pon el ID de tu canal aquí

// Función para monitorear la página
const startBot = async () => {
  const browser = await puppeteer.launch({
    executablePath: puppeteer.executablePath(), // Obtiene la ruta automáticamente
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Importante para entornos sin GUI como Koyeb
  });

    const page = await browser.newPage();
    await page.goto('https://pixelplanet.fun/chat/907'); // URL de la página

    await page.waitForSelector('.chatmsg');  // Espera a que los mensajes estén disponibles

    // Exponer la función para enviar mensajes a Discord
    await page.exposeFunction('sendMessageToDiscord', async (message, username, time, countryCode) => {
        const filteredMessage = message.replace(/(@everyone|@here)/g, '[MENCIÓN FILTRADA]');
        const cleanMessage = filteredMessage.replace(/^.*?: (.*)$/, '$1').trim();
        const updatedMessage = cleanMessage.startsWith("#d,")
            ? `${cleanMessage} https://pixelplanet.fun/${cleanMessage}`
            : cleanMessage;

        const countryFlag = countryFlags[countryCode.toLowerCase()] || countryFlags['zz'];
        const formattedMessage = `${countryFlag} | **${username}** [${time}] \`${updatedMessage}\``;

        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send(formattedMessage);
    });

    // Observar los mensajes nuevos
    await page.evaluate(() => {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.matches('.chatmsg')) {
                            const time = node.querySelector('.chatts') ? node.querySelector('.chatts').innerText : 'Hora no disponible';
                            const user = node.querySelector('.chatname') ? node.querySelector('.chatname').innerText : 'Usuario no disponible';
                            const text = node.querySelector('.msg') ? node.querySelector('.msg').innerText : 'Mensaje no disponible';
                            const countryCode = node.querySelector('.chatflag') ? node.querySelector('.chatflag').getAttribute('title') : 'unknown';

                            window.sendMessageToDiscord(text, user, time, countryCode);
                        }
                    });
                }
            }
        });

        const container = document.querySelector('.chatmsg');
        if (container) {
            observer.observe(container.parentElement, { childList: true, subtree: true });
        }
    });
}

// Inicia el bot de Discord
client.once('ready', () => {
    console.log('Bot conectado a Discord');
    monitorPage();
});

// Iniciar sesión con el token del bot de Discord
client.login(DISCORD_TOKEN);

// Verificar si Google Chrome está instalado
const { exec } = require('child_process');
exec('which google-chrome', (err, stdout, stderr) => {
    if (err) {
        console.log('Error al verificar Google Chrome:', stderr);
    } else {
        console.log('Ruta de Google Chrome:', stdout);
    }
});

// Verificar si Chromium está instalado
exec('which chromium', (err, stdout, stderr) => {
    if (err) {
        console.log('Error al verificar Chromium:', stderr);
    } else {
        console.log('Ruta de Chromium:', stdout);
    }
});

