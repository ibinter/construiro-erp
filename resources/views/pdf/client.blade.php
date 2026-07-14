<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    @include('pdf._styles')
    <style>
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #f97316; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 8px; }
        .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .info-grid td { padding: 5px 8px; font-size: 11px; vertical-align: top; }
        .info-grid td:first-child { color: #64748b; width: 35%; font-weight: bold; }
        .info-grid td:last-child { color: #0f172a; }
        .info-grid tr:nth-child(even) td { background: #f8fafc; }
    </style>
</head>
@php
    $d = fn($v) => $v ? \Illuminate\Support\Carbon::parse($v)->format('d/m/Y') : '—';
    $typeLabels = [
        'particulier' => 'Particulier', 'entreprise' => 'Entreprise',
        'public' => 'Secteur public', 'promoteur' => 'Promoteur immobilier',
    ];
@endphp
<body>
<div class="wrap">
    <table class="head">
        <tr>
            <td>
                <div class="brand">CONSTRU<span class="accent">IRO</span></div>
                <div class="brand-sub">ERP</div>
                <div class="company-info" style="margin-top:8px;">
                    <strong style="color:#0f172a;">{{ $company->name ?? 'Entreprise' }}</strong><br>
                    @if($company?->address){{ $company->address }}<br>@endif
                    {{ $company?->city }}{{ $company?->country ? ', '.$company->country : '' }}<br>
                    @if($company?->phone)Tél : {{ $company->phone }}<br>@endif
                    @if($company?->email){{ $company->email }}@endif
                </div>
            </td>
            <td style="text-align:right; vertical-align:top;">
                <div class="doc-title">
                    <div class="t">FICHE CLIENT <span class="num">{{ $client->code }}</span></div>
                </div>
                <div class="badge" style="margin-top:8px; background:{{ $client->is_active ? '#16a34a' : '#64748b' }}; color:#fff;">
                    {{ $client->is_active ? 'Actif' : 'Inactif' }}
                </div>
                <div style="margin-top:8px; font-size:10px; color:#64748b;">
                    Généré le {{ now()->format('d/m/Y à H:i') }}
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">Identité</div>
    <table class="info-grid">
        <tr><td>Raison sociale</td><td><strong>{{ $client->name }}</strong></td></tr>
        <tr><td>Type</td><td>{{ $typeLabels[$client->type] ?? $client->type }}</td></tr>
        @if($client->tax_id)<tr><td>NIF / Identifiant fiscal</td><td>{{ $client->tax_id }}</td></tr>@endif
    </table>

    <div class="section-title">Contact</div>
    <table class="info-grid">
        <tr><td>Interlocuteur</td><td>{{ $client->contact_name ?: '—' }}</td></tr>
        <tr><td>Téléphone</td><td>{{ $client->phone ?: '—' }}</td></tr>
        <tr><td>Email</td><td>{{ $client->email ?: '—' }}</td></tr>
    </table>

    <div class="section-title">Adresse</div>
    <table class="info-grid">
        <tr><td>Adresse</td><td>{{ $client->address ?: '—' }}</td></tr>
        <tr><td>Ville</td><td>{{ $client->city ?: '—' }}</td></tr>
    </table>

    @if($client->notes)
        <div class="section-title">Notes</div>
        <div class="notes">{{ $client->notes }}</div>
    @endif

    <div class="foot">
        {{ $company->name ?? 'CONSTRUIRO ERP' }} — Fiche Client {{ $client->code }} — Généré le {{ now()->format('d/m/Y') }} — CONFIDENTIEL
    </div>
</div>
</body>
</html>
