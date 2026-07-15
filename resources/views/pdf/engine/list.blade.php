<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>
@page {
    size: {{ $layout->cssPageSize() }};
    margin: {{ $layout->margins['top'] }}mm {{ $layout->margins['right'] }}mm {{ $layout->margins['bottom'] }}mm {{ $layout->margins['left'] }}mm;
}

* {
    font-family: 'DejaVu Sans', 'Helvetica Neue', sans-serif;
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    font-size: {{ $layout->fontSize }}pt;
    color: #1e293b;
    line-height: 1.35;
}

/* ── En-tête première page ─────────────────────────────── */
.header-full {
    margin-bottom: 6mm;
    border-bottom: 2.5pt solid #0f172a;
    padding-bottom: 4mm;
}
.header-brand {
    font-size: 16pt;
    font-weight: bold;
    color: #0f172a;
}
.header-brand .accent { color: #f97316; }
.header-brand .erp-tag {
    font-size: 8pt;
    font-weight: bold;
    border: 1pt solid #f97316;
    color: #f97316;
    padding: 1pt 4pt;
    margin-left: 4pt;
}
.header-company {
    font-size: 8pt;
    color: #64748b;
    margin-top: 2mm;
}
.header-title {
    font-size: 14pt;
    font-weight: bold;
    color: #0f172a;
    margin-top: 3mm;
}
.header-subtitle {
    font-size: 8.5pt;
    color: #64748b;
    margin-top: 1mm;
}
.header-meta {
    font-size: 7.5pt;
    color: #94a3b8;
    margin-top: 2mm;
}
.header-filters {
    font-size: 7.5pt;
    color: #64748b;
    margin-top: 1.5mm;
    font-style: italic;
}

/* ── Tableau ────────────────────────────────────────────── */
table.data-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: {{ $layout->fontSize }}pt;
}

table.data-table thead tr {
    background-color: #0f172a;
    color: #ffffff;
}

table.data-table thead th {
    font-size: {{ $layout->headerFontSize }}pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.3pt;
    padding: 2.5mm 2mm;
    text-align: left;
    vertical-align: middle;
    word-break: break-word;
    overflow-wrap: break-word;
}

table.data-table thead th.right { text-align: right; }

table.data-table tbody td {
    padding: 2mm 2mm;
    border-bottom: 0.5pt solid #e2e8f0;
    vertical-align: middle;
    word-break: break-word;
    overflow-wrap: break-word;
}

table.data-table tbody td.nowrap {
    white-space: nowrap;
    word-break: normal;
    overflow-wrap: normal;
}

table.data-table tbody td.right { text-align: right; }

table.data-table tbody tr:nth-child(even) {
    background-color: #f8fafc;
}

table.data-table tbody tr:nth-child(odd) {
    background-color: #ffffff;
}

/* Colonne totalisation */
.totals-row td {
    font-weight: bold;
    border-top: 1.5pt solid #0f172a;
    background-color: #f1f5f9 !important;
}

/* ── Pied de page fixe ──────────────────────────────────── */
.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 10mm;
    border-top: 0.5pt solid #e2e8f0;
    padding-top: 2mm;
    font-size: 7pt;
    color: #94a3b8;
    text-align: center;
}

.page-number:before { content: "Page "; }
.page-number { }
.page-counter:after { content: counter(page); }
.page-total:after { content: counter(pages); }

/* ── Pas de coupure dans une ligne ─────────────────────── */
table.data-table tbody tr {
    page-break-inside: avoid;
}

/* ── Résumé bas de tableau ──────────────────────────────── */
.summary {
    margin-top: 3mm;
    font-size: 7.5pt;
    color: #64748b;
    text-align: right;
}

/* Colonne widths dynamiques */
@foreach($layout->columns as $i => $col)
table.data-table .col-{{ $i }} { width: {{ $col['width_mm'] }}mm; }
@endforeach
</style>
</head>
<body>

{{-- Pied de page fixe (apparaît sur toutes les pages) --}}
<div class="footer">
    {{ $company->name ?? 'CONSTRUIRO ERP' }} —
    {{ $title }} —
    {{ $generatedAt }} —
    <span class="page-counter"></span> / <span class="page-total"></span>
</div>

{{-- En-tête première page --}}
<div class="header-full">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <div class="header-brand">
                    <span class="accent">CONSTRUIRO</span>
                    <span class="erp-tag">ERP</span>
                </div>
                <div class="header-company">
                    {{ $company->name ?? '' }}
                    @if($company->city) — {{ $company->city }}@endif
                </div>
            </td>
            <td style="text-align:right; vertical-align:top;">
                <div style="font-size:7.5pt; color:#94a3b8;">{{ $generatedAt }}</div>
                <div style="font-size:7.5pt; color:#64748b;">{{ $rowCount }} enregistrement(s)</div>
                <div style="font-size:7pt; color:#cbd5e1;">{{ $layout->candidateLabel }}</div>
            </td>
        </tr>
    </table>

    <div class="header-title">{{ $title }}</div>
    @if($subtitle)
        <div class="header-subtitle">{{ $subtitle }}</div>
    @endif
    @if(!empty($filters))
        <div class="header-filters">Filtres : {{ implode(' — ', array_map(fn($k,$v) => "$k: $v", array_keys($filters), $filters)) }}</div>
    @endif
    <div class="header-meta">{{ $rowCount }} ligne(s) — Occ. largeur : {{ round($layout->widthUtilization * 100) }}%</div>
</div>

{{-- Tableau de données --}}
<table class="data-table">
    <thead>
        <tr>
            @foreach($layout->columns as $i => $col)
            @php
                $isRight = in_array($col['type'] ?? '', ['amount','percentage','number','id']);
            @endphp
            <th class="col-{{ $i }} {{ $isRight ? 'right' : '' }}">{{ $col['label'] }}</th>
            @endforeach
        </tr>
    </thead>
    <tbody>
        @forelse($rows as $row)
        <tr>
            @foreach($layout->columns as $i => $col)
            @php
                $val = is_array($row) ? ($row[$col['key']] ?? '') : (is_object($row) ? ($row->{$col['key']} ?? '') : '');
                $isRight = in_array($col['type'] ?? '', ['amount','percentage','number','id']);
                // Convertir booléens et emojis en texte (DomPDF ne supporte pas les emojis Unicode)
                if (is_bool($val)) $val = $val ? 'Oui' : 'Non';
                $val = str_replace(['✓', '✗', '✔', '✘', '⚠', '●', '○'], ['Oui', 'Non', 'Oui', 'Non', '!', '*', 'o'], (string)$val);
            @endphp
            <td class="col-{{ $i }} {{ $col['nowrap'] ? 'nowrap' : '' }} {{ $isRight ? 'right' : '' }}">{{ $val ?: '—' }}</td>
            @endforeach
        </tr>
        @empty
        <tr>
            <td colspan="{{ count($layout->columns) }}" style="text-align:center; color:#94a3b8; font-style:italic; padding: 8mm;">
                Aucune donnée à afficher
            </td>
        </tr>
        @endforelse
    </tbody>
</table>

<div class="summary">
    {{ $rowCount }} enregistrement(s) — Export {{ $title }} — {{ $generatedAt }}
</div>

</body>
</html>
