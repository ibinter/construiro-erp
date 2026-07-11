<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Tableau de bord BI</title>
@include('pdf._styles')
<style>
    /* KPI tiles */
    .kpi-grid { width: 100%; border-collapse: collapse; margin-top: 22px; }
    .kpi-grid td { width: 25%; padding: 6px 8px; }
    .kpi-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; background: #f8fafc; }
    .kpi-box .kpi-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
    .kpi-box .kpi-val { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px; }
    .kpi-box .kpi-hint { font-size: 9px; color: #94a3b8; margin-top: 2px; }
    .kpi-box.accent { border-color: #f97316; background: #fff7ed; }
    .kpi-box.accent .kpi-val { color: #f97316; }

    /* Section titles */
    .section-title { font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 26px; margin-bottom: 6px;
        border-left: 4px solid #f97316; padding-left: 8px; }

    /* Progress bar */
    .prog-bg { background: #e2e8f0; border-radius: 4px; height: 8px; width: 100%; }
    .prog-fill { background: #f97316; border-radius: 4px; height: 8px; }

    /* Status badge */
    .st { display: inline-block; padding: 2px 7px; border-radius: 8px; font-size: 9px; font-weight: bold; }
    .st-planning   { background: #dbeafe; color: #1d4ed8; }
    .st-in_progress{ background: #dcfce7; color: #15803d; }
    .st-on_hold    { background: #fef9c3; color: #a16207; }
    .st-completed  { background: #f0fdf4; color: #166534; }
    .st-cancelled  { background: #fee2e2; color: #b91c1c; }
</style>
</head>
<body>
<div class="wrap">

    {{-- En-tête personnalisé (sans $doc->code, pas de document numéroté) --}}
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
            <td style="text-align:right;">
                <div class="doc-title">
                    <div class="t">Tableau de bord <span class="num">BI</span></div>
                </div>
                <div style="margin-top:8px; font-size:11px; color:#475569;">
                    Généré le {{ now()->format('d/m/Y à H:i') }}
                </div>
                <div style="margin-top:4px;">
                    <span class="badge">{{ $currency }}</span>
                </div>
            </td>
        </tr>
    </table>

    {{-- ===== KPIs ===== --}}
    <div class="section-title">Indicateurs clés</div>

    @php
        $kpiChunks = array_chunk($kpis, 4);
    @endphp
    @foreach($kpiChunks as $row)
    <table class="kpi-grid">
        <tr>
            @foreach($row as $i => $kpi)
            <td>
                <div class="kpi-box {{ in_array($kpi['key'], ['invoiced','budget']) ? 'accent' : '' }}">
                    <div class="kpi-lbl">{{ $kpi['label'] }}</div>
                    <div class="kpi-val">{{ $kpi['value'] }}</div>
                    <div class="kpi-hint">{{ $kpi['hint'] ?? '' }}</div>
                </div>
            </td>
            @endforeach
            {{-- Pad vide si la ligne est incomplète --}}
            @for($pad = count($row); $pad < 4; $pad++)
            <td></td>
            @endfor
        </tr>
    </table>
    @endforeach

    {{-- ===== Top projets par budget ===== --}}
    @if(count($topProjects) > 0)
    <div class="section-title">Avancement des projets (top {{ count($topProjects) }})</div>
    <table class="lines">
        <thead>
            <tr>
                <th>Code</th>
                <th>Nom du projet</th>
                <th>Statut</th>
                <th class="r">Budget</th>
                <th class="r">Avancement</th>
            </tr>
        </thead>
        <tbody>
            @foreach($topProjects as $projet)
            <tr>
                <td>{{ $projet['code'] }}</td>
                <td>{{ $projet['name'] }}</td>
                <td>
                    <span class="st st-{{ $projet['status'] }}">
                        {{ match($projet['status']) {
                            'planning'    => 'Planification',
                            'in_progress' => 'En cours',
                            'on_hold'     => 'Suspendu',
                            'completed'   => 'Terminé',
                            'cancelled'   => 'Annulé',
                            default       => ucfirst($projet['status']),
                        } }}
                    </span>
                </td>
                <td class="r">
                    {{ number_format((float)$projet['budget_amount'], 0, ',', ' ') }}
                    {{ $projet['currency'] }}
                </td>
                <td class="r" style="width:120px;">
                    <div style="font-size:10px; margin-bottom:2px;">{{ $projet['progress'] }} %</div>
                    <div class="prog-bg">
                        <div class="prog-fill" style="width:{{ min(100, (int)$projet['progress']) }}%;"></div>
                    </div>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    {{-- ===== Répartition par statut ===== --}}
    @if(count($projectsByStatus) > 0)
    <div class="section-title">Répartition des projets par statut</div>
    <table class="lines">
        <thead>
            <tr>
                <th>Statut</th>
                <th class="r">Nombre de projets</th>
            </tr>
        </thead>
        <tbody>
            @foreach($projectsByStatus as $row)
            @if($row['total'] > 0)
            <tr>
                <td>
                    <span class="st st-{{ $row['status'] }}">
                        {{ match($row['status']) {
                            'planning'    => 'Planification',
                            'in_progress' => 'En cours',
                            'on_hold'     => 'Suspendu',
                            'completed'   => 'Terminé',
                            'cancelled'   => 'Annulé',
                            default       => ucfirst($row['status']),
                        } }}
                    </span>
                </td>
                <td class="r">{{ $row['total'] }}</td>
            </tr>
            @endif
            @endforeach
        </tbody>
    </table>
    @endif

    {{-- ===== Finances ===== --}}
    @if($finance['available'])
    <div class="section-title">Synthèse financière</div>
    <table class="lines">
        <thead>
            <tr>
                <th>Indicateur</th>
                <th class="r">Montant ({{ $currency }})</th>
            </tr>
        </thead>
        <tbody>
            @if($finance['has_invoices'])
            <tr>
                <td>Total facturé (hors annulées)</td>
                <td class="r">{{ number_format($finance['invoiced'], 0, ',', ' ') }}</td>
            </tr>
            <tr>
                <td>Total encaissé</td>
                <td class="r" style="color:#16a34a; font-weight:bold;">{{ number_format($finance['collected'], 0, ',', ' ') }}</td>
            </tr>
            <tr>
                <td>Reste à recouvrer</td>
                <td class="r" style="color:#dc2626; font-weight:bold;">{{ number_format($finance['outstanding'], 0, ',', ' ') }}</td>
            </tr>
            @endif
            @if($finance['has_purchases'])
            <tr>
                <td>Total achats (bons de commande)</td>
                <td class="r">{{ number_format($finance['purchases'], 0, ',', ' ') }}</td>
            </tr>
            @endif
        </tbody>
    </table>
    @endif

    {{-- ===== RH ===== --}}
    @if($hr['available'])
    <div class="section-title">Ressources humaines</div>
    <table class="lines">
        <thead>
            <tr><th>Indicateur</th><th class="r">Valeur</th></tr>
        </thead>
        <tbody>
            <tr>
                <td>Effectif actif</td>
                <td class="r">{{ $hr['headcount'] }} employé(s)</td>
            </tr>
        </tbody>
    </table>
    @endif

    {{-- Pied de page --}}
    <div class="foot">
        CONSTRUIRO ERP &mdash; {{ $company->name ?? 'Entreprise' }} &mdash; Rapport généré le {{ now()->format('d/m/Y à H:i') }}
    </div>

</div>
</body>
</html>
