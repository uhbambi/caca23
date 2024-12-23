const { exec } = require('child_process');
const puppeteer = require('puppeteer');

// Detectar el navegador de Puppeteer
(async () => {
  const chromePath = puppeteer.executablePath();

  console.log(`Navegador encontrado en: ${chromePath}`);

  // Ejecutar el primer archivo (caca1.cjs)
  exec('node caca1.cjs', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar caca1.cjs: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr (caca1.cjs): ${stderr}`);
      return;
    }
    console.log(`stdout (caca1.cjs): ${stdout}`);
  });

  // Ejecutar el segundo archivo (caca2.cjs)
  exec('node caca2.cjs', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar caca2.cjs: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr (caca2.cjs): ${stderr}`);
      return;
    }
    console.log(`stdout (caca2.cjs): ${stdout}`);
  });
})();

