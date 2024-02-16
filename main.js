
let API_CLEF = "b9c498e2ec4be2d41256dda3b718340f25098a31";
let FORMAT = "json";
let LIMIT = "100";
let OFFSET = 100;
let NBBOUCLE = 3;

// *********************************************

const express = require("express");
const request = require("./requeste");
const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, (req, res) => {
    console.log(`[GOOD] Démarrage du script`);
    console.log(`Script en cours d'exécution sur http://localhost:${port}`);

    console.log("    ");
    console.log("    ");
    console.log("Nombre de boucle demandé : " + NBBOUCLE + " Sois un nombre de jeux de : " + NBBOUCLE*100);
    console.log("    ");

    runLoop(res);

});

async function runLoop(res) {
    let OFFSET_boucle = 0;
    for (let i = 0; i < NBBOUCLE; i++) {
        console.log("*************************************");
        console.log("[START] Boucle numéro : " + (i + 1) + " (" + i * 100 + ")");
        console.log("*************************************");
        console.log("    ");

        const result = await makeRequest(i, res);

        console.log("    ");
        console.log("*************************************");
        console.log(" [" + result.status + "] Boucle numéro : " + (i + 1) + " (" + i * 100 + ")");
        console.log("   - messsage : " + result.message);
        console.log("*************************************");
        console.log("    ");
        console.log("    ");
    }

    setTimeout(() => {
        console.log('[GOOD] Fermeture du Script');
        process.exit();
    }, 4000);
}

function makeRequest(i, res) {
    return new Promise(resolve => {
        let OFFSET_boucle = i * 100;
        request(API_CLEF, FORMAT, LIMIT, OFFSET_boucle, res, resolve);
    });
}