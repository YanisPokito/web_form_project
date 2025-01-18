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
const db = mysql.createConnection({
    host: 'dpg-cu44forqf0us73b33bog-a',    // Adresse du serveur MySQL
    user: 'mydatabase_nny6',         // Nom d'utilisateur MySQL
    password: 'Chshn29qRzZfyLpdwNtZYcW1TUlHU1bS',         // Mot de passe MySQL (laisse vide si tu n'as pas défini de mot de passe)
    database: 'mydatabase' // Remplace par le nom de ta base de données
});

// Connexion à la base de données
db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

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
    { username: 'NusretinNAZIFOV', password: 'Nusret38@', role: 'user' },
    { username: 'GeraldDelConsole', password: 'gerald38', role: 'user' },
    { username: 'RobinMalandain', password: 'Robin73', role: 'user' },
    { username: 'OmerBascesme', password: 'Omer38130', role: 'user' }
];


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
app.post('/api/submit', (req, res) => {
    if (!req.session.loggedIn || req.session.role !== 'user') {
        return res.status(403).send('Non autorisé');
    }

    const {
        raison_sociale,
        siret,
        nom_prenom_gerant,
        num,
        mail,
        pdl,
        pce,
        date_fin_engagement,
        commentaires
    } = req.body;

    const submittedBy = req.session.username;

    const query = `
        INSERT INTO employes
        (raison_sociale, siret, nom_prenom_gerant, num, mail, pdl, pce, date_fin_engagement, commentaires, submitted_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        submittedBy
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion des données :', err);
            return res.status(500).send('Erreur lors de l\'insertion des données');
        }

        console.log(`Formulaire soumis avec succès par : ${submittedBy}`);
        res.status(200).send('Formulaire soumis avec succès');
    });
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
app.put('/api/update/:id', (req, res) => {
    if (!req.session.loggedIn || req.session.role !== 'admin') {
        return res.status(403).send('Non autorisé');
    }

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
        commentaires
    } = req.body;

    // Fetch the current data if date_fin_engagement is not provided
    const fetchCurrentQuery = 'SELECT date_fin_engagement FROM employes WHERE id = ?';
    db.query(fetchCurrentQuery, [id], (fetchErr, fetchResults) => {
        if (fetchErr) {
            return res.status(500).send('Erreur lors de la récupération des données existantes');
        }

        const currentDateFinEngagement = fetchResults[0]?.date_fin_engagement || null;
        const updatedDateFinEngagement = date_fin_engagement || currentDateFinEngagement;

        const query = `
            UPDATE employes
            SET raison_sociale = ?, siret = ?, nom_prenom_gerant = ?, num = ?, mail = ?, pdl = ?, pce = ?, date_fin_engagement = ?, commentaires = ?
            WHERE id = ?
        `;
        const values = [raison_sociale, siret, nom_prenom_gerant, num, mail, pdl, pce, updatedDateFinEngagement, commentaires, id];

        db.query(query, values, (err, result) => {
            if (err) {
                return res.status(500).send('Erreur lors de la mise à jour des données');
            }
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
