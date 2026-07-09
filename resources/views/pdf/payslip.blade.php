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

    $statusLabels = ['draft' => 'Brouillon', 'validated' => 'Validé', 'paid' => 'Payé'];
    $statusLabel  = $statusLabels[$doc->status] ?? ucfirst((string) $doc->status);

    $emp = $doc->employee;
@endphp
<body>
<div class="wrap">
    {{-- En-tête inline (le bulletin n'a pas de code, on n'utilise donc pas pdf._header). --}}
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
                    @if($company?->email){{ $company->email }}<br>@endif
                    @if($company?->registration_number)RCCM : {{ $company->registration_number }} @endif
                    @if($company?->tax_id) · NIF : {{ $company->tax_id }}@endif
                </div>
            </td>
            <td style="text-align:right;">
                <div class="doc-title">
                    <div class="t">BULLETIN <span class="num">DE PAIE</span></div>
                </div>
                <div class="meta-line" style="margin-top:8px;">Période : <strong>{{ $doc->period }}</strong></div>
                <div style="margin-top:6px;"><span class="badge">{{ $statusLabel }}</span></div>
            </td>
        </tr>
    </table>

    <table class="cols">
        <tr>
            <td style="padding-right:10px;">
                <div class="box">
                    <div class="lbl">Employé</div>
                    <div class="val">{{ $emp?->full_name ?: '—' }}</div>
                    <div class="meta-line">Matricule : <strong>{{ $emp?->matricule ?? '—' }}</strong></div>
                    <div class="meta-line">Poste : <strong>{{ $emp?->job_title ?? '—' }}</strong></div>
                </div>
            </td>
            <td style="padding-left:10px;">
                <div class="meta-line">Période : <strong>{{ $doc->period }}</strong></div>
                <div class="meta-line">Contrat : <strong>{{ $emp?->contract_type ?? '—' }}</strong></div>
                <div class="meta-line">Département : <strong>{{ $emp?->department ?? '—' }}</strong></div>
            </td>
        </tr>
    </table>

    <table class="lines">
        <thead>
            <tr>
                <th>Rubrique</th>
                <th class="r" style="width:30%;">Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Salaire brut</td>
                <td class="r">{{ $fmt($doc->gross_salary) }}</td>
            </tr>
            <tr>
                <td>Retenues</td>
                <td class="r">− {{ $fmt($doc->deductions) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Net à payer mis en avant, encadré orange. --}}
    <table style="width:100%; margin-top:18px; border-collapse:collapse;">
        <tr>
            <td style="background:#f97316; color:#fff; padding:14px 18px; border-radius:6px;">
                <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px;">Net à payer</span>
                <span style="float:right; font-size:20px; font-weight:bold;">{{ $fmt($doc->net_salary) }}</span>
            </td>
        </tr>
    </table>

    @if($doc->notes)<div class="notes">{{ $doc->notes }}</div>@endif

    <div class="foot">
        {{ $company->name ?? 'CONSTRUIRO' }} — Bulletin de paie généré par CONSTRUIRO ERP le {{ now()->format('d/m/Y à H:i') }}
    </div>
</div>
</body>
</html>
