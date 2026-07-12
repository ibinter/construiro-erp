<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'CONSTRUIRO' }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; color: #0f172a; -webkit-font-smoothing: antialiased; }
        .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: #0f172a; padding: 28px 32px; display: flex; align-items: center; gap: 12px; }
        .logo-mark { width: 40px; height: 40px; background: #ea580c; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; color: white; font-size: 18px; text-align:center; line-height:40px; }
        .logo-text { color: white; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
        .logo-sub  { color: #ea580c; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; display: block; }
        .content { padding: 40px 32px; }
        .greeting { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
        p { font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 14px; }
        .cta-block { text-align: center; margin: 32px 0; }
        .cta-btn { display: inline-block; background: #ea580c; color: white !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; }
        .cta-btn:hover { background: #c2410c; }
        .divider { height: 1px; background: #e2e8f0; margin: 28px 0; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-box p { margin-bottom: 6px; }
        .info-label { font-weight: 600; color: #0f172a; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; }
        .footer p { font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
        .footer a { color: #ea580c; text-decoration: none; }
        .footer-links { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-top: 12px; }
        .badge-warning { display: inline-block; background: #fef3c7; color: #b45309; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
        .badge-success { display: inline-block; background: #dcfce7; color: #15803d; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
        .badge-danger  { display: inline-block; background: #fee2e2; color: #b91c1c; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    </style>
</head>
<body>
<div class="wrapper">
    {{-- Header --}}
    <div class="header">
        <div class="logo-mark">C</div>
        <div style="margin-left:10px">
            <div class="logo-text">CONSTRUIRO</div>
            <span class="logo-sub">ERP BTP</span>
        </div>
    </div>

    {{-- Body --}}
    <div class="content">
        @yield('body')
    </div>

    {{-- Footer --}}
    <div class="footer">
        <p>© {{ date('Y') }} <strong>IBIG Soft</strong> — IBIG SARL, Intermark Business International Group</p>
        <p><a href="https://ibigsoft.com">ibigsoft.com</a> · <a href="mailto:support@ibigsoft.com">support@ibigsoft.com</a></p>
        <div class="footer-links">
            <a href="{{ url('/legal/cgu') }}">CGU</a>
            <a href="{{ url('/legal/privacy') }}">Confidentialité</a>
            <a href="{{ url('/legal/legal') }}">Mentions légales</a>
        </div>
        <p style="margin-top:12px">Vous recevez cet email car vous avez un compte CONSTRUIRO.</p>
    </div>
</div>
</body>
</html>
