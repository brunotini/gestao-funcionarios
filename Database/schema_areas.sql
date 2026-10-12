 CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL

 );

 CREATE TABLE IF NOT EXISTS funcionario_area (
    funcionario_id INTEGER NOT NULL,
    area_id INTEGER NOT NULL,
    PRIMARY KEY (funcionario_id, area_id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
    FOREIGN KEY (area_id) REFERENCES areas(id)
);