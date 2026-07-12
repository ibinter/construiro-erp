import { Head, Link } from '@inertiajs/react';

export default function LegalShow({ page }) {
    return (
        <>
            <Head title={page.title} />
            <div className="min-h-screen bg-gray-50">
                {/* Nav minimaliste */}
                <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="text-xl font-black text-orange-600">CONSTRUIRO</Link>
                    <Link href={route('login')} className="text-sm text-gray-500 hover:text-orange-600 transition">
                        Se connecter →
                    </Link>
                </nav>

                {/* Contenu */}
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{page.title}</h1>
                    {page.updated_at && (
                        <p className="text-sm text-gray-400 mb-8">
                            Dernière mise à jour : {page.updated_at}
                        </p>
                    )}
                    <div
                        className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-orange-600"
                        dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br>') }}
                    />
                </div>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400">
                    <div className="flex flex-wrap justify-center gap-4 mb-2">
                        {[
                            { label: 'CGU', slug: 'cgu' },
                            { label: 'Confidentialité', slug: 'privacy' },
                            { label: 'Mentions légales', slug: 'legal' },
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
