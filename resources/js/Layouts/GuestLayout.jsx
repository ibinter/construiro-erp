import ConstruiroLogo from '@/Components/ConstruiroLogo';
import { Link } from '@inertiajs/react';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex" style={{ background: '#f8f9fb' }}>
            {/* Panneau gauche — branding */}
            <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 text-white"
                style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #2d2d2d 100%)` }}>
                <Link href="/">
                    <ConstruiroLogo size="sm" />
                </Link>
                <div>
                    <p className="text-3xl font-black leading-snug mb-4">
                        Pilotez votre<br />
                        <span style={{ color: BRAND }}>activité BTP</span><br />
                        depuis un seul endroit.
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        15+ modules intégrés · RH, Finance, Stock, Chantiers · Adapté à l'Afrique
                    </p>
                </div>
                <div className="text-xs text-gray-600">
                    © {new Date().getFullYear()} IBIG Soft — construiro.com
                </div>
            </div>

            {/* Panneau droit — formulaire */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {/* Logo mobile */}
                <div className="lg:hidden mb-8">
                    <Link href="/"><ConstruiroLogo size="sm" /></Link>
                </div>

                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    {children}
                </div>

                <p className="mt-6 text-xs text-gray-400">
                    <a href="/" className="hover:underline">← Retour à l'accueil</a>
                    {' · '}
                    <a href="/legal/confidentialite" className="hover:underline">Confidentialité</a>
                    {' · '}
                    <a href="/legal/cgu" className="hover:underline">CGU</a>
                </p>
            </div>
        </div>
    );
}
