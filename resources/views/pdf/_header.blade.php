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
        <td style="text-align:right; vertical-align:top;">
            <div class="doc-title">
                <div class="t">{{ $title }} <span class="num">{{ $doc->code }}</span></div>
            </div>
            @if(!empty($qr_svg) && !empty($verify_url))
            <div style="margin-top:10px; display:inline-block; text-align:center;">
                <div style="border:1px solid #e2e8f0; border-radius:6px; padding:6px; display:inline-block;">
                    <div class="qr-code">{!! $qr_svg !!}</div>
                </div>
                <div style="font-size:7px; color:#94a3b8; margin-top:3px; max-width:130px;">
                    Scanner pour verifier l'authenticite
                </div>
            </div>
            @endif
        </td>
    </tr>
</table>
