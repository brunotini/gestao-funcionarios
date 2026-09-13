CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tempo_empresa TEXT,
    eh_freela INTEGER DEFAULT 0
);
