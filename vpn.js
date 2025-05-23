
const express = require("express");
const request = require("./requeste");
const game = require("./game");
const fs = require('fs');
const {get} = require("axios");
const app = express();
const port = 3000;

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