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
        const response = await axios.get('https://www.giantbomb.com/api/games/', {
            params: {
                api_key: API_CLEF,
                format: FORMAT,
                limit: LIMIT,
                offset: OFFSET
            }
        })

        console.log("[GOOD] Connexion start : " + OFFSET + " Limite : " + LIMIT);
        console.log("-------------------------------------------------------------");
        const games = response.data.results;
        let i = 0;
        games.forEach(game => {
            i++;
            console.log("        + Added Game " + i + "/" + LIMIT + " -> GUID : " + game.guid + "  NAME : '" + game.name + "'");
            db.query("INSERT INTO game (id_GiantBomb, guid, name, aliases, api_detail_url, date_added, date_last_updated, deck, description, expected_release_day, expected_release_month, expected_release_quarter, expected_release_year, image, image_tags, number_of_user_reviews, original_game_rating, original_release_date, platforms, site_detail_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
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
        });

        console.log("-------------------------------------------------------------");
        if (i == LIMIT) {
            console.log("[GOOD] Added Game = " + i + " sur " + LIMIT + " game demandé");
        } else {
            console.log("[ERR] Added Game = " + i + " sur " + LIMIT + " game demandé");
        }


        const jsonData = JSON.stringify(response.data, null, 2);
        fs.writeFileSync('result.json', jsonData);

        // res.json(response.data);

        messageReturn = {
            status:"GOOD",
            message:"Tout les données on bien été enregistrez"
        };

    } catch (error) {

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

module.exports = request;