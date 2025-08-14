-- Activation des clés étrangères
PRAGMA foreign_keys = ON;

-- Table des niveaux scolaires
CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    order_index INTEGER NOT NULL
);

-- Table des étudiants
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    birth_date TEXT,
    level_id INTEGER,
    subscription_start_month TEXT NOT NULL,
    monthly_price REAL,
    notes TEXT,
    registration_date TEXT DEFAULT (DATE('now')),
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now')),
    FOREIGN KEY (level_id) REFERENCES levels(id)
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    payment_month TEXT NOT NULL,
    amount REAL NOT NULL,
    is_paid INTEGER DEFAULT 0,
    paid_date TEXT,
    payment_method TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now')),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(student_id, payment_month)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_students_level ON students(level_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_payments_month ON payments(payment_month);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);

-- Insertion des niveaux
INSERT OR IGNORE INTO levels (code, name, order_index) VALUES
('CP', 'Cours Préparatoire', 1),
('CE1', 'Cours Élémentaire 1', 2),
('CE2', 'Cours Élémentaire 2', 3),
('CM1', 'Cours Moyen 1', 4),
('CM2', 'Cours Moyen 2', 5),
('6ème', 'Sixième', 6),
('5ème', 'Cinquième', 7),
('4ème', 'Quatrième', 8),
('3ème', 'Troisième', 9),
('2nde', 'Seconde', 10),
('1ère', 'Première', 11),
('Terminale', 'Terminale', 12),
('Sup', 'Supérieur', 13),
('Spé', 'Spécialité', 14),
('Licence', 'Licence', 15),
('Master', 'Master', 16);