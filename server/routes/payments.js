const express = require('express');
const router = express.Router();
const db = require('../database/init');

// GET /api/payments/student/:id - Paiements d'un étudiant
router.get('/student/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const payments = await db.all(`
            SELECT * FROM payments
            WHERE student_id = ?
            ORDER BY payment_month DESC
        `, [studentId]);

        res.json(payments);
    } catch (error) {
        console.error('Erreur récupération paiements:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/payments/:id/toggle - Basculer le statut de paiement
router.put('/:id/toggle', async (req, res) => {
    try {
        const paymentId = req.params.id;
        
        // Récupérer le statut actuel
        const payment = await db.get('SELECT is_paid FROM payments WHERE id = ?', [paymentId]);
        if (!payment) {
            return res.status(404).json({ error: 'Paiement non trouvé' });
        }

        const newStatus = payment.is_paid ? 0 : 1;
        const paidDate = newStatus ? new Date().toISOString().split('T')[0] : null;

        await db.run(`
            UPDATE payments 
            SET is_paid = ?, paid_date = ?
            WHERE id = ?
        `, [newStatus, paidDate, paymentId]);

        res.json({ 
            success: true, 
            isPaid: Boolean(newStatus),
            paidDate 
        });
    } catch (error) {
        console.error('Erreur modification paiement:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/payments/overdue - Paiements en retard
router.get('/overdue', async (req, res) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const overduePayments = await db.all(`
            SELECT 
                s.first_name,
                s.last_name,
                s.email,
                s.phone,
                p.payment_month,
                p.amount,
                julianday('now') - julianday(p.payment_month || '-01') as days_overdue
            FROM students s
            JOIN payments p ON s.id = p.student_id
            WHERE p.is_paid = 0
            AND p.payment_month < ?
            AND s.status = 'active'
            ORDER BY p.payment_month ASC
        `, [currentMonth]);

        res.json(overduePayments);
    } catch (error) {
        console.error('Erreur paiements en retard:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;