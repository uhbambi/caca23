import puppeteer from 'puppeteer';
import { Client, GatewayIntentBits } from 'discord.js';

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
async function monitorPage() {
    const browser = await puppeteer.launch({ headless: false }); // Ejecuta Puppeteer
    const page = await browser.newPage();
    await page.goto('https://pixelplanet.fun/chat/907'); // Pon la URL de la página

    // Espera hasta que el contenedor de mensajes esté disponible
    await page.waitForSelector('.chatmsg'); // Esperamos al contenedor de mensajes

    // Expón una función para enviar mensajes a Discord
    await page.exposeFunction('sendMessageToDiscord', async (message, username, time, countryCode) => {
        // Filtra las menciones "everyone" y "here"
        const filteredMessage = message.replace(/(@everyone|@here)/g, '[MENCIÓN FILTRADA]'); // Reemplaza las menciones por un texto

        // Elimina la parte repetida en el mensaje (ejemplo "Portu: Portu:")
        const cleanMessage = filteredMessage.replace(/^.*?: (.*)$/, '$1').trim();

        // Si el mensaje comienza con '#d,' agrega el link de PixelPlanet
        const updatedMessage = cleanMessage.startsWith("#d,") 
            ? `${cleanMessage} https://pixelplanet.fun/${cleanMessage}` 
            : cleanMessage;

        // Obtener la bandera usando el código de país
        const countryFlag = countryFlags[countryCode.toLowerCase()] || countryFlags['zz']; // Usa el emoji de Martillo y Pico si no se encuentra el código

        // Formatea el mensaje con la bandera, nombre del usuario y la hora
        const formattedMessage = `${countryFlag} | **${username}** [${time}] \`${updatedMessage}\``;

        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send(formattedMessage); // Envía el mensaje formateado a Discord
    });

    // Inicia un MutationObserver para observar los nuevos mensajes
    await page.evaluate(() => {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.matches('.chatmsg')) { // Aseguramos que sea un nuevo mensaje
                            const time = node.querySelector('.chatts') ? node.querySelector('.chatts').innerText : 'Hora no disponible';
                            const user = node.querySelector('.chatname') ? node.querySelector('.chatname').innerText : 'Usuario no disponible';
                            const text = node.querySelector('.msg') ? node.querySelector('.msg').innerText : 'Mensaje no disponible';

                            // Extraer el código del país desde el atributo 'title' de la bandera
                            const countryCode = node.querySelector('.chatflag') ? node.querySelector('.chatflag').getAttribute('title') : 'unknown';

                            // Llama a la función expuesta para enviar el mensaje a Discord
                            window.sendMessageToDiscord(text, user, time, countryCode); 
                        }
                    });
                }
            }
        });

        // Comienza a observar el contenedor de mensajes (el nodo <li> con clase "chatmsg")
        const container = document.querySelector('.chatmsg');
        if (container) {
            observer.observe(container.parentElement, { childList: true, subtree: true });
        }
    });
}

// Inicia el bot de Discord
client.once('ready', () => {
    console.log('Bot conectado a Discord');
    monitorPage(); // Comienza a monitorear la página
});

client.login(DISCORD_TOKEN); // Inicia sesión con el token del bot