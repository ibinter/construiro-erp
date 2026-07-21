@extends('emails.layout')
@section('body')

{{-- Alert header --}}
<div style="background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);border:2px solid #f87171;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
    <div style="font-size:44px;margin-bottom:10px;">&#9888;</div>
    <div style="font-size:20px;font-weight:900;color:#b91c1c;margin-bottom:6px;">Alerte de securite</div>
    <div style="font-size:14px;color:#7f1d1d;line-height:1.5;">
        Une connexion inhabituelle a ete detectee<br>sur votre compte CONSTRUIRO.
    </div>
</div>

<div class="greeting">Bonjour {{ $userName }},</div>

<p>
    Nous avons detecte une connexion a votre compte depuis un
    <strong>appareil ou une localisation inhabituels</strong>.
    Par precaution, nous vous en informons immediatement.
</p>

{{-- Login details --}}
<div style="border:2px solid #fca5a5;border-radius:10px;overflow:hidden;margin:20px 0;">
    <div style="background:#b91c1c;padding:12px 20px;">
        <span style="color:white;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px;">&#128205; Details de la connexion</span>
    </div>
    <div style="background:white;padding:0 20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-weight:600;width:40%;">Date &amp; heure</td>
                <td style="padding:12px 0;font-weight:700;color:#0f172a;">{{ $loginAt }}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-weight:600;">Adresse IP</td>
                <td style="padding:12px 0;font-weight:700;color:#0f172a;font-family:monospace;">{{ $ipAddress }}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-weight:600;">Appareil</td>
                <td style="padding:12px 0;font-weight:700;color:#0f172a;">{{ $device }}</td>
            </tr>
            <tr>
                <td style="padding:12px 0;color:#64748b;font-weight:600;">Localisation</td>
                <td style="padding:12px 0;font-weight:700;color:#0f172a;">{{ $location }}</td>
            </tr>
        </table>
    </div>
</div>

{{-- Was it you? --}}
<div style="display:grid;gap:12px;margin:24px 0;">

    {{-- Yes --}}
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px 20px;display:flex;gap:14px;align-items:flex-start;">
        <span style="font-size:22px;flex-shrink:0;color:#16a34a;">&#10003;</span>
        <div>
            <p style="font-weight:700;color:#15803d;margin-bottom:4px;font-size:14px;">C'etait bien vous ?</p>
            <p style="font-size:13px;color:#166534;margin:0;line-height:1.6;">
                Aucune action n'est requise. Vous pouvez ignorer cet email en toute securite.
                Nous verifions chaque connexion pour proteger votre compte.
            </p>
        </div>
    </div>

    {{-- No --}}
    <div style="background:#fff1f2;border:1px solid #fca5a5;border-radius:10px;padding:16px 20px;display:flex;gap:14px;align-items:flex-start;">
        <span style="font-size:22px;flex-shrink:0;color:#b91c1c;">&#10007;</span>
        <div>
            <p style="font-weight:700;color:#b91c1c;margin-bottom:4px;font-size:14px;">Vous ne reconnaissez pas cette connexion ?</p>
            <p style="font-size:13px;color:#7f1d1d;margin:0;line-height:1.6;">
                Agissez immediatement : changez votre mot de passe et verifiez les
                sessions actives dans les parametres de securite de votre compte.
            </p>
        </div>
    </div>

</div>

{{-- Steps if not you --}}
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin:20px 0;">
    <p style="font-weight:700;color:#0f172a;margin-bottom:16px;font-size:14px;">Si ce n'etait pas vous — 3 etapes immediates</p>
    @php
    $steps = [
        ['n'=>'1','title'=>'Changer votre mot de passe','desc'=>'Utilisez un mot de passe fort d\'au moins 12 caracteres avec lettres, chiffres et symboles.'],
        ['n'=>'2','title'=>'Deconnecter toutes les sessions','desc'=>'Dans Profil > Securite, cliquez sur "Deconnecter tous les appareils".'],
        ['n'=>'3','title'=>'Verifier les acces et permissions','desc'=>'Assurez-vous qu\'aucun utilisateur non autorise n\'a ete ajoute a votre compte.'],
    ];
    @endphp
    @foreach($steps as $step)
    <div style="display:flex;gap:14px;align-items:flex-start;{{ !$loop->last ? 'margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f1f5f9;' : '' }}">
        <div style="width:28px;height:28px;background:#1E3A5F;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="color:white;font-weight:900;font-size:13px;">{{ $step['n'] }}</span>
        </div>
        <div>
            <p style="font-weight:700;color:#0f172a;margin-bottom:2px;font-size:14px;">{{ $step['title'] }}</p>
            <p style="font-size:13px;color:#64748b;margin:0;line-height:1.5;">{{ $step['desc'] }}</p>
        </div>
    </div>
    @endforeach
</div>

<div class="cta-block">
    <a href="{{ $securityUrl }}" class="cta-btn" style="font-size:16px;padding:16px 40px;background:#dc2626;">
        Securiser mon compte maintenant &#8594;
    </a>
</div>

<div class="divider"></div>

<p style="font-size:13px;color:#94a3b8;text-align:center;">
    Si vous avez des doutes, contactez notre equipe de securite :
    <a href="mailto:support@ibigsoft.com" style="color:#F58220;font-weight:600;">support@ibigsoft.com</a>
</p>

@endsection
