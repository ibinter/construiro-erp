<?php
namespace App\Http\Controllers;

use App\Models\PaymentMethodConfig;
use App\Models\PaymentOrder;
use App\Services\Payment\PaymentService;
use App\Services\Payment\CinetPayGateway;
use Illuminate\Http\Request;

class WebhookPaymentController extends Controller
{
    public function __construct(private PaymentService $paymentService) {}

    // POST /webhooks/cinetpay
    public function cinetpay(Request $request): \Illuminate\Http\JsonResponse
    {
        $gateway = app(CinetPayGateway::class);
        if (!$gateway->verifyWebhook($request->all())) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }
        $transactionId = $request->input('cpm_trans_id');
        $order = PaymentOrder::where('reference', $transactionId)->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }
        if ($request->input('cpm_result') === '00') { // 00 = success CinetPay
            $eventId = 'cinetpay_' . $request->input('cpm_payid');
            $this->paymentService->confirmViaWebhook($order, $eventId, $request->all());
        }
        return response()->json(['status' => 'ok']);
    }
}
