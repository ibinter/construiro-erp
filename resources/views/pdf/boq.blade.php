<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    @include('pdf._styles')
</head>
@php
    $cur = $doc->currency ?: 'XOF';
    $dec = in_array($cur, ['XOF', 'XAF']) ? 0 : 2;
    $fmt = fn ($v) => number_format((float) $v, $dec, ',', ' ').' '.$cur;

    $statusLabels = ['draft' => 'Brouillon', 'validated' => 'Validé'];
    $statusLabel  = $statusLabels[$doc->status] ?? ucfirst((string) $doc->status);
@endphp
<body>
<div class="wrap">
    @include('pdf._header')

    <div class="doc-title" style="margin-top:6px;">
        <span class="badge">{{ $statusLabel }}</span>
    </div>

    <table class="cols">
        <tr>
            <td style="padding-right:10px;">
                <div class="box">
                    <div class="lbl">{{ $partyLabel }}</div>
                    <div class="val">{{ $partyName ?: '—' }}</div>
                    @if($doc->project)<div class="meta-line">Projet : <strong>{{ $doc->project->name }}</strong></div>@endif
                </div>
            </td>
            <td style="padding-left:10px;">
                <div class="meta-line">Objet : <strong>{{ $doc->title }}</strong></div>
                <div class="meta-line">Référence : <strong>{{ $doc->code }}</strong></div>
            </td>
        </tr>
    </table>

    <table class="lines">
        <thead>
            <tr>
                <th style="width:6%;">#</th>
                <th>Désignation</th>
                <th style="width:10%;">Unité</th>
                <th class="r" style="width:12%;">Qté</th>
                <th class="r" style="width:17%;">P.U.</th>
                <th class="r" style="width:18%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($doc->lines as $i => $line)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $line->designation }}</td>
                    <td>{{ $line->unit }}</td>
                    <td class="r">{{ rtrim(rtrim(number_format((float) $line->quantity, 3, ',', ' '), '0'), ',') }}</td>
                    <td class="r">{{ $fmt($line->unit_price) }}</td>
                    <td class="r">{{ $fmt($line->line_total) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr class="grand"><td>TOTAL</td><td class="r">{{ $fmt($doc->total) }}</td></tr>
    </table>

    @if($doc->notes)<div class="notes">{{ $doc->notes }}</div>@endif

    <div class="foot">
        {{ $company->name ?? 'CONSTRUIRO' }} — DQE généré par CONSTRUIRO ERP le {{ now()->format('d/m/Y à H:i') }}
    </div>
</div>
</body>
</html>
