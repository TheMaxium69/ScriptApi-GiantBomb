
let API_CLEF = [


    // "",//Name - No-use
];/**/
let FORMAT = "json";
let START_OFFSET = 0 // 0 = 0 a 100 jeux | 1 = 100 a 200 jeux | 2 = 200 a 300 jeux | 3 = 300 a 400 jeux | ...
let LIMIT = 100;
let NBBOUCLE = 880;

// *********************************************

const express = require("express");
const request = require("./requeste");
const game = require("./game");
const fs = require('fs');
const {get} = require("axios");
const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, (req, res) => {
    console.log(`[GOOD] Démarrage du script`);
    console.log(`Script en cours d'exécution sur http://localhost:${port}`);

    console.log("    ");
    console.log("    ");
    console.log("Nombre de boucle demandé : " + NBBOUCLE + " Sois un nombre de jeux de : " + NBBOUCLE*LIMIT);
    console.log(`[GOOD] Reset du fichier latest.log`);
    fs.writeFileSync('log/latest.log', "");

    let data = {};
    data['control'] = {};
    const controlReset = JSON.stringify(data, null, 2);
    console.log(`[GOOD] Reset du fichier control.json`);
    fs.writeFileSync('log/control.json', controlReset);

    let data2 = {};
    data2['games'] = [];
    const gameReset = JSON.stringify(data2, null, 2);
    console.log(`[GOOD] Reset du fichier games.json`);
    fs.writeFileSync('log/games.json', gameReset);
    console.log("    ");

    runLoop(res);

});

async function runLoop(res) {
    // let OFFSET_boucle = 0;
    for (let i = 0; i < NBBOUCLE; i++) {
        console.log("*************************************");
        console.log("[START] Boucle numéro n°" + (i + START_OFFSET) + " ( de " + (i + START_OFFSET) * LIMIT + " à " + (i + START_OFFSET + 1) * LIMIT + " jeux)");
        console.log("*************************************");
        console.log("    ");

        const result = await makeRequest(i, res);

        console.log("    ");
        console.log("*************************************");
        console.log(" [" + result.status + "] Boucle numéro n°" + (i + START_OFFSET) + " ( de " + (i + START_OFFSET) * LIMIT + " à " + (i + START_OFFSET + 1) * LIMIT + " jeux)");
        console.log("   - messsage : " + result.message);
        console.log("*************************************");
        console.log("    ");
        console.log("    ");

        console.log('[GOOD] Modification du fichier log');
        fs.appendFileSync('log/latest.log', (i + START_OFFSET) + ": ["+ result.status +"] Etape n\°"+ (i + START_OFFSET) +" ( de " + (i + START_OFFSET) * LIMIT + " à " + (i + START_OFFSET + 1) * LIMIT + " jeux) : " + result.message+ '\n');

        await updateControleJson(i, result);
        console.log("    ");
        console.log("    ");

    }

    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log("Verification de la récupération de tout les jeux");
    let perfect = "NON";
    let palierErr = "NON";
    let j = 0;

    while (perfect !== "OUI") {

        j++
        console.log("   - Verification n\°" + j);
        console.log("    ");

        palierErr = "NON";

        const controlJson = await getControlJson();
        let control = controlJson.control;

        fs.appendFileSync('log/latest.log', "----------> VERIF N\°"+ j +"\n");
        let m = 1;
        for (const key of Object.keys(control)) {
            if (control[key].status == "ERR"){
                palierErr = "OUI";
                console.log("           + " + m + "/" + Object.keys(control).length + " = ERR");
                console.log("[ERR] La boucle n\°"+ control[key].nbBoucle + " (" + control[key].palier + " a " + (control[key].palier+LIMIT) + ") doit être refaite");
                console.log("    ");
                const resultReVerif = await reRequestPromise(+key,res);
                await updateControleJson(+key, resultReVerif);
                console.log("    ");
                console.log("    ");
            } else {

                console.log("           + " + m + "/" + Object.keys(control).length + " = VALID");
            }
            m++;
        }

        if (palierErr == "NON"){
            console.log("    ");
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
            console.log("    ");
            console.log('[GOOD] Tout les jeux on été vérifier');
            perfect = "OUI";
        } else {

            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");

        }

    }


    console.log('[GOOD] Fin du Script');

    // setTimeout(() => {
    //     console.log('[GOOD] Fermeture du Script');
    //     process.exit();
    // }, 6000);
}
// function getGameRequest(i, res) {
//     return new Promise(resolve => {
//         let OFFSET_boucle = i + START_OFFSET;
//         game(OFFSET_boucle, res, resolve);
//     });
// }

function makeRequest(i, res) {
    return new Promise(resolve => {
        let OFFSET_boucle = (i + START_OFFSET) * LIMIT;
        // console.log("  OFFSET_BOUCLE  " + OFFSET_boucle);
        // resolve({
        //     status: "ERR",
        //     message: "Erreur lors de la requête vers l\'API"
        // });
        request(API_CLEF, FORMAT, LIMIT, OFFSET_boucle, res, resolve);
    });
}


async function getControlJsonFunct(callback){

    fs.readFile('log/control.json', 'utf8', (err, data) => {
        if (err) {
            console.error('[ERR] De lecture du fichier JSON de controle');
        }

        try {
            const jsonData = JSON.parse(data);

            // console.log('[GOOD] Recuperation du fichier JSON de controle');

            callback(jsonData);

        } catch (parseError) {
            console.error('[ERR] De parsing du fichier JSON de controle');
        }
    });

}
function getControlJson() {
    return new Promise(resolve => {
        getControlJsonFunct(resolve);
    });
}

async function updateControleJson(id, message) {
    console.log('[GOOD] Modification du fichier JSON de controle');

    const controlJson = await getControlJson();

    message['palier'] = (id + START_OFFSET) * LIMIT;
    message['nbBoucle'] = id + START_OFFSET;
    controlJson.control[id] = message;
    // console.log(controlJson)

    const controlJsonEdit = JSON.stringify(controlJson, null, 2);
    fs.writeFileSync('log/control.json', controlJsonEdit);

}

async function reRequest(i, res , callback) {

    console.log("*************************************");
    console.log("[START] Boucle numéro n°" + (i + START_OFFSET) + " ( de " + (i + START_OFFSET) * LIMIT + " à " + (i + START_OFFSET + 1) * LIMIT + " jeux)");
    console.log("*************************************");
    console.log("    ");

    const result = await makeRequest(i, res);

    console.log("    ");
    console.log("*************************************");
    console.log(" [" + result.status + "] Boucle numéro n°" + (i + START_OFFSET) + " ( de " + (i + START_OFFSET) * LIMIT + " à " + (i + START_OFFSET + 1) * LIMIT + " jeux)");
    console.log("   - messsage : " + result.message);
    console.log("*************************************");
    console.log("    ");
    console.log("    ");

    console.log('[GOOD] Modification du fichier log');
    fs.appendFileSync('log/latest.log', (i + START_OFFSET) + ": ["+ result.status +"] Etape n\°"+ (i + START_OFFSET) +" ( de " + (i + START_OFFSET) * LIMIT + " à " + (i + START_OFFSET + 1) * LIMIT + " jeux) : " + result.message+ '\n');

    callback(result);
}

function reRequestPromise(i, res) {
    return new Promise(resolve => {
        // resolve({
        //     status: "ERR",
        //     message: "Erreur lors de la requête vers l\'API"
        // });
        reRequest(i, res, resolve);
    });
}