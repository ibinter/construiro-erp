import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { useTrans } from '@/i18n';

const CURRENCIES = ['XOF', 'XAF', 'GNF', 'USD', 'EUR', 'MAD', 'DZD', 'TND', 'GHS', 'NGN', 'KES'];
const COUNTRIES = [
    ['CI', "Côte d'Ivoire"], ['SN', 'Sénégal'], ['CM', 'Cameroun'], ['ML', 'Mali'],
    ['BF', 'Burkina Faso'], ['TG', 'Togo'], ['BJ', 'Bénin'], ['GN', 'Guinée'],
    ['CD', 'RD Congo'], ['MG', 'Madagascar'], ['MR', 'Mauritanie'], ['MA', 'Maroc'],
    ['DZ', 'Algérie'], ['TN', 'Tunisie'], ['NG', 'Nigeria'], ['GH', 'Ghana'], ['KE', 'Kenya'],
];

function StepCompany({ company, onDone }) {
    const { t } = useTrans();
    const { data, setData, post, processing, errors } = useForm({
        name: company.name ?? '',
        country: company.country ?? '',
        city: company.city ?? '',
        phone: company.phone ?? '',
    });

    return (
        <form onSubmit={e => { e.preventDefault(); post('/onboarding/company', { onSuccess: onDone }); }} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Nom de l'entreprise *")}</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={data.name} onChange={e => setData('name', e.target.value)} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Pays *')}</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={data.country} onChange={e => setData('country', e.target.value)}>
                        <option value="">{t('— Choisissez —')}</option>
                        {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Ville')}</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={data.city} onChange={e => setData('city', e.target.value)} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Téléphone')}</label>
                <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={data.phone} onChange={e => setData('phone', e.target.value)} />
            </div>
            <button type="submit" disabled={processing}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition">
                {processing ? t('Enregistrement…') : t('Continuer →')}
            </button>
        </form>
    );
}

function StepLogo({ onDone, onSkip }) {
    const { t } = useTrans();
    const { data, setData, post, processing } = useForm({ logo: null });
    const [preview, setPreview] = useState(null);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                {preview ? (
                    <img src={preview} alt="Logo" className="mx-auto h-24 object-contain mb-4" />
                ) : (
                    <div className="text-4xl mb-4">🖼️</div>
                )}
                <input type="file" id="logo-upload" accept="image/*" onChange={handleFile} className="hidden" />
                <label htmlFor="logo-upload" className="cursor-pointer text-orange-500 hover:text-orange-600 font-medium text-sm">
                    {preview ? t('Changer le logo') : t('Cliquez pour uploader votre logo')}
                </label>
                <p className="text-xs text-gray-400 mt-1">{t('PNG, JPG, SVG — max 2 Mo')}</p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => { if (data.logo) post('/onboarding/logo', { onSuccess: onDone }); }}
                    disabled={!data.logo || processing}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition">
                    {processing ? t('Upload…') : t('Enregistrer le logo →')}
                </button>
                <button onClick={onSkip}
                    className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition">
                    {t('Passer')}
                </button>
            </div>
        </div>
    );
}

function StepSettings({ company, onDone }) {
    const { t } = useTrans();
    const { data, setData, post, processing, errors } = useForm({
        base_currency: company.base_currency ?? 'XOF',
        locale: company.locale ?? 'fr',
    });

    return (
        <form onSubmit={e => { e.preventDefault(); post('/onboarding/settings', { onSuccess: onDone }); }} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Devise principale')}</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={data.base_currency} onChange={e => setData('base_currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("Langue de l'interface")}</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={data.locale} onChange={e => setData('locale', e.target.value)}>
                    <option value="fr">{t('Français')}</option>
                    <option value="en">English</option>
                </select>
            </div>
            <button type="submit" disabled={processing}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition">
                {processing ? t('Enregistrement…') : t('Terminer la configuration →')}
            </button>
        </form>
    );
}

function StepDone() {
    const { t } = useTrans();
    return (
        <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-bold text-gray-900">{t('Configuration terminée !')}</h3>
            <p className="text-gray-500 text-sm">{t('Votre espace CONSTRUIRO est prêt. Accédez à votre tableau de bord pour commencer.')}</p>
            <button onClick={() => router.post('/onboarding/complete')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition">
                {t('Accéder au tableau de bord →')}
            </button>
        </div>
    );
}

export default function OnboardingIndex({ company, steps }) {
    const { t } = useTrans();
    const currentStepIndex = steps.company ? (steps.logo ? (steps.currency ? 3 : 2) : 1) : 0;
    const [activeStep, setActiveStep] = useState(currentStepIndex);

    const STEPS = [
        { key: 'company', label: t('Entreprise'), icon: '🏢' },
        { key: 'logo',    label: 'Logo',          icon: '🖼️' },
        { key: 'currency', label: t('Paramètres'), icon: '⚙️' },
        { key: 'modules', label: t('Terminé'),     icon: '🎉' },
    ];

    const next = () => setActiveStep(s => Math.min(s + 1, 3));

    return (
        <>
            <Head title={t('Configuration CONSTRUIRO')} />
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <span className="text-3xl font-black text-orange-600">CONSTRUIRO</span>
                        <p className="text-gray-500 text-sm mt-1">{t('Configurons votre espace en quelques étapes')}</p>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center justify-between mb-8">
                        {STEPS.map((step, i) => (
                            <div key={step.key} className="flex items-center">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${i < activeStep ? 'bg-green-500 text-white' : i === activeStep ? 'bg-orange-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                                    {i < activeStep ? '✓' : step.icon}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`h-0.5 w-full mx-2 min-w-[2rem] transition ${i < activeStep ? 'bg-green-400' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">{STEPS[activeStep].label}</h2>
                        <p className="text-sm text-gray-400 mb-6">{t('Étape')} {activeStep + 1} {t('sur')} {STEPS.length}</p>

                        {activeStep === 0 && <StepCompany company={company} onDone={next} />}
                        {activeStep === 1 && <StepLogo onDone={next} onSkip={next} />}
                        {activeStep === 2 && <StepSettings company={company} onDone={next} />}
                        {activeStep === 3 && <StepDone />}
                    </div>
                </div>
            </div>
        </>
    );
}
