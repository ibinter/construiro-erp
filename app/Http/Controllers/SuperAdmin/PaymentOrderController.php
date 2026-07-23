<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PaymentOrder;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PaymentOrderController extends Controller
{
    public function __construct(private PaymentService $paymentService) {}

    // GET /superadmin/payment-orders
    public function index(Request $request): \Inertia\Response
    {
        $orders = PaymentOrder::with(['company', 'plan', 'confirmedBy'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByRaw("FIELD(status,'submitted','pending','confirmed','rejected','expired') ASC")
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('SuperAdmin/PaymentOrders/Index', [
            'orders' => $orders->through(fn($o) => [
                'id'           => $o->id,
                'reference'    => $o->reference,
                'company_name' => $o->company?->name,
                'plan_name'    => $o->plan?->name,
                'amount'       => $o->amount,
                'currency'     => $o->currency,
                'method_type'  => $o->payment_method_type,
                'status'       => $o->status,
                'has_proof'    => !empty($o->proof_path),
                'expires_at'   => $o->expires_at?->format('d/m/Y H:i'),
                'submitted_at' => $o->updated_at?->format('d/m/Y H:i'),
                'confirmed_by' => $o->confirmedBy?->name,
                'confirmed_at' => $o->confirmed_at?->format('d/m/Y H:i'),
            ]),
            'filters' => $request->only('status'),
        ]);
    }

    // GET /superadmin/payment-orders/{id}/proof — télécharge la preuve (stockage privé)
    public function downloadProof(PaymentOrder $paymentOrder): mixed
    {
        if (!$paymentOrder->proof_path || !Storage::disk('private')->exists($paymentOrder->proof_path)) {
            abort(404, 'Preuve introuvable.');
        }
        return Storage::disk('private')->download($paymentOrder->proof_path, 'preuve-' . $paymentOrder->reference);
    }

    // POST /superadmin/payment-orders/{id}/confirm
    public function confirm(Request $request, PaymentOrder $paymentOrder): \Illuminate\Http\RedirectResponse
    {
        $request->validate(['notes' => 'nullable|string|max:500']);
        try {
            $this->paymentService->confirmManually($paymentOrder, $request->user()->id, $request->notes);
            return back()->with('success', 'Paiement #' . $paymentOrder->reference . ' confirmé. Abonnement activé.');
        } catch (\RuntimeException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // POST /superadmin/payment-orders/{id}/reject
    public function reject(Request $request, PaymentOrder $paymentOrder): \Illuminate\Http\RedirectResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);
        $paymentOrder->update([
            'status'          => PaymentOrder::STATUS_REJECTED,
            'rejected_reason' => $request->reason,
            'confirmed_by'    => $request->user()->id,
            'confirmed_at'    => now(),
        ]);
        return back()->with('success', 'Paiement rejeté. Le client en sera informé.');
    }
}
