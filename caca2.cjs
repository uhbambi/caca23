import puppeteer from 'puppeteer';
import { Client, GatewayIntentBits } from 'discord.js';

// Mapeo de c贸digos de pa铆s a banderas en formato c贸digo de pa铆s
const countryFlags = {
    "do": ":flag_do:", "us": ":flag_us:", "mx": ":flag_mx:", "es": ":flag_es:", "fr": ":flag_fr:", "de": ":flag_de:", "br": ":flag_br:", "ar": ":flag_ar:",
    "it": ":flag_it:", "jp": ":flag_jp:", "ca": ":flag_ca:", "gb": ":flag_gb:", "ru": ":flag_ru:", "cn": ":flag_cn:", "in": ":flag_in:", "au": ":flag_au:",
    "za": ":flag_za:", "kr": ":flag_kr:", "ng": ":flag_ng:", "pl": ":flag_pl:", "se": ":flag_se:", "no": ":flag_no:", "fi": ":flag_fi:", "dk": ":flag_dk:",
    "nl": ":flag_nl:", "ch": ":flag_ch:", "be": ":flag_be:", "at": ":flag_at:", "cz": ":flag_cz:", "gr": ":flag_gr:", "hu": ":flag_hu:", "ro": ":flag_ro:",
    "bg": ":flag_bg:", "il": ":flag_il:", "hr": ":flag_hr:", "pk": ":flag_pk:", "ke": ":flag_ke:", "sa": ":flag_sa:", "th": ":flag_th:", "ae": ":flag_ae:",
    "my": ":flag_my:", "ph": ":flag_ph:", "id": ":flag_id:", "vn": ":flag_vn:", "ua": ":flag_ua:", "kw": ":flag_kw:", "qa": ":flag_qa:", "om": ":flag_om:",
    "eg": ":flag_eg:", "cl": ":flag_cl:", "pe": ":flag_pe:", "ec": ":flag_ec:", "co": ":flag_co:", "ve": ":flag_ve:", "py": ":flag_py:", "uy": ":flag_uy:",
    "zz": ":hammer_and_pick:" // Bandera desconocida, usamos el emoji de Martillo y Pico
};

// Configura el bot de Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1314014240163500082'; // Sustituye con el ID de tu canal

// Funci贸n para monitorear la p谩gina con eventos
async function monitorPageWithEvents() {
    const browser = await puppeteer.launch({ headless: false }); // Ejecuta Puppeteer
    const page = await browser.newPage();
    await page.goto('https://pixelplanet.fun/chat/1'); // URL del chat

    // Espera hasta que el contenedor de mensajes est茅 disponible
    await page.waitForSelector('.chatmsg');

    // Exp贸n una funci贸n para enviar mensajes a Discord
    await page.exposeFunction('sendMessageToDiscord', async (message, username, time, countryCode, type) => {
        // Filtrar mensajes solo de 'Sallbot' y de tipo 'event'
        if (username.toLowerCase() !== 'sallbot' && type !== 'event') {
            return; // Ignora otros mensajes
        }

        // Filtra las menciones "everyone" y "here"
        const filteredMessage = message.replace(/(@everyone|@here)/g, '[MENCI脫N FILTRADA]');

        // Elimina redundancias en el mensaje (ejemplo "Portu: Portu:")
        const cleanMessage = filteredMessage.replace(/^.*?: (.*)$/, '$1').trim();

        // Si el mensaje comienza con '#d,' agrega el link de PixelPlanet
        const updatedMessage = cleanMessage.startsWith("#d,") 
            ? `${cleanMessage} https://pixelplanet.fun/${cleanMessage}` 
            : cleanMessage;

        // Obtener la bandera usando el c贸digo de pa铆s
        const countryFlag = countryFlags[countryCode.toLowerCase()] || countryFlags['zz'];

        // Formatear mensaje seg煤n el tipo
        const formattedMessage = type === 'event'
            ? `:robot: | **Event** [${time}] \`${updatedMessage}\``
            : `${countryFlag} | **${username}** [${time}] \`${updatedMessage}\``;

        // Enviar mensaje al canal de Discord
        const channel = await client.channels.fetch(CHANNEL_ID);
        await channel.send(formattedMessage);
    });

    // Inicia un MutationObserver para observar los nuevos mensajes
    await page.evaluate(() => {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.matches('.chatmsg')) {
                            const time = node.querySelector('.chatts')?.innerText || 'Hora no disponible';
                            const user = node.querySelector('.chatname')?.innerText || 'Usuario no disponible';
                            const text = node.querySelector('.msg')?.innerText || 'Mensaje no disponible';
                            const type = node.querySelector('.msg.event') ? 'event' : 'message';
                            const countryCode = node.querySelector('.chatflag')?.getAttribute('title') || 'unknown';

                            // Llama a la funci贸n expuesta para enviar el mensaje a Discord
                            window.sendMessageToDiscord(text, user, time, countryCode, type);
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
    monitorPageWithEvents(); // Comienza a monitorear la p谩gina
});

client.login(DISCORD_TOKEN); // Inicia sesi贸n con el token del bot