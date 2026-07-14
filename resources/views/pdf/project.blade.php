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
        .progress-bar { background: #e2e8f0; border-radius: 4px; height: 8px; width: 100%; }
        .progress-fill { background: #f97316; border-radius: 4px; height: 8px; }
        table.sites thead th { background: #0f172a; color: #fff; font-size: 10px; text-transform: uppercase; padding: 7px 8px; text-align: left; }
        table.sites tbody td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        table.sites tbody tr:nth-child(even) { background: #f8fafc; }
    </style>
</head>
@php
    $d = fn($v) => $v ? \Illuminate\Support\Carbon::parse($v)->format('d/m/Y') : '—';
    $fmt = fn($v, $c = null) => number_format((float)$v, 0, ',', ' ') . ' ' . ($c ?? $project->currency ?? '');
    $statusLabels = [
        'planning' => 'Planification', 'active' => 'En cours', 'on_hold' => 'En attente',
        'completed' => 'Terminé', 'cancelled' => 'Annulé',
    ];
    $typeLabels = [
        'residential' => 'Résidentiel', 'commercial' => 'Commercial', 'industrial' => 'Industriel',
        'infrastructure' => 'Infrastructure', 'renovation' => 'Rénovation', 'other' => 'Autre',
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
                    <div class="t">FICHE PROJET <span class="num">{{ $project->code }}</span></div>
                </div>
                <div class="badge" style="margin-top:8px; background:#0f172a; color:#fff;">
                    {{ $statusLabels[$project->status] ?? $project->status }}
                </div>
                <div style="margin-top:8px; font-size:10px; color:#64748b;">
                    Généré le {{ now()->format('d/m/Y à H:i') }}
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">Informations générales</div>
    <table class="info-grid">
        <tr><td>Nom du projet</td><td><strong>{{ $project->name }}</strong></td></tr>
        <tr><td>Type</td><td>{{ $typeLabels[$project->type] ?? $project->type }}</td></tr>
        <tr><td>Client</td><td>{{ $project->client_name ?: '—' }}</td></tr>
        <tr><td>Chef de projet</td><td>{{ $project->manager?->name ?? '—' }}</td></tr>
        <tr><td>Date de début</td><td>{{ $d($project->start_date) }}</td></tr>
        <tr><td>Date de fin prévue</td><td>{{ $d($project->end_date) }}</td></tr>
    </table>

    <div class="section-title">Finances & Avancement</div>
    <table class="info-grid">
        <tr><td>Budget</td><td>{{ $fmt($project->budget_amount) }}</td></tr>
        <tr><td>Dépensé</td><td>{{ $fmt($project->amount_spent ?? 0) }}</td></tr>
        <tr><td>Reste</td><td>{{ $fmt(max(0, ($project->budget_amount ?? 0) - ($project->amount_spent ?? 0))) }}</td></tr>
        <tr>
            <td>Avancement</td>
            <td>
                {{ $project->progress ?? 0 }} %
                <div class="progress-bar" style="margin-top:4px;">
                    <div class="progress-fill" style="width:{{ min(100, $project->progress ?? 0) }}%;"></div>
                </div>
            </td>
        </tr>
    </table>

    @if($project->description)
        <div class="section-title">Description</div>
        <div class="notes">{{ $project->description }}</div>
    @endif

    @if($project->sites && count($project->sites) > 0)
        <div class="section-title">Chantiers ({{ count($project->sites) }})</div>
        <table class="sites" style="width:100%; border-collapse:collapse;">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Nom du chantier</th>
                    <th>Statut</th>
                    <th style="text-align:right;">Avancement</th>
                    <th>Ville</th>
                </tr>
            </thead>
            <tbody>
                @foreach($project->sites as $site)
                    <tr>
                        <td>{{ $site->code }}</td>
                        <td>{{ $site->name }}</td>
                        <td>{{ $site->status }}</td>
                        <td style="text-align:right;">{{ $site->progress ?? 0 }} %</td>
                        <td>{{ $site->city ?? '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="foot">
        {{ $company->name ?? 'CONSTRUIRO ERP' }} — Fiche Projet {{ $project->code }} — Généré le {{ now()->format('d/m/Y') }} — CONFIDENTIEL
    </div>
</div>
</body>
</html>
