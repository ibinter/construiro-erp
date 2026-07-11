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

    $hasBreakdown = (float)$doc->base_salary > 0
        || (float)$doc->cnps_employee > 0
        || (float)$doc->its_amount > 0;

    $countryLabels = ['CI' => 'Côte d\'Ivoire', 'SN' => 'Sénégal', 'CM' => 'Cameroun'];
    $countryLabel  = $countryLabels[$doc->country_code ?? 'CI'] ?? ($doc->country_code ?? 'CI');
@endphp
<body>
<div class="wrap">
    {{-- En-tête --}}
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
                <div class="meta-line">Régime : <strong>{{ $countryLabel }}</strong></div>
                <div style="margin-top:6px;"><span class="badge">{{ $statusLabel }}</span></div>
            </td>
        </tr>
    </table>

    {{-- Infos employé --}}
    <table class="cols">
        <tr>
            <td style="padding-right:10px;">
                <div class="box">
                    <div class="lbl">Employé</div>
                    <div class="val">{{ $emp?->full_name ?: '—' }}</div>
                    <div class="meta-line">Matricule : <strong>{{ $emp?->matricule ?? '—' }}</strong></div>
                    <div class="meta-line">Poste : <strong>{{ $emp?->job_title ?? '—' }}</strong></div>
                    <div class="meta-line">Département : <strong>{{ $emp?->department ?? '—' }}</strong></div>
                </div>
            </td>
            <td style="padding-left:10px;">
                <div class="meta-line">Contrat : <strong>{{ strtoupper($emp?->contract_type ?? '—') }}</strong></div>
                @if((float)$doc->working_days > 0)
                <div class="meta-line">Jours ouvrables : <strong>{{ $doc->working_days }}</strong></div>
                <div class="meta-line">Jours travaillés : <strong>{{ number_format((float)$doc->days_worked, 1, ',', '') }}</strong></div>
                @endif
                @if((float)$doc->overtime_hours > 0)
                <div class="meta-line">Heures supp. : <strong>{{ number_format((float)$doc->overtime_hours, 1, ',', '') }} h</strong></div>
                @endif
            </td>
        </tr>
    </table>

    {{-- Éléments de rémunération --}}
    @if($hasBreakdown)
    <table class="lines">
        <thead>
            <tr>
                <th colspan="2" style="background:#f1f5f9; color:#475569; font-size:9px; text-transform:uppercase; letter-spacing:.5px;">
                    ÉLÉMENTS DE RÉMUNÉRATION
                </th>
            </tr>
        </thead>
        <tbody>
            @if((float)$doc->base_salary > 0)
            <tr>
                <td>Salaire de base (pro-raté)</td>
                <td class="r">{{ $fmt($doc->base_salary) }}</td>
            </tr>
            @endif
            @if((float)$doc->overtime_amount > 0)
            <tr>
                <td>Majoration heures supplémentaires</td>
                <td class="r">{{ $fmt($doc->overtime_amount) }}</td>
            </tr>
            @endif
            @if((float)$doc->transport_allowance > 0)
            <tr>
                <td>Indemnité de transport</td>
                <td class="r">{{ $fmt($doc->transport_allowance) }}</td>
            </tr>
            @endif
            @if((float)$doc->housing_allowance > 0)
            <tr>
                <td>Indemnité de logement</td>
                <td class="r">{{ $fmt($doc->housing_allowance) }}</td>
            </tr>
            @endif
            @if((float)$doc->other_allowances > 0)
            <tr>
                <td>Autres indemnités</td>
                <td class="r">{{ $fmt($doc->other_allowances) }}</td>
            </tr>
            @endif
            <tr style="background:#fff7ed; font-weight:bold;">
                <td>SALAIRE BRUT</td>
                <td class="r">{{ $fmt($doc->gross_salary) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Cotisations et retenues --}}
    <table class="lines" style="margin-top:8px;">
        <thead>
            <tr>
                <th colspan="2" style="background:#fef2f2; color:#b91c1c; font-size:9px; text-transform:uppercase; letter-spacing:.5px;">
                    COTISATIONS ET RETENUES SALARIALES
                </th>
            </tr>
        </thead>
        <tbody>
            @if((float)$doc->cnps_employee > 0)
            <tr>
                <td>
                    @if(($doc->country_code ?? 'CI') === 'SN') IPRES (salarié) — 5,6 %
                    @elseif(($doc->country_code ?? 'CI') === 'CM') CNPS (salarié) — 2,8 %
                    @else CNPS (salarié) — 3,2 % @endif
                </td>
                <td class="r" style="color:#dc2626;">− {{ $fmt($doc->cnps_employee) }}</td>
            </tr>
            @endif
            @if((float)$doc->its_amount > 0)
            <tr>
                <td>
                    @if(($doc->country_code ?? 'CI') === 'SN') TRIMF (impôt sur salaires)
                    @elseif(($doc->country_code ?? 'CI') === 'CM') IRPP (impôt sur revenus)
                    @else ITS (Impôt sur Traitements et Salaires) @endif
                </td>
                <td class="r" style="color:#dc2626;">− {{ $fmt($doc->its_amount) }}</td>
            </tr>
            @endif
            @if((float)$doc->advance_deductions > 0)
            <tr>
                <td>Avances sur salaire</td>
                <td class="r" style="color:#dc2626;">− {{ $fmt($doc->advance_deductions) }}</td>
            </tr>
            @endif
            @if((float)$doc->deductions > 0 && !$hasBreakdown)
            <tr>
                <td>Retenues</td>
                <td class="r" style="color:#dc2626;">− {{ $fmt($doc->deductions) }}</td>
            </tr>
            @endif
        </tbody>
    </table>
    @else
    {{-- Affichage simplifié (bulletin manuel sans cotisations détaillées) --}}
    <table class="lines">
        <thead>
            <tr><th>Rubrique</th><th class="r" style="width:30%;">Montant</th></tr>
        </thead>
        <tbody>
            <tr>
                <td>Salaire brut</td>
                <td class="r">{{ $fmt($doc->gross_salary) }}</td>
            </tr>
            @if((float)$doc->deductions > 0)
            <tr>
                <td>Retenues</td>
                <td class="r" style="color:#dc2626;">− {{ $fmt($doc->deductions) }}</td>
            </tr>
            @endif
        </tbody>
    </table>
    @endif

    {{-- Net à payer --}}
    <table style="width:100%; margin-top:18px; border-collapse:collapse;">
        <tr>
            <td style="background:#f97316; color:#fff; padding:14px 18px; border-radius:6px;">
                <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px;">Net à payer</span>
                <span style="float:right; font-size:20px; font-weight:bold;">{{ $fmt($doc->net_salary) }}</span>
            </td>
        </tr>
    </table>

    {{-- Charge patronale (information, non déduite du bulletin) --}}
    @if((float)$doc->cnps_employer > 0)
    <div style="margin-top:12px; padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; font-size:9px; color:#64748b;">
        <strong>Charge patronale (information) :</strong>
        Cotisation employeur
        @if(($doc->country_code ?? 'CI') === 'SN') IPRES (8,4 %)
        @elseif(($doc->country_code ?? 'CI') === 'CM') CNPS (12,5 %)
        @else CNPS (16,75 %) @endif
        = {{ $fmt($doc->cnps_employer) }} — non déduite du net salarié.
    </div>
    @endif

    @if($doc->notes)<div class="notes">{{ $doc->notes }}</div>@endif

    <div class="foot">
        {{ $company->name ?? 'CONSTRUIRO' }} — Bulletin de paie généré par CONSTRUIRO ERP le {{ now()->format('d/m/Y à H:i') }}
    </div>
</div>
</body>
</html>
