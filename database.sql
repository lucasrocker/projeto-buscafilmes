CREATE DATABASE IF NOT EXISTS filmes_db;
USE filmes_db;

-- Tabela para os usuários do sistema
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para filmes (caso queira salvar favoritos ou avaliações depois)
CREATE TABLE IF NOT EXISTS filmes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tmdb_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    genero VARCHAR(100)
);