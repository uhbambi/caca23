const { exec } = require('child_process');

// Ruta del ejecutable de Google Chrome
const chromePath = '/usr/bin/google-chrome';

// Verificar si Google Chrome está instalado antes de ejecutar los scripts
exec(`which ${chromePath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Google Chrome no está instalado o no se encontró en ${chromePath}: ${error.message}`);
    return;
  }
  
  console.log(`Google Chrome encontrado en: ${stdout.trim()}`);

  // Ejecutar el primer archivo (caca1.cjs)
  const process1 = exec('node caca1.cjs', (error, stdout, stderr) => {
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
  const process2 = exec('node caca2.cjs', (error, stdout, stderr) => {
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
});
