import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

export default function SupportCreate() {
    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        description: '',
        priority: 'medium',
        category: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/support');
    };

    return (
        <AppLayout title="Nouveau ticket de support">
            <div className="mx-auto max-w-2xl px-4 py-6">
                <PageHeader
                    title="Nouveau ticket de support"
                    subtitle="Décrivez votre problème, notre équipe répondra rapidement"
                    actions={<Link href="/support" className="btn btn-secondary">← Retour</Link>}
                />
                <form onSubmit={submit} className="card mt-6">
                    <div className="card-body space-y-5">
                        <div>
                            <label className="form-label">Objet *</label>
                            <input type="text" className="form-input" value={data.subject}
                                onChange={e => setData('subject', e.target.value)} placeholder="Résumez votre problème en une ligne" />
                            {errors.subject && <p className="form-error">{errors.subject}</p>}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Priorité *</label>
                                <select className="form-select" value={data.priority} onChange={e => setData('priority', e.target.value)}>
                                    <option value="low">Basse</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="high">Haute</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Catégorie</label>
                                <select className="form-select" value={data.category} onChange={e => setData('category', e.target.value)}>
                                    <option value="">— Choisissez —</option>
                                    <option value="technical">Problème technique</option>
                                    <option value="billing">Facturation / Abonnement</option>
                                    <option value="feature_request">Demande de fonctionnalité</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Description détaillée *</label>
                            <textarea className="form-textarea" rows={6} value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Décrivez le problème avec le plus de détails possible : étapes pour reproduire, message d'erreur, module concerné…" />
                            {errors.description && <p className="form-error">{errors.description}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'Envoi…' : 'Créer le ticket'}
                            </button>
                            <Link href="/support" className="text-sm text-slate-500 hover:text-slate-700">Annuler</Link>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
