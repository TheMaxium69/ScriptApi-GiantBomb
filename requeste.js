const fs = require("fs");

async function request(API_CLEF, FORMAT, game, res, callback) {

    let messageReturn = [];

    if (!game){

        messageReturn = {
            status:"ERR",
            message:"MySQL is Down"
        };

        callback(messageReturn);


    } else {

        const axios = require('axios');
        const fs = require('fs');
        const mysql = require('mysql');

        const db = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'gamenium_test'
        });

        db.connect((err) => {
            if (err) {
                console.error('Erreur de connexion à la base de données:', err);
            } else {
                console.log('[GOOD] Connexion à la base de données MySQL réussie');
            }
        });

        // console.log("game:",game);
        let url = "https://www.giantbomb.com/api/game/" + game.guid + "/"

        try {
            const response = await axios.get(url, {
                params: {
                    api_key: API_CLEF,
                    format: FORMAT,
                }
            })

            console.log("[GOOD] Connexion start : ");
            console.log("           Game Request = " + game.guid + " | name = " + game.name);
            console.log("-------------------------------------------------------------");
            const gameRecup = response.data.results;
            // console.log(gameRecup.name)

                db.query("UPDATE game SET franchises = ?, genres = ?, people = ?, publishers = ?, developers = ?, releases = ?, similar_games = ?, themes = ?, characters = ? WHERE id = ?", [
                    JSON.stringify(gameRecup.franchises),
                    JSON.stringify(gameRecup.genres),
                    JSON.stringify(gameRecup.people),
                    JSON.stringify(gameRecup.publishers),
                    JSON.stringify(gameRecup.developers),
                    JSON.stringify(gameRecup.releases),
                    JSON.stringify(gameRecup.similar_games),
                    JSON.stringify(gameRecup.themes),
                    JSON.stringify(gameRecup.characters),
                    game.id,
                ]);

                // await updateGameJson(game);


                console.log("[GOOD] Updated Game = " + game.guid + " | " + game.name );

            console.log("-------------------------------------------------------------");
            // if (i == LIMIT) {
            //     console.log("[GOOD] Added Game = " + i + " sur " + LIMIT + " game demandé");
            // } else {
            //     console.log("[ERR] Added Game = " + i + " sur " + LIMIT + " game demandé");
            // }


            // res.json(response.data);

            messageReturn = {
                status:"GOOD",
                message:"Tout les données on bien été mise à jour"
            };

        } catch (error) {

            // console.log(error)

            messageReturn = {
                status:"ERR",
                message:"Erreur lors de la requête vers l\'API"
            };

            // res.status(500).json({error: 'Erreur lors de la requête vers l\'API'});
        }




            // console.log("  ");
            // console.log("   + 4s avant la prochaine requete");
            // setTimeout(async () => {
            //     console.log("   - fin des 4 secondes");
            //     callback(messageReturn);
            // }, 4000);


        callback(messageReturn);
    }

}

async function getGamesJsonFunct(callback){

    fs.readFile('games.json', 'utf8', (err, data) => {
        if (err) {
            console.error('[ERR] De lecture du fichier JSON de games');
        }

        try {
            const jsonData = JSON.parse(data);

            callback(jsonData);

        } catch (parseError) {
            console.error('[ERR] De parsing du fichier JSON de games');
        }
    });

}
function getGamesJson() {
    return new Promise(resolve => {
        getGamesJsonFunct(resolve);
    });
}

async function updateGameJson(game) {

    const gameJson = await getGamesJson();

    // console.log(gameJson)
    gameJson.games.push(game);
    // console.log(gameJson)

    const gameJsonEdit = JSON.stringify(gameJson, null, 2);
    fs.writeFileSync('games.json', gameJsonEdit);

}

module.exports = request;