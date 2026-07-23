<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hors connexion — CONSTRUIRO ERP</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc;
            color: #1e293b;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
        }
        .card {
            background: #fff;
            border-radius: 1.5rem;
            padding: 3rem 2.5rem;
            max-width: 420px;
            width: 100%;
            text-align: center;
            box-shadow: 0 4px 32px rgba(0,0,0,.08);
        }
        .logo { font-size: 1.1rem; font-weight: 800; color: #F58220; margin-bottom: 2rem; }
        .emoji { font-size: 4rem; margin-bottom: 1rem; }
        h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: .75rem; color: #1e1e1e; }
        p { color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; font-size: .95rem; }
        .btn {
            display: inline-block;
            padding: .75rem 1.5rem;
            border-radius: .75rem;
            font-weight: 600;
            font-size: .875rem;
            background: #F58220;
            color: #fff;
            border: none;
            cursor: pointer;
            text-decoration: none;
            transition: opacity .15s;
        }
        .btn:hover { opacity: .85; }
        .hint { font-size: .75rem; color: #94a3b8; margin-top: 1rem; }
        @media (prefers-color-scheme: dark) {
            body { background: #0f172a; color: #e2e8f0; }
            .card { background: #1e293b; box-shadow: 0 4px 24px rgba(0,0,0,.3); }
            h1 { color: #f1f5f9; }
        }
    </style>
</head>
<body>
<div class="card">
    <div class="logo">🏗️ CONSTRUIRO ERP</div>
    <div class="emoji">📡</div>
    <h1>Vous êtes hors ligne</h1>
    <p>Vérifiez votre connexion internet et réessayez. Vos données en cours seront synchronisées automatiquement au retour du réseau.</p>
    <button class="btn" onclick="window.location.reload()">Réessayer</button>
    <p class="hint">Certaines pages récemment visitées peuvent être disponibles hors ligne.</p>
</div>
</body>
</html>
