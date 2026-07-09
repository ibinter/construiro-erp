{{-- En-tête commun : marque + coordonnées entreprise + titre du document. --}}
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
                <div class="t">{{ $title }} <span class="num">{{ $doc->code }}</span></div>
            </div>
        </td>
    </tr>
</table>
