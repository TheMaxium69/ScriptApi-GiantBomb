const fs = require("fs");

async function request(API_CLEF, FORMAT, LIMIT, OFFSET, res, callback) {

    const axios = require('axios');
    const fs = require('fs');
    const mysql = require('mysql');
    let messageReturn = [];

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

    try {
        const response = await axios.get('https://www.giantbomb.com/api/platforms/', {
            params: {
                api_key: API_CLEF,
                format: FORMAT,
                limit: LIMIT,
                offset: OFFSET
            }
        })

        console.log("[GOOD] Connexion start : " + OFFSET + " Limite : " + LIMIT);
        console.log("-------------------------------------------------------------");
        const plateforms = response.data.results;
        let i = 0;
        for (const plateform of plateforms) {
            i++;
            console.log("        + Added Plateform " + i + "/" + LIMIT + " -> GUID : " + plateform.guid + "  NAME : '" + plateform.name + "'");
            db.query("INSERT INTO plateforms (id_giant_bomb, guid, name, aliases, api_detail_url, abbreviation, company, date_added, date_last_updated, deck, description, image, image_tags, install_base, online_support, original_price, release_date, site_detail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                plateform.id,
                plateform.guid,
                plateform.name,
                plateform.aliases,
                plateform.api_detail_url,
                plateform.abbreviation,
                JSON.stringify(plateform.company),
                plateform.date_added,
                plateform.date_last_updated,
                plateform.deck,
                plateform.description,
                JSON.stringify(plateform.image),
                JSON.stringify(plateform.image_tags),
                plateform.install_base,
                plateform.online_support,
                plateform.original_price,
                plateform.release_date,
                plateform.site_detail_url,
            ]);

            await updateGameJson(plateform);

        }

        console.log("-------------------------------------------------------------");
        if (i == LIMIT) {
            console.log("[GOOD] Added plateform = " + i + " sur " + LIMIT + " plateform demandé");
        } else {
            console.log("[ERR] Added plateform = " + i + " sur " + LIMIT + " plateform demandé");
        }


        // res.json(response.data);

        messageReturn = {
            status:"GOOD",
            message:"Tout les données on bien été enregistrez"
        };

    } catch (error) {

        // console.log(error)

        messageReturn = {
            status:"ERR",
            message:"Erreur lors de la requête vers l\'API"
        };

        // res.status(500).json({error: 'Erreur lors de la requête vers l\'API'});
    }


    if (OFFSET > 0){

        console.log("  ");
        console.log("   + 4s avant la prochaine requete");
        setTimeout(async () => {
            console.log("   - fin des 4 secondes");
            callback(messageReturn);
        }, 4000);
    } else {
        callback(messageReturn);
    }



}

async function getGamesJsonFunct(callback){

    fs.readFile('plateforms.json', 'utf8', (err, data) => {
        if (err) {
            console.error('[ERR] De lecture du fichier JSON de plateforms');
        }

        try {
            const jsonData = JSON.parse(data);

            callback(jsonData);

        } catch (parseError) {
            console.error('[ERR] De parsing du fichier JSON de plateforms');
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
    gameJson.plateforms.push(game);
    // console.log(gameJson)

    const gameJsonEdit = JSON.stringify(gameJson, null, 2);
    fs.writeFileSync('plateforms.json', gameJsonEdit);

}

module.exports = request;