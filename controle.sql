-- VERIF LE PLUS GRAND ID
SELECT MAX(id_giant_bomb) AS max_id FROM gamenium_test.game;
-- NOMBRE DE JEUX OBTENU
SELECT COUNT(*) AS total_lignes FROM gamenium_test.game;
-- NOMBRE DE JEUX EN DOUBLE
SELECT SUM(subquery.count_duplicate) / 2 AS moitie_total_duplicate_rows
FROM (
    SELECT COUNT(*) AS count_duplicate
    FROM gamenium_test.game
    GROUP BY id_giant_bomb
    HAVING COUNT(*) > 1
) AS subquery;
-- ID DES DUPLICATION
SELECT id_giant_bomb, COUNT(*) FROM gamenium_test.game GROUP BY id_giant_bomb HAVING COUNT(*) > 1;