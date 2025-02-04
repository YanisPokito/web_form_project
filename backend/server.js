// Importation des modules nécessaires
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const excel = require('exceljs');

const app = express();
const port = 3000;

// Configuration de la base de données

// Récupérer l'URL de connexion MySQL depuis les variables d'environnement
const dbUrl = process.env.MYSQL_URL || 'mysql://root:HvCdyhYDZlSNcqudKOerfffHmsPXhirj@mysql.railway.internal:3306/railway';

// Créer une connexion MySQL
const db = mysql.createConnection(dbUrl);

// Tester la connexion
db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        process.exit(1); // Arrêter l'application en cas d'erreur
    }
    console.log('Connecté à la base de données MySQL');
});

module.exports = db;

// Configuration des middlewares
app.use(bodyParser.urlencoded({ extended: true })); // Pour lire les données des formulaires
app.use(bodyParser.json()); // Pour lire les données JSON
app.use(session({
    secret: 'cle-secrete', // Clé secrète pour les sessions
    resave: false,
    saveUninitialized: true,
}));

// Utilisateurs avec rôles
const users = [
    { username: 'admin', password: 'admin38130', role: 'admin' },
    { username: 'NusretinNAZIFOV', password: 'Nusret38@', role: 'admin' },
    { username: 'GeraldDelConsole', password: 'gerald38', role: 'user' },
    { username: 'RobinMalandain', password: 'Robin73', role: 'user' },
    { username: 'OmerBascesme', password: 'Omer38130', role: 'admin' }
];
const multer = require('multer');
const fs = require('fs');
// Répertoire cible
const uploadDir = path.join(__dirname, 'uploads');

// Vérifier si le répertoire existe, sinon le créer
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Répertoire cible
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nom unique pour chaque fichier
    }
});

const upload = multer({ storage });


app.post(
    '/api/submit',
    upload.fields([
        { name: 'file', maxCount: 1 }, // Champ pour un fichier unique
        { name: 'anotherField', maxCount: 1 } // Un autre champ, optionnel
    ]),
    (req, res) => {
        console.log(req.files); // Tous les fichiers uploadés
        console.log(req.body); // Données supplémentaires
        res.send('Fichiers et données reçus');
    }
);


// Middleware pour servir les fichiers statiques du dossier frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Route pour la page de connexion
app.get('/', (req, res) => {
    console.log('Accès à la page de connexion');
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Route pour gérer la connexion
app.post('/login', (req, res) => {
    console.log('Requête POST sur /login reçue');
    console.log('Données reçues :', req.body);

    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.loggedIn = true;
        req.session.role = user.role; // Stocke le rôle dans la session
        req.session.username = user.username; // Stocke le nom d'utilisateur dans la session
        console.log(`Connexion réussie pour : ${username}`);

        if (user.role === 'admin') {
            return res.redirect('/admin.html'); // Redirige vers la page d'administration
        } else {
            return res.redirect('/formulaire.html'); // Redirige vers la page formulaire
        }
    } else {
        console.log('Échec de la connexion : Identifiant ou mot de passe incorrect');
        res.status(401).send('Identifiant ou mot de passe incorrect');
    }
});

// Route pour gérer la déconnexion
app.post('/logout', (req, res) => {
    console.log('Déconnexion en cours');
    req.session.destroy(err => {
        if (err) {
            console.error('Erreur lors de la déconnexion :', err);
            return res.status(500).send('Erreur lors de la déconnexion');
        }
        res.redirect('/index.html'); // Redirige vers la page de connexion
    });
});

// Route pour soumettre un formulaire

app.post('/api/submit', upload.single('file'), (req, res) => {
    try {
        const {
            raison_sociale,
            siret,
            nom_prenom_gerant,
            num,
            mail,
            pdl,
            pce,
            date_fin_engagement,
            commentaires,
            consommation_gaz,
            consommation_electricite,
            Commission
        } = req.body;

        const submitted_by = req.session?.username;
            if (!submitted_by) {
                console.error('Erreur : L\'utilisateur connecté n\'est pas défini.');
                return res.status(400).send('Erreur : Utilisateur non connecté.');
            }

        const fichier = req.file ? req.file.filename : null; // Nom du fichier uploadé

        // Vérifions les valeurs pour débogage
        console.log('Données reçues :', {
            raison_sociale,
            siret,
            nom_prenom_gerant,
            num,
            mail,
            pdl,
            pce,
            date_fin_engagement,
            commentaires,
            consommation_gaz,
            consommation_electricite,
            Commission,
            submitted_by,
            fichier
        });

        const query = `
            INSERT INTO employes (
                raison_sociale, siret, nom_prenom_gerant, num, mail, pdl, pce, 
                date_fin_engagement, commentaires, submitted_by, 
                consommation_gaz, consommation_electricite, Commission, fichier
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            raison_sociale,
            siret,
            nom_prenom_gerant,
            num,
            mail,
            pdl,
            pce,
            date_fin_engagement,
            commentaires,
            submitted_by,
            consommation_gaz,
            consommation_electricite,
            Commission,
            fichier
        ];

        console.log('Exécution de la requête SQL...');
console.log('Requête SQL :', query);
console.log('Valeurs SQL :', values);
        // Exécution de la requête SQL
        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion des données dans la base :', err);
                return res.status(500).send('Erreur lors de l\'insertion des données');
            }

            console.log('Formulaire inséré avec succès dans la base :', result);
            res.status(200).send('Formulaire soumis avec succès');
        });
    } catch (error) {
        console.error('Erreur dans le traitement du formulaire :', error);
        res.status(500).send('Erreur interne du serveur');
    }
});
// Route pour afficher les données de la base (admin uniquement)
app.get('/api/database', (req, res) => {
    if (!req.session.loggedIn || req.session.role !== 'admin') {
        return res.status(403).send('Accès interdit');
    }

    const query = 'SELECT *, submitted_by FROM employes';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Erreur lors de la récupération des données');
        }
        results.forEach(item => {
            if (item.date_fin_engagement) {
                const date = new Date(item.date_fin_engagement);
                item.date_fin_engagement = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            }
        });
        res.json(results);
    });
});



// Route pour mettre à jour les données
app.put('/api/update/:id', upload.single('file'), (req, res) => {
    const id = req.params.id;

    const {
        raison_sociale,
        siret,
        nom_prenom_gerant,
        num,
        mail,
        pdl,
        pce,
        date_fin_engagement,
        commentaires,
        consommation_gaz,
        consommation_electricite,
        Commission
    } = req.body;

    const fichier = req.file ? req.file.filename : null;

    // Récupération des données existantes si nécessaire
    const fetchCurrentQuery = 'SELECT date_fin_engagement FROM employes WHERE id = ?';
    db.query(fetchCurrentQuery, [id], (fetchErr, fetchResults) => {
        if (fetchErr) {
            console.error('Erreur lors de la récupération des données existantes', fetchErr);
            return res.status(500).send('Erreur lors de la récupération des données existantes');
        }

        const currentDateFinEngagement = fetchResults[0]?.date_fin_engagement || null;
        const updatedDateFinEngagement = date_fin_engagement || currentDateFinEngagement;

        let query = '';
        let values = [];

        if (fichier) {
            query = `
                UPDATE employes
                SET raison_sociale = ?, siret = ?, nom_prenom_gerant = ?, num = ?, mail = ?, 
                    pdl = ?, pce = ?, date_fin_engagement = ?, commentaires = ?, 
                    consommation_gaz = ?, consommation_electricite = ?, Commission = ?, fichier = ?
                WHERE id = ?
            `;
            values = [
                raison_sociale,
                siret,
                nom_prenom_gerant,
                num,
                mail,
                pdl,
                pce,
                updatedDateFinEngagement,
                commentaires,
                consommation_gaz,
                consommation_electricite,
                Commission,
                fichier,
                id
            ];
        } else {
            query = `
                UPDATE employes
                SET raison_sociale = ?, siret = ?, nom_prenom_gerant = ?, num = ?, mail = ?, 
                    pdl = ?, pce = ?, date_fin_engagement = ?, commentaires = ?, 
                    consommation_gaz = ?, consommation_electricite = ?, Commission = ?
                WHERE id = ?
            `;
            values = [
                raison_sociale,
                siret,
                nom_prenom_gerant,
                num,
                mail,
                pdl,
                pce,
                updatedDateFinEngagement,
                commentaires,
                consommation_gaz,
                consommation_electricite,
                Commission,
                id
            ];
        }

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Erreur lors de la mise à jour des données :', err);
                return res.status(500).send('Erreur lors de la mise à jour des données');
            }

            console.log(`Données mises à jour pour l'ID ${id}`);
            res.status(200).send('Mise à jour réussie');
        });
    });
});

// Route pour exporter les données en Excel
app.get('/api/export-excel', (req, res) => {
    const query = 'SELECT * FROM employes';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données :', err);
            return res.status(500).send('Erreur lors de l\'exportation des données');
        }

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Employes');

        // Ajouter les en-têtes avec styles
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Raison Sociale', key: 'raison_sociale', width: 25 },
            { header: 'SIRET', key: 'siret', width: 20 },
            { header: 'Nom Gérant', key: 'nom_prenom_gerant', width: 25 },
            { header: 'Numéro', key: 'num', width: 15 },
            { header: 'Email', key: 'mail', width: 30 },
            { header: 'PDL', key: 'pdl', width: 15 },
            { header: 'PCE', key: 'pce', width: 15 },
            { header: 'Date Fin Engagement', key: 'date_fin_engagement', width: 20, style: { numFmt: 'DD/MM/YYYY' } },
            { header: 'Consommation Gaz', key: 'consommation_gaz', width: 15 },
            { header: 'Consonmmation électricité', key: 'consommation_electricite', width: 15 },
            { header: 'Commission', key: 'Commission', width: 15 },
            { header: 'Commentaires', key: 'commentaires', width: 40 },
            { header: 'Soumis Par', key: 'submitted_by', width: 20 },
        ];

        // Ajouter un style aux en-têtes
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0056B3' },
        };
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

        worksheet.addRows(results);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=employes.xlsx'
        );

        workbook.xlsx.write(res).then(() => res.end());
    });
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
