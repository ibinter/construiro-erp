<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') — CONSTRUIRO</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f1f5f9;
            color: #334155;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
        }
        .card {
            background: #fff;
            border-radius: 1rem;
            box-shadow: 0 4px 24px rgba(0,0,0,.08);
            padding: 3rem 2.5rem;
            max-width: 520px;
            width: 100%;
            text-align: center;
        }
        .code {
            font-size: 5rem;
            font-weight: 800;
            color: #f97316;
            line-height: 1;
            margin-bottom: 1rem;
        }
        h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: .75rem; }
        p  { color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; font-size: .95rem; }
        .actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
        .btn {
            display: inline-flex; align-items: center; gap: .5rem;
            padding: .6rem 1.25rem; border-radius: .6rem;
            font-size: .875rem; font-weight: 600; text-decoration: none;
            transition: opacity .15s;
        }
        .btn:hover { opacity: .85; }
        .btn-primary { background: #f97316; color: #fff; }
        .btn-outline  { border: 1.5px solid #cbd5e1; color: #475569; }
        .ref { margin-top: 2rem; font-size: .75rem; color: #94a3b8; }
        @media (prefers-color-scheme: dark) {
            body { background: #0f172a; color: #e2e8f0; }
            .card { background: #1e293b; box-shadow: 0 4px 24px rgba(0,0,0,.3); }
            .btn-outline { border-color: #334155; color: #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="code">@yield('code')</div>
        <h1>@yield('title')</h1>
        <p>@yield('message')</p>
        <div class="actions">
            <a href="{{ url('/dashboard') }}" class="btn btn-primary">← Tableau de bord</a>
            <a href="{{ url('/support') }}" class="btn btn-outline">Contacter le support</a>
        </div>
        @yield('extra')
        <p class="ref">Référence : {{ uniqid('ERR-') }} · CONSTRUIRO v{{ config('app.version', '1.0') }}</p>
    </div>
</body>
</html>
