
let API_CLEF = "";
let FORMAT = "json";
let START_OFFSET = 682; // 0 = premier 1 = deuxième
let NBBOUCLE = 100;

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
    console.log("Nombre de boucle demandé : " + NBBOUCLE + " Sois un nombre de jeux de : " + NBBOUCLE + " à editer");
    console.log(`[GOOD] Reset du fichier latest.log`);
    fs.writeFileSync('latest.log', "");

    let data = {};
    data['control'] = {};
    const controlReset = JSON.stringify(data, null, 2);
    console.log(`[GOOD] Reset du fichier control.json`);
    fs.writeFileSync('control.json', controlReset);

    // let data2 = {};
    // data2['games'] = [];
    // const gameReset = JSON.stringify(data2, null, 2);
    // console.log(`[GOOD] Reset du fichier games.json`);
    // fs.writeFileSync('games.json', gameReset);
    console.log("    ");

    runLoop(res);

});

async function runLoop(res) {
    // let OFFSET_boucle = 0;
    for (let i = 0; i < NBBOUCLE; i++) {
        console.log("*************************************");
        console.log("[START] Boucle numéro : " + (i + 1));
        console.log("*************************************");
        console.log("    ");


        let getResult = await getGameRequest(i+1, res);

        if (!getResult.game){
            let k = 0;
            console.log("  ");
            console.log("   + 4s avant la prochaine requete sql");
            setTimeout(async () => {
                console.log("   - fin des 4 secondes");
                do {
                    k++;
                    console.log("[ERR] SQL is Down - Try number : ", k);
                    getResult = await getGameRequest(i+1, res);
                } while (!getResult.game);
            }, 4000);
        }

        const result = await makeRequest(getResult.game, res);


        console.log("    ");
        console.log("*************************************");
        console.log(" [" + result.status + "] Boucle numéro : " + (i + 1));
        console.log("   - guid : " + getResult.game.guid);
        console.log("   - game : " + getResult.game.name);
        console.log("   - messsage : " + result.message);
        console.log("*************************************");
        console.log("    ");
        console.log("    ");

        console.log('[GOOD] Modification du fichier log');
        fs.appendFileSync('latest.log', (i+1) + ": ["+ result.status +"] Game = "+getResult.game.guid+" - "+getResult.game.name+" | Etape n\°"+ (i+1) +" : " + result.message+ '\n');

        await updateControleJson(i, result, getResult.game);
        console.log("    ");
        console.log("    ");

    }

    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log("Verification de la modifications de tout les jeux");
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
                console.log("[ERR] La boucle n\°"+ control[key].nbBoucle + " (" + control[key].guid + " - " + control[key].name +") doit être refaite");
                console.log("    ");

                console.log("*************************************");
                console.log("[START] Boucle numéro : " + (+key + 1));
                console.log("*************************************");
                console.log("    ");


                const getResult = await getGameRequest(+key+1, res);
                const resultReVerif = await reRequestPromise(+key, getResult,res);
                await updateControleJson(+key, resultReVerif,getResult.game);
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
function getGameRequest(i, res) {
    return new Promise(resolve => {
        let OFFSET_boucle = i + START_OFFSET;
        game(OFFSET_boucle, res, resolve);
    });
}

function makeRequest(game, res) {
    return new Promise(resolve => {
        request(API_CLEF, FORMAT, game, res, resolve);
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

async function updateControleJson(id, message, game) {
    console.log('[GOOD] Modification du fichier JSON de controle');

    const controlJson = await getControlJson();

    message['id'] = game.id;
    message['id_giant_bomb'] = game.id_giant_bomb;
    message['guid'] = game.guid;
    message['name'] = game.name;
    message['nbBoucle'] = id + 1;
    controlJson.control[id] = message;
    // console.log(controlJson)

    const controlJsonEdit = JSON.stringify(controlJson, null, 2);
    fs.writeFileSync('control.json', controlJsonEdit);

}

async function reRequest(i, getResult, res , callback) {


    const result = await makeRequest(getResult.game, res);


    console.log("    ");
    console.log("*************************************");
    console.log(" [" + result.status + "] Boucle numéro : " + (i + 1));
    console.log("   - guid : " + getResult.game.guid);
    console.log("   - game : " + getResult.game.name);
    console.log("   - messsage : " + result.message);
    console.log("*************************************");
    console.log("    ");
    console.log("    ");

    console.log('[GOOD] Modification du fichier log');
    fs.appendFileSync('latest.log', (i+1) + ": ["+ result.status +"] Game = "+getResult.game.guid+" - "+getResult.game.name+" | Etape n\°"+ (i+1) +" : " + result.message+ '\n');

    // await updateControleJson(i, result, getResult.game);
    // console.log("    ");
    // console.log("    ");

    callback(result);
}

function reRequestPromise(i, getResult, res) {
    return new Promise(resolve => {
        reRequest(i, getResult, res, resolve);
    });
}