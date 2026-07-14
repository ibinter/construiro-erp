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
        .amount-box { background: #0f172a; color: #fff; border-radius: 8px; padding: 14px 20px; text-align: center; margin: 14px 0; }
        .amount-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
        .amount-box .value { font-size: 22px; font-weight: bold; color: #f97316; margin-top: 4px; }
        .sig-area { border: 2px dashed #e2e8f0; border-radius: 6px; padding: 20px; text-align: center; font-size: 10px; color: #94a3b8; margin-top: 20px; }
    </style>
</head>
@php
    $d = fn($v) => $v ? \Illuminate\Support\Carbon::parse($v)->format('d/m/Y') : '—';
    $fmt = fn($v) => number_format((float)$v, 0, ',', ' ') . ' ' . $contract->currency;
    $statusLabels = ['draft' => 'Brouillon', 'active' => 'Actif', 'suspended' => 'Suspendu', 'closed' => 'Clôturé', 'cancelled' => 'Annulé'];
    $statusColors = ['draft' => '#64748b', 'active' => '#16a34a', 'suspended' => '#d97706', 'closed' => '#3b82f6', 'cancelled' => '#dc2626'];
    $typeLabels = ['client' => 'Client', 'sous_traitance' => 'Sous-traitance', 'fournisseur' => 'Fournisseur', 'autre' => 'Autre'];
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
                    <div class="t">CONTRAT <span class="num">{{ $contract->code }}</span></div>
                </div>
                <div class="badge" style="margin-top:8px; background:{{ $statusColors[$contract->status] ?? '#64748b' }}; color:#fff;">
                    {{ $statusLabels[$contract->status] ?? $contract->status }}
                </div>
                @if(!empty($qr_svg) && !empty($verify_url))
                <div style="margin-top:10px; display:inline-block; text-align:center;">
                    <div style="border:1px solid #e2e8f0; border-radius:6px; padding:6px; display:inline-block;">
                        {!! $qr_svg !!}
                    </div>
                    <div style="font-size:7px; color:#94a3b8; margin-top:3px; max-width:130px;">
                        Scanner pour vérifier l'authenticité
                    </div>
                </div>
                @endif
                <div style="margin-top:8px; font-size:10px; color:#64748b;">
                    Généré le {{ now()->format('d/m/Y à H:i') }}
                </div>
            </td>
        </tr>
    </table>

    <div class="amount-box">
        <div class="label">Montant du contrat</div>
        <div class="value">{{ $fmt($contract->amount) }}</div>
    </div>

    <div class="section-title">Parties contractantes</div>
    <table class="info-grid">
        <tr><td>Objet</td><td><strong>{{ $contract->title }}</strong></td></tr>
        <tr><td>Type de contrat</td><td>{{ $typeLabels[$contract->type] ?? $contract->type }}</td></tr>
        <tr><td>Cocontractant</td><td>{{ $contract->party_name ?: '—' }}</td></tr>
        @if($contract->project)<tr><td>Projet associé</td><td>{{ $contract->project->name }}</td></tr>@endif
    </table>

    <div class="section-title">Durée</div>
    <table class="info-grid">
        <tr><td>Date de début</td><td>{{ $d($contract->start_date) }}</td></tr>
        <tr><td>Date de fin</td><td>{{ $d($contract->end_date) }}</td></tr>
        <tr><td>Date de signature</td><td>{{ $d($contract->signed_date) }}</td></tr>
    </table>

    @if($contract->description)
        <div class="section-title">Description</div>
        <div class="notes">{{ $contract->description }}</div>
    @endif

    @if($contract->notes)
        <div class="section-title">Notes</div>
        <div class="notes">{{ $contract->notes }}</div>
    @endif

    @if($contract->status === 'draft' || !$contract->signed_date)
        <div class="sig-area">
            <strong>Signature</strong><br>
            Ce document est en attente de signature.<br>
            _____________________________ &nbsp;&nbsp;&nbsp; _____________________________<br>
            <span style="color:#0f172a;">{{ $company->name ?? 'Entreprise' }}</span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span style="color:#0f172a;">{{ $contract->party_name ?: 'Cocontractant' }}</span>
        </div>
    @endif

    <div class="foot">
        {{ $company->name ?? 'CONSTRUIRO ERP' }} — Contrat {{ $contract->code }} — Généré le {{ now()->format('d/m/Y') }} — CONFIDENTIEL
    </div>
</div>
</body>
</html>
