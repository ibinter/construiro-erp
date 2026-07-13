import { Head, Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

export default function LegalShow({ page }) {
    const { t } = useTrans();

    return (
        <>
            <Head title={page.title} />
            <div className="min-h-screen bg-gray-50">
                {/* Nav minimaliste */}
                <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-xl font-black text-orange-600">CONSTRUIRO</Link>
                    <Link href={route('login')} className="text-sm text-gray-500 hover:text-orange-600 transition">
                        {t('Se connecter')} →
                    </Link>
                </nav>

                {/* Contenu */}
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{page.title}</h1>
                    {page.updated_at && (
                        <p className="text-sm text-gray-400 mb-8">
                            {t('Dernière mise à jour')} : {page.updated_at}
                        </p>
                    )}
                    <div
                        className="prose prose-orange prose-sm max-w-none
                            prose-headings:font-black prose-headings:text-gray-900
                            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                            prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-gray-800
                            prose-table:w-full prose-th:bg-gray-100 prose-th:font-semibold
                            prose-td:border prose-td:border-gray-200 prose-td:px-3 prose-td:py-2
                            prose-th:border prose-th:border-gray-200 prose-th:px-3 prose-th:py-2
                            prose-hr:border-gray-200 prose-blockquote:border-orange-400
                            prose-ul:list-disc prose-ol:list-decimal
                            text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400">
                    <div className="flex flex-wrap justify-center gap-4 mb-2">
                        {[
                            { label: 'CGU', slug: 'cgu' },
                            { label: t('Confidentialité'), slug: 'privacy' },
                            { label: t('Mentions légales'), slug: 'legal' },
                            { label: 'Cookies', slug: 'cookies' },
                        ].map(l => (
                            <Link key={l.slug} href={route('legal.show', l.slug)}
                                className="hover:text-orange-500 transition">
                                {l.label}
                            </Link>
                        ))}
                    </div>
                    © {new Date().getFullYear()} IBIG Soft — CONSTRUIRO ERP
                </footer>
            </div>
        </>
    );
}
