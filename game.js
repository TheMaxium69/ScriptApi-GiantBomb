const mysql = require("mysql");

async function game(OFFSET, res, callback) {

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
            console.error('[ERR] Erreur de connexion à la base de données:', err);

            messageReturn = {
                status:"ERR",
                message:"Erreur de connexion à la base de données"
            };

            callback(messageReturn)
        } else {
            console.log('[GOOD] Connexion à la base de données MySQL réussie');
        }
    });

        db.query("SELECT * FROM game LIMIT ?, 1;", [OFFSET-1], (err, result) => {

            if (err) {
                console.error('Erreur lors de l\'exécution de la requête SELECT:', err);

                messageReturn = {
                    status:"ERR",
                    message:"Erreur lors de la requête vers la base de donnée"
                };
            } else {

                // console.log(result);
                if (result.length > 0) {
                    const game = result[0];
                    const name = game.name;
                    const guid = game.guid;

                    console.log('[GOOD] Recuperation du jeux : ');
                    console.log('               GUID : ' + guid +' | Name : ' + name);

                    messageReturn = {
                        status:"GOOD",
                        message:"Tout les données on bien été recupéré",
                        game:game,
                    };

                } else {
                    messageReturn = {
                        status:"ERR",
                        message:"Erreur lors de la recuperation des informations"
                    };

                    console.log("[ERR] Aucun jeu trouvé dans les résultats.");
                }

            }

            callback(messageReturn)
        });


}


module.exports = game;