@extends('emails.layout')
@section('body')

{{-- Success banner --}}
<div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:1px solid #86efac;border-radius:12px;padding:28px 24px;margin-bottom:28px;text-align:center;">
    <div style="width:60px;height:60px;background:#16a34a;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
        <span style="color:white;font-size:28px;line-height:1;">&#10003;</span>
    </div>
    <div style="font-size:22px;font-weight:900;color:#15803d;margin-bottom:4px;">Paiement recu !</div>
    <div style="font-size:14px;color:#166534;">Votre abonnement <strong>{{ $planName }}</strong> est maintenant actif.</div>
</div>

<div class="greeting">Bonjour {{ $userName }},</div>

<p>
    Merci pour votre confiance. Nous avons bien recu votre paiement et votre compte est
    entierement actif. Vous pouvez des maintenant profiter de toutes les fonctionnalites
    CONSTRUIRO ERP.
</p>

{{-- Receipt box --}}
<div style="border:2px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:24px 0;">
    <div style="background:#1E3A5F;padding:14px 20px;">
        <span style="color:white;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">&#128196; Recapitulatif de paiement</span>
    </div>
    <div style="padding:0 20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-weight:500;">Formule</td>
                <td style="padding:12px 0;text-align:right;font-weight:700;color:#0f172a;">{{ $planName }}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-weight:500;">Montant</td>
                <td style="padding:12px 0;text-align:right;font-weight:700;color:#16a34a;font-size:16px;">
                    {{ $amount }} {{ $currency }}
                </td>
            </tr>
            @if($reference)
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-weight:500;">Reference</td>
                <td style="padding:12px 0;text-align:right;font-weight:600;color:#0f172a;font-family:monospace;font-size:13px;">
                    {{ $reference }}
                </td>
            </tr>
            @endif
            @if($paidAt)
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-weight:500;">Date de paiement</td>
                <td style="padding:12px 0;text-align:right;font-weight:600;color:#0f172a;">{{ $paidAt }}</td>
            </tr>
            @endif
            @if($accessUntil)
            <tr>
                <td style="padding:12px 0;color:#64748b;font-weight:500;">Acces valable jusqu'au</td>
                <td style="padding:12px 0;text-align:right;font-weight:700;color:#1E3A5F;">{{ $accessUntil }}</td>
            </tr>
            @endif
        </table>
    </div>
</div>

{{-- What's included --}}
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin:20px 0;">
    <p style="font-weight:700;color:#0f172a;margin-bottom:14px;font-size:14px;">
        &#127775; Ce qui est inclus dans votre formule {{ $planName }}
    </p>
    @php
    $features = [
        'Tous les modules BTP (chantiers, RH, stock, facturation)',
        'Tableaux de bord temps reel',
        'Support prioritaire par email et WhatsApp',
        'Mises a jour automatiques',
        'Sauvegarde quotidienne de vos donnees',
    ];
    @endphp
    @foreach($features as $feature)
    <div style="display:flex;align-items:center;gap:10px;padding:5px 0;">
        <span style="color:#16a34a;font-weight:900;font-size:16px;flex-shrink:0;">&#10003;</span>
        <span style="font-size:14px;color:#475569;">{{ $feature }}</span>
    </div>
    @endforeach
</div>

{{-- CTAs --}}
<div class="cta-block">
    <a href="{{ $dashboardUrl }}" class="cta-btn" style="font-size:16px;padding:16px 40px;">
        Acceder a mon espace &#8594;
    </a>
    @if($invoiceUrl)
    <br>
    <a href="{{ $invoiceUrl }}" style="display:inline-block;margin-top:14px;color:#1E3A5F;font-size:13px;font-weight:600;text-decoration:none;border:1px solid #cbd5e1;border-radius:6px;padding:8px 20px;">
        &#128196; Telecharger la facture
    </a>
    @endif
</div>

<div class="divider"></div>

<p style="font-size:13px;color:#94a3b8;text-align:center;">
    Un probleme avec votre paiement ?
    <a href="mailto:support@ibigsoft.com" style="color:#F58220;font-weight:600;">Contactez-nous</a> —
    nous repondons sous 24h.
</p>

@endsection
