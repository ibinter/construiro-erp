<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    @include('pdf._styles')
</head>
@php
    $dec = in_array($doc->currency, ['XOF', 'XAF']) ? 0 : 2;
    $fmt = fn ($v) => number_format((float) $v, $dec, ',', ' ').' '.$doc->currency;
    $d = fn ($v) => $v ? \Illuminate\Support\Carbon::parse($v)->format('d/m/Y') : '—';
@endphp
<body>
<div class="wrap">
    @include('pdf._header')

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
                <div class="meta-line">Date : <strong>{{ $d($doc->date) }}</strong></div>
                <div class="meta-line">Validité : <strong>{{ $d($doc->valid_until) }}</strong></div>
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
        <tr><td>Sous-total HT</td><td class="r">{{ $fmt($doc->subtotal) }}</td></tr>
        <tr><td>TVA ({{ rtrim(rtrim(number_format((float) $doc->tax_rate, 2, ',', ' '), '0'), ',') }} %)</td><td class="r">{{ $fmt($doc->tax_amount) }}</td></tr>
        <tr class="grand"><td>TOTAL TTC</td><td class="r">{{ $fmt($doc->total) }}</td></tr>
    </table>

    @if($doc->notes)<div class="notes">{{ $doc->notes }}</div>@endif

    @if($doc->signed_at)
    <div style="border-top:1px solid #e2e8f0;margin-top:20px;padding-top:10px;font-size:10px;color:#64748b;">
        [OK] Signe electroniquement par {{ $doc->signed_by }} le {{ \Illuminate\Support\Carbon::parse($doc->signed_at)->format('d/m/Y H:i') }}
        — Empreinte : {{ substr($doc->signature_hash, 0, 16) }}…
    </div>
    @endif

    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16px;">
        <div class="foot" style="margin-top:0;">
            {{ $company->name ?? 'CONSTRUIRO' }} — Document généré par CONSTRUIRO ERP le {{ now()->format('d/m/Y à H:i') }}
        </div>
        @if(!empty($qr_svg))
        <div style="text-align:center;flex-shrink:0;margin-left:16px;">
            <div style="width:80px;height:80px;">{!! $qr_svg !!}</div>
            <div style="font-size:8px;color:#64748b;margin-top:3px;">Vérifier l'authenticité</div>
        </div>
        @endif
    </div>
</div>
</body>
</html>
