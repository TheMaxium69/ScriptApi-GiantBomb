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
        const response = await axios.get('https://www.giantbomb.com/api/companies/', {
            params: {
                api_key: API_CLEF,
                format: FORMAT,
                limit: LIMIT,
                offset: OFFSET
            }
        })

        console.log("[GOOD] Connexion start : " + OFFSET + " Limite : " + LIMIT);
        console.log("-------------------------------------------------------------");
        const companies = response.data.results;
        let i = 0;
        for (const company of companies) {
            i++;
            console.log("        + Added Company " + i + "/" + LIMIT + " -> GUID : " + company.guid + "  NAME : '" + company.name + "'");

            db.query("INSERT INTO company (id_giant_bomb, guid, name, aliases, api_detail_url, abbreviation, date_added, date_founded, date_last_updated, deck, description, image, image_tags, location_address, location_city, location_country, location_state, phone, site_detail_url, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                company.id,
                company.guid,
                company.name,
                company.aliases,
                company.api_detail_url,
                company.abbreviation,
                company.date_added,
                company.date_founded,
                company.date_last_updated,
                company.deck,
                company.description,
                JSON.stringify(company.image),
                JSON.stringify(company.image_tags),
                company.location_address,
                company.location_city,
                company.location_country,
                company.location_state,
                company.phone,
                company.site_detail_url,
                company.website
            ]);

            await updateGameJson(company);

        }

        console.log("-------------------------------------------------------------");
        if (i == LIMIT) {
            console.log("[GOOD] Added Company = " + i + " sur " + LIMIT + " Company demandé");
        } else {
            console.log("[ERR] Added Company = " + i + " sur " + LIMIT + " Company demandé");
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

    fs.readFile('company.json', 'utf8', (err, data) => {
        if (err) {
            console.error('[ERR] De lecture du fichier JSON de companies');
        }

        try {
            const jsonData = JSON.parse(data);

            callback(jsonData);

        } catch (parseError) {
            console.error('[ERR] De parsing du fichier JSON de companies');
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
    gameJson.company.push(game);
    // console.log(gameJson)

    const gameJsonEdit = JSON.stringify(gameJson, null, 2);
    fs.writeFileSync('company.json', gameJsonEdit);

}

module.exports = request;