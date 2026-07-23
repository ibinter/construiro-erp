<?php

namespace Database\Seeders;

use App\Models\PaymentMethodConfig;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'type'            => 'mobile_money',
                'name'            => 'Mobile Money (Orange, MTN, Wave)',
                'is_active'       => true,
                'sort_order'      => 1,
                'instructions_fr' => "Effectuez votre paiement via :\n- 🟠 Orange Money : Tapez #144# → Paiement → Marchand → Code : {NUMERO}\n- 🟡 MTN MoMo : Tapez *136# → Payer → Code : {NUMERO}\n- 🔵 Wave : Ouvrez Wave → Payer → Entrez le numéro : {NUMERO}\n\nMontant exact : {MONTANT} {DEVISE}\nRéférence : {REFERENCE}\n\n✅ Après paiement, uploadez la capture d'écran ou le reçu.",
                'instructions_en' => "Make your payment via:\n- 🟠 Orange Money : Dial #144# → Payment → Merchant → Code: {NUMERO}\n- 🟡 MTN MoMo : Dial *136# → Pay → Code: {NUMERO}\n- 🔵 Wave : Open Wave → Pay → Enter number: {NUMERO}\n\nExact amount: {MONTANT} {DEVISE}\nReference: {REFERENCE}\n\n✅ After payment, upload your screenshot or receipt.",
                'config'          => ['orange_number' => '', 'mtn_number' => '', 'wave_number' => '', 'account_name' => 'IBIG Soft'],
                'currency'        => 'XOF',
                'min_amount'      => 1000,
                'max_amount'      => null,
            ],
            [
                'type'            => 'bank_transfer_national',
                'name'            => 'Virement bancaire national',
                'is_active'       => true,
                'sort_order'      => 2,
                'instructions_fr' => "Effectuez un virement bancaire vers :\n- Banque : {BANQUE}\n- Titulaire : {TITULAIRE}\n- Numéro de compte : {COMPTE}\n- Code guichet : {GUICHET}\n- Objet : CONSTRUIRO-{REFERENCE}\n\nMontant exact : {MONTANT} {DEVISE}\n\n✅ Après virement, uploadez le reçu bancaire.",
                'instructions_en' => "Make a bank transfer to:\n- Bank: {BANQUE}\n- Account holder: {TITULAIRE}\n- Account number: {COMPTE}\n- Branch code: {GUICHET}\n- Reference: CONSTRUIRO-{REFERENCE}\n\nExact amount: {MONTANT} {DEVISE}\n\n✅ After transfer, upload your bank receipt.",
                'config'          => ['bank_name' => '', 'account_holder' => 'IBIG SARL', 'account_number' => '', 'branch_code' => ''],
                'currency'        => 'XOF',
                'min_amount'      => 10000,
                'max_amount'      => null,
            ],
            [
                'type'            => 'bank_transfer_international',
                'name'            => 'Virement international (IBAN / SWIFT)',
                'is_active'       => false,
                'sort_order'      => 3,
                'instructions_fr' => "Virement international vers :\n- IBAN : {IBAN}\n- BIC/SWIFT : {BIC}\n- Banque : {BANQUE}\n- Titulaire : IBIG SARL\n- Référence : CONSTRUIRO-{REFERENCE}\n\n✅ Uploadez le reçu de virement.",
                'instructions_en' => "International wire transfer to:\n- IBAN: {IBAN}\n- BIC/SWIFT: {BIC}\n- Bank: {BANQUE}\n- Beneficiary: IBIG SARL\n- Reference: CONSTRUIRO-{REFERENCE}\n\n✅ Upload your transfer receipt.",
                'config'          => ['iban' => '', 'bic' => '', 'bank_name' => '', 'bank_address' => ''],
                'currency'        => 'EUR',
                'min_amount'      => 50,
                'max_amount'      => null,
            ],
            [
                'type'            => 'electronic',
                'name'            => 'Paiement en ligne (CinetPay / Moneroo)',
                'is_active'       => false,
                'sort_order'      => 4,
                'instructions_fr' => "Vous serez redirigé vers la passerelle de paiement sécurisée CinetPay. Acceptée : carte bancaire, mobile money via CinetPay.",
                'instructions_en' => "You will be redirected to the secure CinetPay payment gateway. Accepted: bank card, mobile money via CinetPay.",
                'config'          => ['cinetpay_api_key' => '', 'cinetpay_site_id' => '', 'cinetpay_secret' => '', 'moneroo_api_key' => '', 'moneroo_secret' => ''],
                'currency'        => 'XOF',
                'min_amount'      => null,
                'max_amount'      => null,
            ],
            [
                'type'            => 'money_transfer',
                'name'            => 'Transfert d\'argent (Western Union / MoneyGram)',
                'is_active'       => false,
                'sort_order'      => 5,
                'instructions_fr' => "Envoyez le paiement via :\n- Western Union ou MoneyGram\n- Bénéficiaire : {BENEFICIAIRE}\n- Pays : {PAYS}\n\nMontant : {MONTANT} {DEVISE}\nRéférence : {REFERENCE}\n\n✅ Uploadez le reçu avec le numéro MTCN.",
                'instructions_en' => "Send payment via:\n- Western Union or MoneyGram\n- Recipient: {BENEFICIAIRE}\n- Country: {PAYS}\n\nAmount: {MONTANT} {DEVISE}\nReference: {REFERENCE}\n\n✅ Upload your receipt with MTCN number.",
                'config'          => ['recipient_name' => 'IBIG SARL', 'recipient_country' => 'Côte d\'Ivoire'],
                'currency'        => 'USD',
                'min_amount'      => null,
                'max_amount'      => null,
            ],
            [
                'type'            => 'cash_agency',
                'name'            => 'Espèces en agence',
                'is_active'       => false,
                'sort_order'      => 6,
                'instructions_fr' => "Déposez les espèces dans l'un de nos points de collecte partenaires :\n{POINTS_DE_COLLECTE}\n\nMontant exact : {MONTANT} {DEVISE}\nRéférence à mentionner : {REFERENCE}\n\nUn reçu vous sera remis. Uploadez-le ici.",
                'instructions_en' => "Deposit cash at one of our partner collection points:\n{POINTS_DE_COLLECTE}\n\nExact amount: {MONTANT} {DEVISE}\nReference to mention: {REFERENCE}\n\nA receipt will be issued. Upload it here.",
                'config'          => ['collection_points' => []],
                'currency'        => 'XOF',
                'min_amount'      => null,
                'max_amount'      => null,
            ],
            [
                'type'            => 'check',
                'name'            => 'Chèque bancaire',
                'is_active'       => false,
                'sort_order'      => 7,
                'instructions_fr' => "Établissez un chèque à l'ordre de : {ORDRE}\nEnvoyez-le à : {ADRESSE}\n\nNotez au dos : CONSTRUIRO-{REFERENCE}\nMontant : {MONTANT} {DEVISE}\n\n✅ Uploadez une photo du chèque.",
                'instructions_en' => "Make a check payable to: {ORDRE}\nSend it to: {ADRESSE}\n\nWrite on the back: CONSTRUIRO-{REFERENCE}\nAmount: {MONTANT} {DEVISE}\n\n✅ Upload a photo of the check.",
                'config'          => ['order_name' => 'IBIG SARL', 'mailing_address' => ''],
                'currency'        => 'XOF',
                'min_amount'      => null,
                'max_amount'      => null,
            ],
            [
                'type'            => 'crypto',
                'name'            => 'Cryptomonnaie (USDT / BTC / ETH)',
                'is_active'       => false,
                'sort_order'      => 8,
                'instructions_fr' => "Envoyez exactement {MONTANT_CRYPTO} {CRYPTO} à l'adresse suivante :\n{WALLET_ADDRESS} (Réseau : {NETWORK})\n\nÉquivalent : {MONTANT} {DEVISE}\nRéférence : {REFERENCE}\n\n⚠️ Utilisez uniquement le réseau indiqué.\n✅ Uploadez la capture de la transaction avec le hash.",
                'instructions_en' => "Send exactly {MONTANT_CRYPTO} {CRYPTO} to:\n{WALLET_ADDRESS} (Network: {NETWORK})\n\nEquivalent: {MONTANT} {DEVISE}\nReference: {REFERENCE}\n\n⚠️ Use only the indicated network.\n✅ Upload the transaction screenshot with hash.",
                'config'          => ['usdt_trc20_address' => '', 'usdt_erc20_address' => '', 'btc_address' => '', 'eth_address' => ''],
                'currency'        => 'USD',
                'min_amount'      => null,
                'max_amount'      => null,
            ],
            [
                'type'            => 'voucher',
                'name'            => 'Voucher / Code prépayé',
                'is_active'       => true,
                'sort_order'      => 9,
                'instructions_fr' => "Saisissez votre code prépayé pour activer immédiatement votre abonnement. Les codes sont disponibles auprès de nos revendeurs agréés.",
                'instructions_en' => "Enter your prepaid code to instantly activate your subscription. Codes are available from our authorized resellers.",
                'config'          => [],
                'currency'        => 'XOF',
                'min_amount'      => null,
                'max_amount'      => null,
            ],
            [
                'type'            => 'cash_on_delivery',
                'name'            => 'Paiement à la livraison',
                'is_active'       => false,
                'sort_order'      => 10,
                'instructions_fr' => "Votre abonnement sera activé après confirmation de réception du paiement par notre agent. Zones disponibles : {ZONES}.",
                'instructions_en' => "Your subscription will be activated after our agent confirms receipt of payment. Available zones: {ZONES}.",
                'config'          => ['available_zones' => [], 'authorized_agents' => []],
                'currency'        => 'XOF',
                'min_amount'      => null,
                'max_amount'      => null,
            ],
            [
                'type'            => 'wire_transfer',
                'name'            => 'Passerelles additionnelles (Stripe / Paystack / Flutterwave)',
                'is_active'       => false,
                'sort_order'      => 11,
                'instructions_fr' => "Paiement par carte bancaire internationale via Stripe, Paystack ou Flutterwave.",
                'instructions_en' => "International card payment via Stripe, Paystack or Flutterwave.",
                'config'          => ['stripe_publishable_key' => '', 'stripe_secret' => '', 'paystack_public_key' => '', 'paystack_secret' => '', 'flutterwave_public_key' => '', 'flutterwave_secret' => ''],
                'currency'        => 'USD',
                'min_amount'      => null,
                'max_amount'      => null,
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethodConfig::updateOrCreate(['type' => $method['type']], $method);
        }

        $this->command->info('PaymentMethodSeeder: ' . count($methods) . ' méthodes de paiement initialisées.');
    }
}
