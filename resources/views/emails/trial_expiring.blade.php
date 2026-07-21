@extends('emails.layout')
@section('body')

{{-- Urgency badge --}}
@if($daysLeft <= 1)
    <div class="badge-danger" style="font-size:13px;padding:6px 16px;">
        &#9888; Dernier jour — expire le {{ $expiresAt }}
    </div>
@elseif($daysLeft <= 3)
    <div class="badge-danger" style="font-size:13px;padding:6px 16px;">
        &#9888; Plus que {{ $daysLeft }} jours
    </div>
@else
    <div class="badge-warning" style="font-size:13px;padding:6px 16px;">
        &#9203; {{ $daysLeft }} jours restants
    </div>
@endif

{{-- Countdown visual --}}
<div style="background:linear-gradient(135deg,#fff8f0 0%,#fff3e8 100%);border:1px solid #f58220;border-radius:12px;padding:24px;margin:16px 0 24px;text-align:center;">
    <div style="font-size:48px;font-weight:900;color:#F58220;line-height:1;">{{ $daysLeft }}</div>
    <div style="font-size:13px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">
        {{ $daysLeft <= 1 ? 'jour restant' : 'jours restants' }}
    </div>
    <div style="height:8px;background:#fde68a;border-radius:4px;margin:14px auto 0;max-width:200px;overflow:hidden;">
        <div style="height:100%;width:{{ max(4, min(100, ($daysLeft / 14) * 100)) }}%;background:#F58220;border-radius:4px;"></div>
    </div>
</div>

<div class="greeting">
    Bonjour {{ $userName }},
</div>

<p>
    Votre {{ $isTrial ? 'période d\'essai' : 'abonnement' }} <strong>CONSTRUIRO ERP</strong>
    expire le <strong>{{ $expiresAt }}</strong>.
    @if($daysLeft <= 3)
        <strong style="color:#dc2626;">Ne perdez pas l'accès à vos chantiers et données.</strong>
    @else
        Passez au plan Pro pour continuer sans interruption.
    @endif
</p>

{{-- What they'll lose --}}
<div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin:20px 0;">
    <p style="font-weight:700;color:#0f172a;margin-bottom:12px;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">
        Ce que vous perdez sans abonnement
    </p>
    @php
    $items = [
        ['icon'=>'&#127963;', 'text'=>'Gestion illimitée de chantiers et projets'],
        ['icon'=>'&#128196;', 'text'=>'Devis, bons de commande et factures'],
        ['icon'=>'&#128101;', 'text'=>'Suivi du personnel, congés et pointage'],
        ['icon'=>'&#128200;', 'text'=>'Tableaux de bord et rapports financiers'],
        ['icon'=>'&#128274;', 'text'=>'Accès sécurisé à toutes vos données'],
    ];
    @endphp
    @foreach($items as $item)
    <div style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px solid #f1f5f9;">
        <span style="font-size:18px;flex-shrink:0;">{{ $item['icon'] }}</span>
        <span style="font-size:14px;color:#475569;line-height:1.5;">{{ $item['text'] }}</span>
    </div>
    @endforeach
</div>

<p style="font-size:14px;color:#475569;">
    Vos données sont conservées <strong>30 jours</strong> apres l'expiration.
    Activez votre abonnement maintenant pour ne subir aucune interruption.
</p>

<div class="cta-block">
    <a href="{{ $renewUrl }}" class="cta-btn" style="font-size:16px;padding:16px 40px;">
        {{ $isTrial ? 'Activer mon abonnement' : 'Renouveler maintenant' }} &#8594;
    </a>
    <p style="margin-top:12px;font-size:12px;color:#94a3b8;">
        Activation en moins de 2 minutes &bull; Sans engagement
    </p>
</div>

<div class="divider"></div>

<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px 20px;margin-bottom:8px;">
    <p style="font-weight:700;color:#0369a1;margin-bottom:6px;font-size:13px;">
        &#128222; Besoin d'aide pour choisir votre formule ?
    </p>
    <p style="font-size:13px;color:#0c4a6e;margin:0;">
        Notre equipe est disponible du lundi au vendredi, 8h–18h.<br>
        <a href="mailto:support@ibigsoft.com" style="color:#F58220;font-weight:600;">support@ibigsoft.com</a>
        &nbsp;&bull;&nbsp;
        <a href="https://wa.me/22500000000" style="color:#F58220;font-weight:600;">WhatsApp</a>
    </p>
</div>

@endsection
