
const express = require("express");
const app = express();
const port = 3001;

app.use(express.json());

app.listen(port, (req, res) => {
    console.log(`[GOOD] Démarrage du script vpn`);


    changeIp(async () => {
        console.log(`[GOOD] IP CHANGE`)
    });


});




async function changeIp(callback) {


  const { exec } = require('child_process');
  exec('hotspotshield disconnect && hotspotshield connect fr', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    // console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    callback();
  });



}