const express = require('express');
const router = express.Router();
const db = require('../database/init');

// GET /api/students
router.get('/', async (req, res) => {
    try {
        const { search, level, status = 'active' } = req.query;
        
        let sql = `
            SELECT s.*, l.code as level_code, l.name as level_name
            FROM students s
            LEFT JOIN levels l ON s.level_id = l.id
            WHERE s.status = ?
        `;
        let params = [status];

        if (search) {
            sql += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (level) {
            sql += ` AND l.code = ?`;
            params.push(level);
        }

        sql += ` ORDER BY s.last_name, s.first_name`;

        const students = await db.all(sql, params);
        
        // Récupérer les paiements pour chaque étudiant
        const studentsWithPayments = await Promise.all(
            students.map(async (student) => {
                const payments = await db.all(
                    'SELECT payment_month, is_paid FROM payments WHERE student_id = ?',
                    [student.id]
                );
                
                const paymentsObj = {};
                payments.forEach(payment => {
                    paymentsObj[payment.payment_month] = Boolean(payment.is_paid);
                });
                
                return {
                    ...student,
                    level: student.level_code, // Compatibilité avec votre frontend
                    payments: paymentsObj
                };
            })
        );

        res.json(studentsWithPayments);
    } catch (error) {
        console.error('Erreur GET students:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/students
router.post('/', async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, birthDate,
            level, subscriptionMonth, price, notes
        } = req.body;

        if (!firstName || !lastName || !level || !subscriptionMonth) {
            return res.status(400).json({ 
                error: 'Champs obligatoires manquants' 
            });
        }

        // Récupérer l'ID du niveau
        const levelData = await db.get('SELECT id FROM levels WHERE code = ?', [level]);
        if (!levelData) {
            return res.status(400).json({ error: 'Niveau invalide' });
        }

        // Insérer l'étudiant
        const result = await db.run(`
            INSERT INTO students (
                first_name, last_name, email, phone, birth_date,
                level_id, subscription_start_month, monthly_price, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            firstName, lastName, email, phone, birthDate,
            levelData.id, subscriptionMonth, parseFloat(price) || 0, notes
        ]);

        // Créer les paiements mensuels
        await createMonthlyPayments(result.id, subscriptionMonth, parseFloat(price) || 0);

        res.status(201).json({ 
            id: result.id, 
            message: 'Étudiant créé avec succès' 
        });
    } catch (error) {
        console.error('Erreur POST student:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'Email déjà utilisé' });
        } else {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const {
            firstName, lastName, email, phone, birthDate,
            level, subscriptionMonth, price, notes
        } = req.body;

        const levelData = await db.get('SELECT id FROM levels WHERE code = ?', [level]);
        if (!levelData) {
            return res.status(400).json({ error: 'Niveau invalide' });
        }

        await db.run(`
            UPDATE students SET
                first_name = ?, last_name = ?, email = ?, phone = ?,
                birth_date = ?, level_id = ?, subscription_start_month = ?,
                monthly_price = ?, notes = ?, updated_at = DATETIME('now')
            WHERE id = ?
        `, [
            firstName, lastName, email, phone, birthDate,
            levelData.id, subscriptionMonth, parseFloat(price) || 0, notes, studentId
        ]);

        res.json({ message: 'Étudiant modifié avec succès' });
    } catch (error) {
        console.error('Erreur PUT student:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const result = await db.run('DELETE FROM students WHERE id = ?', [studentId]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Étudiant non trouvé' });
        }
        
        res.json({ message: 'Étudiant supprimé avec succès' });
    } catch (error) {
        console.error('Erreur DELETE student:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Fonction utilitaire
async function createMonthlyPayments(studentId, startMonth, monthlyPrice) {
    const startDate = new Date(startMonth + '-01');
    const currentDate = new Date();
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1);

    let currentMonth = new Date(startDate);
    
    while (currentMonth <= endDate) {
        const monthString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        
        try {
            await db.run(`
                INSERT OR IGNORE INTO payments (student_id, payment_month, amount)
                VALUES (?, ?, ?)
            `, [studentId, monthString, monthlyPrice]);
        } catch (error) {
            console.error('Erreur création paiement:', error);
        }

        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
}

module.exports = router;