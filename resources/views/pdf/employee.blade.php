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
        table.att thead th { background: #0f172a; color: #fff; font-size: 10px; text-transform: uppercase; padding: 7px 8px; text-align: left; }
        table.att tbody td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        table.att tbody tr:nth-child(even) { background: #f8fafc; }
    </style>
</head>
@php
    $d = fn($v) => $v ? \Illuminate\Support\Carbon::parse($v)->format('d/m/Y') : '—';
    $fmt = fn($v, $c = null) => number_format((float)$v, 0, ',', ' ') . ' ' . ($c ?? $employee->currency ?? 'FCFA');
    $deptLabels = ['chantier' => 'Chantier', 'bureau' => 'Bureau', 'direction' => 'Direction', 'logistique' => 'Logistique', 'autre' => 'Autre'];
    $contractLabels = ['cdi' => 'CDI', 'cdd' => 'CDD', 'journalier' => 'Journalier', 'stage' => 'Stage', 'prestation' => 'Prestation'];
    $statusLabels = ['active' => 'Actif', 'suspended' => 'Suspendu', 'terminated' => 'Sorti'];
    $statusColors = ['active' => '#16a34a', 'suspended' => '#d97706', 'terminated' => '#dc2626'];
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
                    <div class="t">FICHE EMPLOYÉ <span class="num">{{ $employee->matricule }}</span></div>
                </div>
                <div class="badge" style="margin-top:8px; background:{{ $statusColors[$employee->status] ?? '#64748b' }}; color:#fff;">
                    {{ $statusLabels[$employee->status] ?? $employee->status }}
                </div>
                <div style="margin-top:8px; font-size:10px; color:#64748b;">
                    Généré le {{ now()->format('d/m/Y à H:i') }}
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">Identité</div>
    <table class="info-grid">
        <tr><td>Nom complet</td><td><strong>{{ $employee->full_name }}</strong></td></tr>
        <tr><td>Matricule</td><td>{{ $employee->matricule }}</td></tr>
        <tr><td>Poste</td><td>{{ $employee->job_title ?: '—' }}</td></tr>
        <tr><td>Département</td><td>{{ $deptLabels[$employee->department] ?? $employee->department }}</td></tr>
        <tr><td>Date d'embauche</td><td>{{ $d($employee->hire_date) }}</td></tr>
        @if($employee->birth_date)<tr><td>Date de naissance</td><td>{{ $d($employee->birth_date) }}</td></tr>@endif
    </table>

    <div class="section-title">Contrat & Rémunération</div>
    <table class="info-grid">
        <tr><td>Type de contrat</td><td>{{ $contractLabels[$employee->contract_type] ?? $employee->contract_type }}</td></tr>
        <tr><td>Salaire de base</td><td>{{ $fmt($employee->base_salary) }}</td></tr>
        @if($employee->site)<tr><td>Chantier affecté</td><td>{{ $employee->site->name }}</td></tr>@endif
    </table>

    <div class="section-title">Contact</div>
    <table class="info-grid">
        <tr><td>Téléphone</td><td>{{ $employee->phone ?: '—' }}</td></tr>
        <tr><td>Email</td><td>{{ $employee->email ?: '—' }}</td></tr>
        @if($employee->address)<tr><td>Adresse</td><td>{{ $employee->address }}</td></tr>@endif
    </table>

    @if(count($payslips) > 0)
        <div class="section-title">Dernières fiches de paie ({{ count($payslips) }})</div>
        <table class="att" style="width:100%; border-collapse:collapse;">
            <thead>
                <tr>
                    <th>Période</th>
                    <th style="text-align:right;">Salaire brut</th>
                    <th style="text-align:right;">Net à payer</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                @foreach($payslips as $ps)
                    <tr>
                        <td>{{ $ps->period }}</td>
                        <td style="text-align:right;">{{ number_format((float)($ps->gross_salary ?? 0), 0, ',', ' ') }}</td>
                        <td style="text-align:right;">{{ number_format((float)($ps->net_salary ?? 0), 0, ',', ' ') }}</td>
                        <td>{{ $ps->status }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="foot">
        {{ $company->name ?? 'CONSTRUIRO ERP' }} — Fiche Employé {{ $employee->matricule }} — Généré le {{ now()->format('d/m/Y') }} — CONFIDENTIEL
    </div>
</div>
</body>
</html>
