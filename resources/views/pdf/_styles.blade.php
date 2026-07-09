{{-- Styles partagés des documents PDF CONSTRUIRO (compatibles dompdf). --}}
<style>
    * { font-family: DejaVu Sans, sans-serif; }
    body { margin: 0; color: #1e293b; font-size: 12px; }
    .wrap { padding: 32px 36px; }

    /* En-tête */
    .head { width: 100%; border-bottom: 3px solid #0f172a; padding-bottom: 12px; }
    .head td { vertical-align: top; }
    .brand { font-size: 22px; font-weight: bold; color: #0f172a; }
    .brand .accent { color: #f97316; }
    .brand-sub { font-size: 9px; letter-spacing: 3px; color: #f97316; font-weight: bold; }
    .company-info { font-size: 10px; color: #475569; line-height: 1.5; }

    /* Titre du document */
    .doc-title { margin-top: 18px; }
    .doc-title .t { font-size: 20px; font-weight: bold; color: #0f172a; letter-spacing: 1px; }
    .doc-title .num { color: #f97316; font-weight: bold; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 10px; font-weight: bold; background: #e2e8f0; color: #334155; }

    /* Blocs parties / méta */
    .cols { width: 100%; margin-top: 18px; }
    .cols td { vertical-align: top; width: 50%; }
    .box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; }
    .box .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
    .box .val { font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 2px; }
    .meta-line { font-size: 11px; color: #475569; margin-top: 4px; }
    .meta-line strong { color: #0f172a; }

    /* Tableau des lignes */
    table.lines { width: 100%; border-collapse: collapse; margin-top: 18px; }
    table.lines thead th { background: #0f172a; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; padding: 8px 10px; text-align: left; }
    table.lines thead th.r { text-align: right; }
    table.lines tbody td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    table.lines tbody td.r { text-align: right; }
    table.lines tbody tr:nth-child(even) { background: #f8fafc; }

    /* Totaux */
    .totals { width: 45%; margin-left: 55%; margin-top: 14px; border-collapse: collapse; }
    .totals td { padding: 6px 10px; font-size: 12px; }
    .totals td.r { text-align: right; }
    .totals .grand td { background: #f97316; color: #fff; font-weight: bold; font-size: 14px; }
    .totals .paid td { color: #16a34a; }
    .totals .balance td { font-weight: bold; border-top: 1px solid #e2e8f0; }

    /* Notes & pied */
    .notes { margin-top: 20px; font-size: 10px; color: #64748b; border-left: 3px solid #f97316; padding: 6px 12px; background: #fff7ed; }
    .foot { position: fixed; bottom: 20px; left: 36px; right: 36px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 9px; color: #94a3b8; text-align: center; }
</style>
