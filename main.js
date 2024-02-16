
let API_CLEF = "4970ac3cef363f3fef4d940936603497b81ebc3f";
let FORMAT = "json";
let LIMIT = "100";
let OFFSET = 100;
let NBBOUCLE = 100;

// *********************************************

const express = require("express");
const request = require("./requeste");
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, (req, res) => {
    console.log(`[GOOD] Démarrage du script`);
    console.log(`Script en cours d'exécution sur http://localhost:${port}`);

    console.log("    ");
    console.log("    ");
    console.log("Nombre de boucle demandé : " + NBBOUCLE + " Sois un nombre de jeux de : " + NBBOUCLE*100);
    console.log(`[GOOD] Reset du fichier latest.log`);
    fs.writeFileSync('latest.log', "");

    let data = {};
    data['control'] = {};
    const controlReset = JSON.stringify(data, null, 2);
    console.log(`[GOOD] Reset du fichier control.json`);
    fs.writeFileSync('control.json', controlReset);

    let data2 = {};
    data2['games'] = [];
    const gameReset = JSON.stringify(data2, null, 2);
    console.log(`[GOOD] Reset du fichier games.json`);
    fs.writeFileSync('games.json', gameReset);
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
        // const result = {
        //     status:"ERR",
        //     message:"Je suis un exemple"
        // };

        console.log("    ");
        console.log("*************************************");
        console.log(" [" + result.status + "] Boucle numéro : " + (i + 1) + " (" + i * 100 + ")");
        console.log("   - messsage : " + result.message);
        console.log("*************************************");
        console.log("    ");
        console.log("    ");


        console.log('[GOOD] Modification du fichier log');
        fs.appendFileSync('latest.log', (i+1) + ": ["+ result.status +"] Etape n\°"+ (i+1) +" (" + i * 100 + ") : " + result.message+ '\n');

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

        fs.appendFileSync('latest.log', "----------> VERIF N\°"+ j +"\n");
        for (const key of Object.keys(control)) {
            if (control[key].status == "ERR"){
                palierErr = "OUI";
                console.log("           + " + control[key].nbBoucle + "/" + Object.keys(control).length + " = ERR");
                console.log("[ERR] La boucle n\°"+ control[key].nbBoucle + " (" + control[key].palier + ") doit être refaite");
                console.log("    ");
                const resultReVerif = await reRequestPromise(+key,res);
                await updateControleJson(+key, resultReVerif);
                console.log("    ");
                console.log("    ");
            } else {

                console.log("           + " + control[key].nbBoucle + "/" + Object.keys(control).length + " = VALID");
            }
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

    setTimeout(() => {
        console.log('[GOOD] Fermeture du Script');
        process.exit();
    }, 6000);
}

function makeRequest(i, res) {
    return new Promise(resolve => {
        let OFFSET_boucle = i * 100;
        request(API_CLEF, FORMAT, LIMIT, OFFSET_boucle, res, resolve);
    });
}

async function getControlJsonFunct(callback){

    fs.readFile('control.json', 'utf8', (err, data) => {
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

    message['palier'] = id * 100;
    message['nbBoucle'] = id + 1;
    controlJson.control[id] = message;
    // console.log(controlJson)

    const controlJsonEdit = JSON.stringify(controlJson, null, 2);
    fs.writeFileSync('control.json', controlJsonEdit);

}

async function reRequest(i, res , callback) {
    console.log("*************************************");
    console.log("[START] Boucle numéro : " + (i + 1) + " (" + i * 100 + ")");
    console.log("*************************************");
    console.log("    ");

    const result = await makeRequest(i, res);
    // const result = {
    //     status: "ERR",
    //     message: "Je suis un exemple"
    // };

    console.log("    ");
    console.log("*************************************");
    console.log(" [" + result.status + "] Boucle numéro : " + (i + 1) + " (" + i * 100 + ")");
    console.log("   - messsage : " + result.message);
    console.log("*************************************");
    console.log("    ");
    console.log("    ");


    console.log('[GOOD] Modification du fichier log');
    fs.appendFileSync('latest.log', (i + 1) + ": [" + result.status + "] Verif Etape n\°" + (i + 1) + " (" + i * 100 + ") : " + result.message + '\n');

    callback(result);
}

function reRequestPromise(i, res) {
    return new Promise(resolve => {
        reRequest(i, res, resolve);
    });
}