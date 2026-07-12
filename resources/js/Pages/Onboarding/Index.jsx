import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

const CURRENCIES = ['XOF', 'XAF', 'GNF', 'USD', 'EUR', 'MAD', 'DZD', 'TND', 'GHS', 'NGN', 'KES'];
const COUNTRIES = [
    ['CI', "Côte d'Ivoire"], ['SN', 'Sénégal'], ['CM', 'Cameroun'], ['ML', 'Mali'],
    ['BF', 'Burkina Faso'], ['TG', 'Togo'], ['BJ', 'Bénin'], ['GN', 'Guinée'],
    ['CD', 'RD Congo'], ['MG', 'Madagascar'], ['MR', 'Mauritanie'], ['MA', 'Maroc'],
    ['DZ', 'Algérie'], ['TN', 'Tunisie'], ['NG', 'Nigeria'], ['GH', 'Ghana'], ['KE', 'Kenya'],
];

const STEPS = [
    { key: 'company', label: 'Entreprise', icon: '🏢' },
    { key: 'logo', label: 'Logo', icon: '🖼️' },
    { key: 'currency', label: 'Paramètres', icon: '⚙️' },
    { key: 'modules', label: 'Terminé', icon: '🎉' },
];

function StepCompany({ company, onDone }) {
    const { data, setData, post, processing, errors } = useForm({
        name: company.name ?? '',
        country: company.country ?? '',
        city: company.city ?? '',
        phone: company.phone ?? '',
    });

    return (
        <form onSubmit={e => { e.preventDefault(); post('/onboarding/company', { onSuccess: onDone }); }} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={data.name} onChange={e => setData('name', e.target.value)} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={data.country} onChange={e => setData('country', e.target.value)}>
                        <option value="">— Choisissez —</option>
                        {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={data.city} onChange={e => setData('city', e.target.value)} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={data.phone} onChange={e => setData('phone', e.target.value)} />
            </div>
            <button type="submit" disabled={processing}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition">
                {processing ? 'Enregistrement…' : 'Continuer →'}
            </button>
        </form>
    );
}

function StepLogo({ onDone, onSkip }) {
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
                    {preview ? 'Changer le logo' : 'Cliquez pour uploader votre logo'}
                </label>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG — max 2 Mo</p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => { if (data.logo) post('/onboarding/logo', { onSuccess: onDone }); }}
                    disabled={!data.logo || processing}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition">
                    {processing ? 'Upload…' : 'Enregistrer le logo →'}
                </button>
                <button onClick={onSkip}
                    className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition">
                    Passer
                </button>
            </div>
        </div>
    );
}

function StepSettings({ company, onDone }) {
    const { data, setData, post, processing, errors } = useForm({
        base_currency: company.base_currency ?? 'XOF',
        locale: company.locale ?? 'fr',
    });

    return (
        <form onSubmit={e => { e.preventDefault(); post('/onboarding/settings', { onSuccess: onDone }); }} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devise principale</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={data.base_currency} onChange={e => setData('base_currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langue de l'interface</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    value={data.locale} onChange={e => setData('locale', e.target.value)}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                </select>
            </div>
            <button type="submit" disabled={processing}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition">
                {processing ? 'Enregistrement…' : 'Terminer la configuration →'}
            </button>
        </form>
    );
}

function StepDone() {
    return (
        <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-bold text-gray-900">Configuration terminée !</h3>
            <p className="text-gray-500 text-sm">Votre espace CONSTRUIRO est prêt. Accédez à votre tableau de bord pour commencer.</p>
            <button onClick={() => router.post('/onboarding/complete')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition">
                Accéder au tableau de bord →
            </button>
        </div>
    );
}

export default function OnboardingIndex({ company, steps }) {
    const currentStepIndex = steps.company ? (steps.logo ? (steps.currency ? 3 : 2) : 1) : 0;
    const [activeStep, setActiveStep] = useState(currentStepIndex);

    const next = () => setActiveStep(s => Math.min(s + 1, 3));

    return (
        <>
            <Head title="Configuration CONSTRUIRO" />
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <span className="text-3xl font-black text-orange-600">CONSTRUIRO</span>
                        <p className="text-gray-500 text-sm mt-1">Configurons votre espace en quelques étapes</p>
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
                        <p className="text-sm text-gray-400 mb-6">Étape {activeStep + 1} sur {STEPS.length}</p>

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
