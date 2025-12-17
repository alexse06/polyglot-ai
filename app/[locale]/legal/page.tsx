'use client'

import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 pb-24">
            <Link href="/profile" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 glass-button px-4 py-2 rounded-full">
                <ArrowLeft size={20} /> Retour
            </Link>

            <div className="max-w-3xl mx-auto space-y-12">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                        Mentions Légales & Confidentialité
                    </h1>
                    <p className="text-gray-400">Dernière mise à jour : 12 Décembre 2025</p>
                </div>

                {/* RGPD */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-2xl font-bold text-blue-400">
                        <Shield />
                        <h2>Politique de Confidentialité (RGPD)</h2>
                    </div>
                    <div className="glass-card p-6 rounded-2xl space-y-4 text-gray-300 leading-relaxed">
                        <p>
                            Conformément au Règlement Général sur la Protection des Données (RGPD), nous nous engageons à protéger vos données personnelles.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong className="text-white">Collecte de données :</strong> Nous collectons uniquement les données strictement nécessaires au fonctionnement de l'application (email pour l'authentification, progression d'apprentissage).
                            </li>
                            <li>
                                <strong className="text-white">Utilisation :</strong> Vos données ne sont **jamais vendues** à des tiers. Elles servent uniquement à personnaliser votre expérience (niveau, historique).
                            </li>
                            <li>
                                <strong className="text-white">IA & Contenu :</strong> Les conversations avec l'IA sont traitées pour générer des réponses mais ne sont pas utilisées pour entraîner les modèles publics sans anonymisation.
                            </li>
                            <li>
                                <strong className="text-white">Vos droits :</strong> Vous disposez d'un droit d'accès, de rectification et de suppression de vos données (voir la « Zone Danger » dans votre profil).
                            </li>
                        </ul>
                    </div>
                </section>

                {/* CGU */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-2xl font-bold text-pink-500">
                        <Lock />
                        <h2>Conditions Générales d'Utilisation (CGU)</h2>
                    </div>
                    <div className="glass-card p-6 rounded-2xl space-y-4 text-gray-300 leading-relaxed">
                        <p>
                            En utilisant MyCanadaRP, vous acceptez les présentes conditions générales d'utilisation.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong className="text-white">Accès au service :</strong> L'accès à MyCanadaRP est réservé à un usage personnel et non commercial. Nous nous réservons le droit de suspendre l'accès en cas d'abus.
                            </li>
                            <li>
                                <strong className="text-white">Propriété Intellectuelle :</strong> Tous les contenus (textes, logos, code) sont la propriété exclusive de MyCanadaRP Inc. ou de ses concédants. Toute reproduction est interdite sans autorisation.
                            </li>
                            <li>
                                <strong className="text-white">Responsabilité :</strong> MyCanadaRP ne peut être tenu responsable des interruptions de service ou des erreurs générées par l'intelligence artificielle (hallucinations). L'apprentissage des langues reste de la responsabilité de l'utilisateur.
                            </li>
                            <li>
                                <strong className="text-white">Droit Applicable :</strong> Ces conditions sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* License */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-2xl font-bold text-yellow-400">
                        <FileText />
                        <h2>Licence Open Source</h2>
                    </div>
                    <div className="glass-card p-6 rounded-2xl space-y-4 font-mono text-sm bg-black/30 border border-gray-800 text-gray-400">
                        <p>MIT License</p>
                        <p>Copyright (c) 2025 MyCanadaRP</p>
                        <p>
                            Permission is hereby granted, free of charge, to any person obtaining a copy
                            of this software and associated documentation files (the "Software"), to deal
                            in the Software without restriction, including without limitation the rights
                            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                            copies of the Software, and to permit persons to whom the Software is
                            furnished to do so, subject to the following conditions:
                        </p>
                        <p>
                            The above copyright notice and this permission notice shall be included in all
                            copies or substantial portions of the Software.
                        </p>
                        <p>
                            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                            SOFTWARE.
                        </p>
                    </div>
                </section>

                <div className="text-center text-gray-500 text-sm pt-8">
                    Fait avec ❤️ par l'équipe MyCanadaRP
                </div>
            </div>
        </div>
    );
}
