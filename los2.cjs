const { exec } = require('child_process');

// Ejecutar el primer archivo (caca.js)
const process1 = exec('node caca1.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al ejecutar caca1.js: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout (caca.js): ${stdout}`);
});

// Ejecutar el segundo archivo (caca2.js)
const process2 = exec('node caca2.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al ejecutar caca2.js: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout (caca2.js): ${stdout}`);
});
