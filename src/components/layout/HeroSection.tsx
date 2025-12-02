'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const heroContent = [
    {
        type: 'video',
        desktop: '/images/combos/combo_1/COMBO PRO REEL DESKTOP.mp4',
        mobile: '/images/combos/combo_1/DESKTOP  PRO.mp4',
        title: 'Combo PRO',
        description: 'Audio Dual y Estabilización Inteligente',
        price: '$489.900',
        link: '/landing',
        buttonText: 'Ver Combo PRO',
        showInfo: true,
    },
    {
        type: 'video',
        desktop: '/images/combos/combo_1/ESENCIAL REEL DESKTOP.mp4',
        mobile: '/images/combos/combo_1/ESENCIAL MOBILE.mp4',
        title: 'Kit Esencial',
        description: 'Micrófono K18 y Gimbal KM01',
        price: '$299.900',
        link: '/landing/kit-esencial',
        buttonText: 'Ver Kit Esencial',
        showInfo: true,
    },
    {
        type: 'image',
        desktop: '/images/combos/combo_1/COMPRA Y DESKTOP.jpeg',
        mobile: '/images/combos/combo_1/COMPRA MOBILE.jpeg',
        title: 'Crea Contenido Pro',
        description: 'Selfie Sticks, Aros de Luz y Carga Magnética',
        price: '',
        link: '/landing', // Cambiado a /landing (Combo PRO)
        buttonText: 'Ver Combo PRO',
        showInfo: true,
    },
    {
        type: 'image',
        desktop: '/images/combos/combo_1/SEGURIDAD DESKTOP.jpeg',
        mobile: '/images/combos/combo_1/SEGURIDAD MOBILE.jpeg',
        title: '¡Captura tu Mejor Ángulo!',
        description: 'Kit de Creación: Selfie Stick + Aro de Luz + Carga Rápida',
        price: '',
        link: '/landing/kit-esencial', // Cambiado a /landing/kit-esencial (Kit Esencial)
        buttonText: 'Ver Kit Esencial',
        showInfo: true,
    }
];

export default function HeroSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const mobileVideoRef = useRef<HTMLVideoElement>(null);
    const desktopVideoRef = useRef<HTMLVideoElement>(null);
    const activeContent = heroContent[activeIndex];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % heroContent.length);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    // Efecto para manejar videos
    useEffect(() => {
        const desktopVideo = desktopVideoRef.current;
        const mobileVideo = mobileVideoRef.current;

        if (activeContent.type === 'video') {
            if (desktopVideo) {
                desktopVideo.src = activeContent.desktop;
                desktopVideo.load();
                desktopVideo.play().catch(err => console.log('Error playing desktop video:', err));
            }
            if (mobileVideo) {
                mobileVideo.src = activeContent.mobile;
                mobileVideo.load();
                mobileVideo.play().catch(err => console.log('Error playing mobile video:', err));
            }
        }
    }, [activeIndex, activeContent]);


    const handleCTAClick = () => {
        router.push(activeContent.link);
    };

    const renderMedia = (isMobile: boolean) => {
        const media = isMobile ? activeContent.mobile : activeContent.desktop;
        const videoRef = isMobile ? mobileVideoRef : desktopVideoRef;

        if (activeContent.type === 'video') {
            return (
                <video
                    ref={videoRef}
                    src={media}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover bg-black"
                />
            );
        }
        // Para imágenes, usar la misma estructura que videos
        return (
            <div className="w-full h-full relative">
                <Image
                    src={media}
                    alt={activeContent.title}
                    fill
                    className="object-cover"
                    priority={true}
                />
            </div>
        );
    };

    return (
        <section className="relative bg-background w-full py-16 md:py-24">
            {/* Desktop: Grid con CTA y Video/Imagen */}
            <div className="hidden md:grid container mx-auto px-4 grid-cols-2 gap-12 items-center max-w-7xl">
                {/* Columna izquierda: Call to Actions */}
                {activeContent.showInfo ? (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-yellow-500 mb-4">
                                CCS 724
                            </h2>
                            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
                                {activeContent.title}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                {activeContent.description}
                            </p>
                        </div>

                        {activeContent.price && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-5xl font-bold text-primary">
                                            {activeContent.price}
                                        </span>
                                        <span className="text-lg text-foreground font-medium">COP</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Precio especial por tiempo limitado
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <p className="text-sm font-semibold text-foreground mb-2">
                                        Oferta Exclusiva
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Envío gratis en compras superiores a $200.000
                                    </p>
                                    <Button
                                        size="lg"
                                        onClick={handleCTAClick}
                                        className="text-base px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                    >
                                        {activeContent.buttonText}
                                    </Button>
                                </div>
                            </>
                        )}
                        {!activeContent.price && (
                            <div className="pt-2">
                                <Button
                                    size="lg"
                                    onClick={handleCTAClick}
                                    className="text-base px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                >
                                    {activeContent.buttonText}
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div></div>
                )}

                {/* Columna derecha: Video/Imagen */}
                <div
                    className={`relative w-full cursor-pointer group ${!activeContent.showInfo ? 'col-span-2' : ''}`}
                    onClick={handleCTAClick}
                >
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
                        {renderMedia(false)}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>
                </div>
            </div>

            {/* Indicadores de navegación para desktop */}
            <div className="hidden md:flex justify-center gap-3 mt-12">
                {heroContent.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            activeIndex === index
                                ? 'w-8 bg-primary shadow-md'
                                : 'w-1.5 bg-border hover:bg-foreground/30 dark:bg-muted dark:hover:bg-muted-foreground/50'
                        }`}
                        aria-label={`Mostrar contenido ${index + 1}`}
                    />
                ))}
            </div>

            {/* Mobile: Video/Imagen vertical con CTA abajo */}
            <div className="block md:hidden relative w-full px-4">
                <div className="relative w-full max-w-sm mx-auto">
                    <div
                        className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-xl mb-8 cursor-pointer"
                        onClick={handleCTAClick}
                    >
                        {renderMedia(true)}
                    </div>

                    {/* CTA para mobile */}
                    {activeContent.showInfo && (
                        <div className="space-y-5 mb-8">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-yellow-500 mb-3">
                                    CCS 724
                                </h3>
                                <h2 className="text-3xl font-bold text-foreground mb-3">
                                    {activeContent.title}
                                </h2>
                                <p className="text-base text-muted-foreground leading-relaxed">
                                    {activeContent.description}
                                </p>
                            </div>

                            {activeContent.price && (
                                <>
                                    <div className="text-center space-y-2">
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className="text-4xl font-bold text-primary">
                                                {activeContent.price}
                                            </span>
                                            <span className="text-base text-foreground font-medium">COP</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Precio especial por tiempo limitado
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs font-semibold text-foreground mb-1">
                                            Oferta Exclusiva
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Envío gratis en compras superiores a $200.000
                                        </p>
                                    </div>
                                </>
                            )}

                            <Button size="lg" onClick={handleCTAClick} className="w-full font-semibold">
                                {activeContent.buttonText}
                            </Button>
                        </div>
                    )}

                    {/* Indicadores de navegación para mobile */}
                    <div className="flex justify-center gap-2.5 mt-8">
                        {heroContent.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    activeIndex === index
                                        ? 'w-8 bg-primary shadow-md'
                                        : 'w-1.5 bg-border hover:bg-foreground/30 dark:bg-muted dark:hover:bg-muted-foreground/50'
                                }`}
                                aria-label={`Mostrar contenido ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
