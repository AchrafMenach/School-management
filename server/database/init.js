const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, 'school.db');
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Erreur ouverture base:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Connexion SQLite établie');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('❌ Erreur création tables:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Tables initialisées');
                    resolve();
                }
            });
        });
    }

    // Méthodes utilitaires
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) console.error('Erreur fermeture:', err.message);
                    else console.log('✅ Base fermée');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = new Database();