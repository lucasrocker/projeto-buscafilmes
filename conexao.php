<?php
$conn = new mysqli("localhost", "root", "", "filmes_bd");

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}
?>
