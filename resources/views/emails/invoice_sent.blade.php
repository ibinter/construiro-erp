@extends('emails.layout')
@section('body')

{{-- Badge --}}
<div class="badge-success" style="font-size:13px;padding:6px 16px;">
    &#128196; Facture {{ $invoice->code }}
</div>

<div class="greeting">
    @if($invoice->client?->name)
        Bonjour {{ $invoice->client->name }},
    @else
        Bonjour,
    @endif
</div>

<p>
    Veuillez trouver ci-dessous les informations relatives à votre facture.
    Vous pouvez la consulter et la vérifier à tout moment via le lien sécurisé en bas de ce message.
</p>

{{-- Carte facture --}}
<div style="border:2px solid #1E3A5F;border-radius:12px;overflow:hidden;margin:24px 0;">
    <div style="background:#1E3A5F;padding:14px 24px;">
        <span style="color:white;font-weight:700;font-size:16px;">Facture {{ $invoice->code }}</span>
    </div>
    <div style="padding:0 24px;background:white;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:13px 0;color:#64748b;font-weight:600;width:40%;">Total TTC</td>
                <td style="padding:13px 0;font-weight:700;color:#0f172a;font-size:18px;">
                    {{ number_format((float) $invoice->total, 2, ',', ' ') }}&nbsp;{{ $invoice->currency ?? 'XOF' }}
                </td>
            </tr>
            @if($invoice->due_date)
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:13px 0;color:#64748b;font-weight:600;">Date d'échéance</td>
                <td style="padding:13px 0;font-weight:600;color:#dc2626;">
                    {{ $invoice->due_date->translatedFormat('d F Y') }}
                </td>
            </tr>
            @endif
            @if($invoice->client?->name)
            <tr>
                <td style="padding:13px 0;color:#64748b;font-weight:600;">Client</td>
                <td style="padding:13px 0;color:#0f172a;">{{ $invoice->client->name }}</td>
            </tr>
            @endif
        </table>
    </div>
</div>

{{-- Récapitulatif montants --}}
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 24px;margin:20px 0;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
            <td style="padding:6px 0;color:#64748b;">Sous-total HT</td>
            <td style="padding:6px 0;text-align:right;color:#0f172a;">
                {{ number_format((float) $invoice->subtotal, 2, ',', ' ') }}&nbsp;{{ $invoice->currency ?? 'XOF' }}
            </td>
        </tr>
        <tr>
            <td style="padding:6px 0;color:#64748b;">TVA ({{ $invoice->tax_rate }}%)</td>
            <td style="padding:6px 0;text-align:right;color:#0f172a;">
                {{ number_format((float) $invoice->tax_amount, 2, ',', ' ') }}&nbsp;{{ $invoice->currency ?? 'XOF' }}
            </td>
        </tr>
        <tr style="border-top:2px solid #1E3A5F;margin-top:6px;">
            <td style="padding:10px 0 0;font-weight:700;color:#1E3A5F;font-size:15px;">Total TTC</td>
            <td style="padding:10px 0 0;text-align:right;font-weight:700;color:#1E3A5F;font-size:15px;">
                {{ number_format((float) $invoice->total, 2, ',', ' ') }}&nbsp;{{ $invoice->currency ?? 'XOF' }}
            </td>
        </tr>
    </table>
</div>

{{-- CTA vérification --}}
<div class="cta-block">
    <a href="{{ url('/verify/' . $invoice->verify_token) }}" class="cta-btn">
        Consulter &amp; vérifier ma facture &#8594;
    </a>
</div>

<div class="divider"></div>

<div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 20px;margin-bottom:8px;">
    <p style="font-size:13px;color:#0369a1;margin:0;line-height:1.6;">
        <strong>Information :</strong> ce lien vous permet de vérifier l'authenticité de votre facture à tout moment.
        Pour toute question, contactez directement votre gestionnaire de compte.
    </p>
</div>

@endsection
