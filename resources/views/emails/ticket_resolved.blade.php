@extends('emails.layout')
@section('body')

{{-- Success banner --}}
<div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:1px solid #86efac;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
    <div style="width:56px;height:56px;background:#16a34a;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:10px;">
        <span style="color:white;font-size:26px;line-height:1;">&#10003;</span>
    </div>
    <div style="font-size:20px;font-weight:900;color:#15803d;margin-bottom:4px;">Demande resolue !</div>
    <div style="font-size:14px;color:#166534;">Ticket #{{ $ticketNumber }} — clos avec succes</div>
</div>

<div class="greeting">Bonjour {{ $userName }},</div>

<p>
    Bonne nouvelle : votre demande de support a ete traitee et le ticket est maintenant
    <strong>resolu</strong>. Voici le detail de la solution apportee par notre equipe.
</p>

{{-- Ticket summary --}}
<div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:20px 0;">
    <div style="background:#f8fafc;padding:12px 20px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:700;color:#374151;font-size:14px;">Ticket #{{ $ticketNumber }}</span>
        <span style="background:#dcfce7;color:#15803d;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;text-transform:uppercase;">Resolu</span>
    </div>
    <div style="padding:0 20px;background:white;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid #f8fafc;">
                <td style="padding:12px 0;color:#64748b;font-weight:600;width:30%;">Objet</td>
                <td style="padding:12px 0;font-weight:600;color:#0f172a;">{{ $subject }}</td>
            </tr>
        </table>
    </div>
</div>

{{-- Resolution box --}}
<div style="background:#f0fdf4;border:1px solid #86efac;border-left:4px solid #16a34a;border-radius:0 10px 10px 0;padding:18px 20px;margin:20px 0;">
    <p style="font-weight:700;color:#15803d;margin-bottom:8px;font-size:14px;display:flex;align-items:center;gap:8px;">
        <span>&#128172;</span> Solution apportee
    </p>
    <p style="font-size:14px;color:#166534;line-height:1.7;margin:0;">{{ $resolution }}</p>
</div>

{{-- CTA --}}
<div class="cta-block">
    <a href="{{ $ticketUrl }}" class="cta-btn">
        Voir la reponse complete &#8594;
    </a>
</div>

<div class="divider"></div>

{{-- Satisfaction --}}
<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin:20px 0;text-align:center;">
    <p style="font-weight:700;color:#0f172a;margin-bottom:4px;font-size:15px;">
        Cette reponse vous a-t-elle aide ?
    </p>
    <p style="font-size:13px;color:#64748b;margin-bottom:16px;">
        Votre avis nous aide a ameliorer notre support.
    </p>
    <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
        <a href="{{ $ticketUrl }}?rate=5" style="text-decoration:none;background:white;border:1px solid #e2e8f0;border-radius:8px;padding:10px 18px;font-size:22px;line-height:1;display:inline-block;">
            &#128578;
        </a>
        <a href="{{ $ticketUrl }}?rate=3" style="text-decoration:none;background:white;border:1px solid #e2e8f0;border-radius:8px;padding:10px 18px;font-size:22px;line-height:1;display:inline-block;">
            &#128528;
        </a>
        <a href="{{ $ticketUrl }}?rate=1" style="text-decoration:none;background:white;border:1px solid #e2e8f0;border-radius:8px;padding:10px 18px;font-size:22px;line-height:1;display:inline-block;">
            &#128577;
        </a>
    </div>
</div>

{{-- Reopen notice --}}
<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 20px;margin-bottom:8px;display:flex;gap:12px;align-items:flex-start;">
    <span style="font-size:18px;flex-shrink:0;">&#128260;</span>
    <div>
        <p style="font-weight:700;color:#92400e;margin-bottom:4px;font-size:14px;">Le probleme persiste ?</p>
        <p style="font-size:13px;color:#78350f;margin:0;line-height:1.6;">
            Vous pouvez <a href="{{ $ticketUrl }}" style="color:#F58220;font-weight:600;">rouvrir le ticket</a>
            dans les 7 jours ou en creer un nouveau.
            Notre equipe sera ravie de vous aider davantage.
        </p>
    </div>
</div>

@endsection
