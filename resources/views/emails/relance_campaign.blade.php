<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $campaignSubject }}</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
        .header { background: #1a1a2e; padding: 24px 32px; }
        .header img { height: 36px; }
        .body { padding: 32px; color: #333; line-height: 1.6; }
        .footer { background: #f9f9f9; padding: 16px 32px; font-size: 12px; color: #999; text-align: center; }
        .footer a { color: #F58220; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span style="color:#F58220;font-size:22px;font-weight:bold;">CONSTRUIRO</span>
        </div>
        <div class="body">
            {!! $bodyHtml !!}
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} CONSTRUIRO ERP — IBIG Soft. Tous droits réservés.</p>
            @if($unsubscribeUrl)
                <p><a href="{{ $unsubscribeUrl }}">Se désabonner</a></p>
            @endif
            @if($trackingToken)
                <img src="{{ url('/superadmin/relances/track/' . $trackingToken . '/open') }}"
                     width="1" height="1" alt="" style="display:none;">
            @endif
        </div>
    </div>
</body>
</html>
