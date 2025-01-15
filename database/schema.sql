
CREATE DATABASE IF NOT EXISTS employe_form;
USE employe_form;

CREATE TABLE IF NOT EXISTS employes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    raison_sociale VARCHAR(255),
    siret VARCHAR(255),
    nom_prenom_gerant VARCHAR(255),
    num VARCHAR(50),
    mail VARCHAR(255),
    pdl VARCHAR(255),
    pce VARCHAR(255),
    date_fin_engagement DATE,
    commentaires TEXT
);
