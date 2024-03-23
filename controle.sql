-- VERIF LES DUPLICATION
SELECT id_giant_bomb, COUNT(*) FROM game GROUP BY id_giant_bomb HAVING COUNT(*) > 1;
-- VERIF LE PLUS GRAND ID
SELECT MAX(id_giant_bomb) AS max_id FROM game;
