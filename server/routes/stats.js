const express = require('express');
const router = express.Router();
const db = require('../database/init');

// GET /api/stats/dashboard - Statistiques du tableau de bord
router.get('/dashboard', async (req, res) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Statistiques générales
        const totalStudents = await db.get(`
            SELECT COUNT(*) as count FROM students WHERE status = 'active'
        `);

        // Paiements du mois actuel
        const currentMonthStats = await db.get(`
            SELECT 
                COUNT(*) as total_expected,
                SUM(CASE WHEN is_paid = 1 THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN is_paid = 0 THEN 1 ELSE 0 END) as unpaid_count,
                SUM(CASE WHEN is_paid = 1 THEN amount ELSE 0 END) as total_revenue
            FROM payments p
            JOIN students s ON p.student_id = s.id
            WHERE p.payment_month = ? AND s.status = 'active'
        `, [currentMonth]);

        // Paiements en retard
        const overdueStats = await db.get(`
            SELECT COUNT(*) as overdue_count
            FROM payments p
            JOIN students s ON p.student_id = s.id
            WHERE p.is_paid = 0
            AND p.payment_month < ?
            AND s.status = 'active'
        `, [currentMonth]);

        // Répartition par niveau
        const levelDistribution = await db.all(`
            SELECT l.code, l.name, COUNT(s.id) as student_count
            FROM levels l
            LEFT JOIN students s ON l.id = s.level_id AND s.status = 'active'
            GROUP BY l.id, l.code, l.name
            ORDER BY l.order_index
        `);

        const stats = {
            totalStudents: totalStudents.count,
            activeStudents: totalStudents.count,
            paidThisMonth: currentMonthStats.paid_count || 0,
            unpaidThisMonth: currentMonthStats.unpaid_count || 0,
            totalRevenue: currentMonthStats.total_revenue || 0,
            paymentRate: currentMonthStats.total_expected > 0 
                ? Math.round((currentMonthStats.paid_count / currentMonthStats.total_expected) * 100)
                : 0,
            paymentsOverdue: overdueStats.overdue_count || 0,
            studentsWithCurrentMonth: currentMonthStats.total_expected || 0,
            levelDistribution: levelDistribution.reduce((acc, level) => {
                acc[level.code] = level.student_count;
                return acc;
            }, {})
        };

        res.json(stats);
    } catch (error) {
        console.error('Erreur statistiques:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;