@extends('emails.layout')
@section('body')

<div class="greeting">Nouvelle inscription 🎉</div>

<p>Un nouveau compte vient d'être créé sur <strong>CONSTRUIRO ERP</strong>. Voici les informations :</p>

<div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:8px 20px;margin:16px 0;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;width:42%;">Nom / Prénoms</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">{{ $d['nom'] ?? '—' }}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">E-mail</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">{{ $d['email'] ?? '—' }}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">WhatsApp</td><td style="padding:8px 0;color:#0f172a;">{{ $d['whatsapp'] ?? ($d['phone'] ?? '—') }}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Téléphone</td><td style="padding:8px 0;color:#0f172a;">{{ $d['phone'] ?? '—' }}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Statut</td><td style="padding:8px 0;color:#0f172a;">{{ $d['statut'] ?? '—' }}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Offre souscrite</td><td style="padding:8px 0;color:#0f172a;">{{ $d['offre'] ?? '—' }}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Date &amp; heure</td><td style="padding:8px 0;color:#0f172a;">{{ $d['date'] ?? '—' }}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">ID client (entreprise)</td><td style="padding:8px 0;color:#0f172a;">#{{ $d['company_id'] ?? '—' }}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">ID utilisateur</td><td style="padding:8px 0;color:#0f172a;">#{{ $d['user_id'] ?? '—' }}</td></tr>
    </table>
</div>

<div class="cta-block">
    <a href="{{ url('/superadmin/clients/' . ($d['company_id'] ?? '')) }}" class="cta-btn">Voir la fiche client &#8594;</a>
</div>

@endsection
