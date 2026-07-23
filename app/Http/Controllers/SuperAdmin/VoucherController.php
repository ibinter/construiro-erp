<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\VoucherCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VoucherController extends Controller
{
    // GET /superadmin/vouchers
    public function index(Request $request): \Inertia\Response
    {
        $vouchers = VoucherCode::with(['usedByCompany', 'creator'])
            ->when($request->batch_id, fn($q, $b) => $q->where('batch_id', $b))
            ->when($request->status === 'used', fn($q) => $q->where('is_used', true))
            ->when($request->status === 'available', fn($q) => $q->available())
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        $batches = VoucherCode::select('batch_id')->distinct()->whereNotNull('batch_id')
            ->orderByDesc(DB::raw('MAX(created_at)'))
            ->groupBy('batch_id')
            ->get()
            ->pluck('batch_id');

        return Inertia::render('SuperAdmin/Vouchers/Index', [
            'vouchers' => $vouchers->through(fn($v) => [
                'id'           => $v->id,
                'code'         => $v->code,
                'batch_id'     => $v->batch_id,
                'value'        => $v->value,
                'currency'     => $v->currency,
                'is_used'      => $v->is_used,
                'company_name' => $v->usedByCompany?->name,
                'used_at'      => $v->used_at?->format('d/m/Y'),
                'expires_at'   => $v->expires_at?->format('d/m/Y'),
                'created_at'   => $v->created_at->format('d/m/Y'),
            ]),
            'batches' => $batches,
            'filters' => $request->only(['batch_id', 'status']),
        ]);
    }

    // POST /superadmin/vouchers/generate
    public function generate(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'quantity'   => 'required|integer|min:1|max:500',
            'value'      => 'required|numeric|min:1000',
            'currency'   => 'required|string|max:10',
            'expires_at' => 'nullable|date|after:today',
        ]);

        $batchId = VoucherCode::generateBatch(
            (int)   $validated['quantity'],
            (float) $validated['value'],
                    $validated['currency'],
                    $validated['expires_at'] ? new \DateTime($validated['expires_at']) : null,
                    $request->user()->id
        );

        return back()->with('success', $validated['quantity'] . ' codes générés. Batch : ' . $batchId);
    }

    // GET /superadmin/vouchers/export/{batchId}
    public function export(string $batchId): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $vouchers = VoucherCode::with('usedByCompany')->where('batch_id', $batchId)->get();
        $filename = 'vouchers-' . $batchId . '.csv';

        return response()->streamDownload(function () use ($vouchers) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Code', 'Valeur', 'Devise', 'Utilisé', 'Société', 'Date utilisation', 'Expire le']);
            foreach ($vouchers as $v) {
                fputcsv($handle, [
                    $v->code,
                    $v->value,
                    $v->currency,
                    $v->is_used ? 'Oui' : 'Non',
                    $v->usedByCompany?->name ?? '',
                    $v->used_at?->format('d/m/Y') ?? '',
                    $v->expires_at?->format('d/m/Y') ?? '',
                ]);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
