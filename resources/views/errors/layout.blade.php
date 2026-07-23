<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') — CONSTRUIRO ERP</title>
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
            box-shadow: 0 4px 32px rgba(0,0,0,.08);
            padding: 3rem 2.5rem;
            max-width: 520px;
            width: 100%;
            text-align: center;
        }
        .logo {
            font-size: 1.1rem;
            font-weight: 800;
            color: #F58220;
            margin-bottom: 2rem;
            letter-spacing: -0.01em;
        }
        .emoji { font-size: 3rem; margin-bottom: 0.75rem; }
        .code {
            font-size: 5rem;
            font-weight: 900;
            color: #F58220;
            line-height: 1;
            margin-bottom: 1rem;
        }
        h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: .75rem; color: #1e1e1e; }
        p  { color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; font-size: .95rem; }
        .actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
        .btn {
            display: inline-flex; align-items: center; gap: .5rem;
            padding: .65rem 1.25rem; border-radius: .75rem;
            font-size: .875rem; font-weight: 600; text-decoration: none;
            transition: opacity .15s;
        }
        .btn:hover { opacity: .85; }
        .btn-primary { background: #F58220; color: #fff; }
        .btn-outline  { border: 1.5px solid #cbd5e1; color: #475569; background: #f1f5f9; }
        .ref { margin-top: 1.75rem; font-size: .75rem; color: #94a3b8; }
        @media (prefers-color-scheme: dark) {
            body { background: #0f172a; color: #e2e8f0; }
            .card { background: #1e293b; box-shadow: 0 4px 24px rgba(0,0,0,.3); }
            h1 { color: #f1f5f9; }
            .btn-outline { border-color: #334155; color: #94a3b8; background: #0f172a; }
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">🏗️ CONSTRUIRO ERP</div>
        @hasSection('emoji')
        <div class="emoji">@yield('emoji')</div>
        @endif
        <div class="code">@yield('code')</div>
        <h1>@yield('title')</h1>
        <p>@yield('message')</p>
        @yield('extra')
        <div class="actions">
            <a href="{{ url('/') }}" class="btn btn-primary">← Retour à l'accueil</a>
            <a href="{{ url('/help/tickets/create') }}" class="btn btn-outline">Créer un ticket</a>
        </div>
        <p class="ref">Référence : ERR-@yield('code')-{{ strtoupper(substr(md5(request()->url() . microtime()), 0, 8)) }} · CONSTRUIRO v{{ config('app.version', '1.0') }}</p>
    </div>
</body>
</html>
