const fs = require("fs");

async function request(API_CLEF, FORMAT, LIMIT, OFFSET, res, callback) {

    let messageReturn = [];

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
            // console.log('Erreur de connexion à la base de données:');

            // messageReturn = {
            //     status: "ERR",
            //     message: "Erreur de connexion à la base de données"
            // };
            //
            // callback(messageReturn)

        } else {
            console.log('[GOOD] Connexion à la base de données MySQL réussie');
        }
    });

    // console.log("game:",game);
    let url = "https://www.giantbomb.com/api/games/"

    let iamErrApi = false;
    let l = 0;


    do {

        try {

            if (l >= API_CLEF.length){
                console.log('[GOOD] Fermeture du Script');
                process.exit();
            }

            console.log('[START] Requete avec l\'API CLEF N°:'+(l+1));
            console.log('[DEBUG] API URL -> ' + url)
            console.log('[DEBUG] API KEY -> ' + API_CLEF[l])
            const response = await axios.get(url, {
                params: {
                    api_key: API_CLEF[l],
                    format: FORMAT,
                    limit: LIMIT,
                    offset: OFFSET
                }
            })


            console.log("[GOOD] Connexion start : " + OFFSET + " Limite : " + LIMIT);
            console.log("-------------------------------------------------------------");
            const games = response.data.results;
            let i = 0;
            for (const game of games) {
                i++;
                console.log("        + Added Game " + i + "/" + LIMIT + " -> GUID : " + game.guid + "  NAME : '" + game.name + "'");
                db.query("INSERT INTO game (id_giant_bomb, guid, name, aliases, api_detail_url, date_added, date_last_updated, deck, description, expected_release_day, expected_release_month, expected_release_quarter, expected_release_year, image, image_tags, number_of_user_reviews, original_game_rating, original_release_date, platforms, site_detail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    game.id,
                    game.guid,
                    game.name,
                    game.aliases,
                    game.api_detail_url,
                    game.date_added,
                    game.date_last_updated,
                    game.deck,
                    game.description,
                    game.expected_release_day,
                    game.expected_release_month,
                    game.expected_release_quarter,
                    game.expected_release_year,
                    JSON.stringify(game.image),
                    JSON.stringify(game.image_tags),
                    game.number_of_user_reviews,
                    JSON.stringify(game.original_game_rating),
                    game.original_release_date,
                    JSON.stringify(game.platforms),
                    game.site_detail_url,

                ]);

                await updateGameJson(game);

            }

            console.log("-------------------------------------------------------------");
            if (i == LIMIT) {
                console.log("[GOOD] Added Game = " + i + " sur " + LIMIT + " game demandé");
            } else {
                console.log("[ERR] Added Game = " + i + " sur " + LIMIT + " game demandé");
            }

            // await updateGameJson(game);

            console.log("-------------------------------------------------------------");

            messageReturn = {
                status: "GOOD",
                message: "Tout les données on bien été mise à jour"
            };


            iamErrApi = false;

        } catch (error) {

            console.log('[ERR] Problème de connexion avec l\'ip ou l\'API CLEF N°:'+(l+1));
            console.error("[DEBUG] ------------------------------------------------> " + error.code)

            messageReturn = {
                status: "ERR",
                message: error.code
            };

            iamErrApi = true;

        }
        l++
    } while (iamErrApi);




        // console.log("  ");
        // console.log("   + 4s avant la prochaine requete");
        // setTimeout(async () => {
        //     console.log("   - fin des 4 secondes");
        //     callback(messageReturn);
        // }, 4000);


    callback(messageReturn);


}

async function getGamesJsonFunct(callback){

    fs.readFile('log/games.json', 'utf8', (err, data) => {
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
    fs.writeFileSync('log/games.json', gameJsonEdit);

}

module.exports = request;