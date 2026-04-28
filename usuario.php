<?php
session_start();
include "php/conexao.php";

// Proteção da página
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

$user_id = $_SESSION['user_id'];
$nome = $_SESSION['user_nome'] ?? 'Usuário';

// Consultas para estatísticas e listas
$total_assistidos = $conn->query("SELECT COUNT(*) as total FROM assistidos WHERE usuario_id = $user_id")->fetch_assoc()['total'];
$total_favoritos = $conn->query("SELECT COUNT(*) as total FROM favoritos WHERE usuario_id = $user_id")->fetch_assoc()['total'];

$favs = $conn->query("SELECT * FROM favoritos WHERE usuario_id = $user_id ORDER BY data_adicionado DESC");
$assistidos = $conn->query("SELECT * FROM assistidos WHERE usuario_id = $user_id ORDER BY data_adicionado DESC");
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Perfil | <?php echo htmlspecialchars($nome); ?></title>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary: #e50914;
            --bg-dark: #0a0a0a;
            --card-bg: #141414;
            --text-main: #ffffff;
            --text-dim: #b3b3b3;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
        }

        /* Header / Navbar */
        .navbar {
            padding: 20px 4%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
            position: fixed;
            width: 100%;
            z-index: 100;
        }

        .logo { font-size: 1.5rem; font-weight: 700; color: var(--primary); text-decoration: none; }
        .back-link { color: white; text-decoration: none; font-weight: 600; font-size: 0.9rem; }

        /* Profile Banner */
        .profile-banner {
            padding: 120px 4% 40px;
            background: linear-gradient(to bottom, #1a1a1a 0%, var(--bg-dark) 100%);
            text-align: center;
        }

        .avatar {
            width: 100px;
            height: 100px;
            background: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
            font-size: 2.5rem;
            font-weight: 700;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }

        .stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 20px;
        }

        .stat-item h3 { font-size: 1.8rem; color: var(--primary); }
        .stat-item p { color: var(--text-dim); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

        /* Content Sections */
        .content-wrapper { padding: 40px 4%; }

        .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            gap: 15px;
        }

        .section-header h2 { font-size: 1.5rem; font-weight: 600; }
        .section-header span { 
            height: 2px; 
            flex-grow: 1; 
            background: linear-gradient(to right, var(--primary), transparent); 
        }

        /* Movie Grid & Cards */
        .movie-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 25px;
            margin-bottom: 50px;
        }

        .movie-card {
            background: var(--card-bg);
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
        }

        .movie-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.6);
        }

        .movie-card img {
            width: 100%;
            aspect-ratio: 2/3;
            object-fit: cover;
            display: block;
        }

        .movie-info {
            padding: 12px;
        }

        .movie-info h4 {
            font-size: 0.85rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 5px;
        }

        .date-added {
            font-size: 0.7rem;
            color: var(--text-dim);
        }

        /* Empty State */
        .empty-state {
            grid-column: 1 / -1;
            padding: 40px;
            text-align: center;
            background: #111;
            border-radius: 12px;
            border: 1px dashed #333;
            color: var(--text-dim);
        }

    </style>
</head>
<body>

<header class="navbar">
    <a href="home.html" class="logo">🎬 Filmes</a>
    <a href="home.html" class="back-link">← Voltar ao Início</a>
</header>

<section class="profile-banner">
    <div class="avatar"><?php echo substr($nome, 0, 1); ?></div>
    <h1><?php echo htmlspecialchars($nome); ?></h1>
    <div class="stats">
        <div class="stat-item">
            <h3><?php echo $total_favoritos; ?></h3>
            <p>Favoritos</p>
        </div>
        <div class="stat-item">
            <h3><?php echo $total_assistidos; ?></h3>
            <p>Assistidos</p>
        </div>
    </div>
</section>

<main class="content-wrapper">
    
    <div class="section-header">
        <h2>❤ Meus Favoritos</h2>
        <span></span>
    </div>

    <div class="movie-grid">
        <?php if($favs->num_rows > 0): ?>
            <?php while($f = $favs->fetch_assoc()): ?>
                <div class="movie-card">
                    <img src="<?php echo $f['imagem']; ?>" alt="<?php echo $f['titulo']; ?>">
                    <div class="movie-info">
                        <h4><?php echo htmlspecialchars($f['titulo']); ?></h4>
                        <p class="date-added">Adicionado em <?php echo date('d/m/Y', strtotime($f['data_adicionado'])); ?></p>
                    </div>
                </div>
            <?php endwhile; ?>
        <?php else: ?>
            <div class="empty-state">Você ainda não favoritou nenhum filme.</div>
        <?php endif; ?>
    </div>

    <div class="section-header">
        <h2>✔ Já Assistidos</h2>
        <span></span>
    </div>

    <div class="movie-grid">
        <?php if($assistidos->num_rows > 0): ?>
            <?php while($a = $assistidos->fetch_assoc()): ?>
                <div class="movie-card">
                    <img src="<?php echo $a['imagem']; ?>" alt="<?php echo $a['titulo']; ?>">
                    <div class="movie-info">
                        <h4><?php echo htmlspecialchars($a['titulo']); ?></h4>
                        <p class="date-added">Visto em <?php echo date('d/m/Y', strtotime($a['data_adicionado'])); ?></p>
                    </div>
                </div>
            <?php endwhile; ?>
        <?php else: ?>
            <div class="empty-state">Sua lista de filmes assistidos está vazia.</div>
        <?php endif; ?>
    </div>

</main>

</body>
</html>