'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const heroVideos = [
    {
        desktop: '/images/combos/combo_1/COMBO_PRO.mp4',
        mobile: '/images/combos/combo_1/COMBO_PRO_MOBILE.mp4',
        title: 'Combo PRO',
        description: 'Audio Dual y Estabilización Inteligente',
        price: '$489.900',
        link: '/landing',
        buttonText: 'Ver Combo PRO',
    },
    {
        desktop: '/images/combos/combo_1/KIT_ESENCIAL.mp4',
        mobile: '/images/combos/combo_1/KIT_ESENCIAL_MOBILE.mp4',
        title: 'Kit Esencial',
        description: 'Sonido Pro y Luz Perfecta',
        price: '$299.900',
        link: '/landing/kit-esencial',
        buttonText: 'Ver Kit Esencial',
    },
    {
        desktop: '/images/combos/combo_1/KM03.mp4',
        mobile: '/images/combos/combo_1/KM03_MOBILE.mp4',
        title: 'KOOSDA Gimbal KM03',
        description: 'Estabilización Profesional',
        price: '$289.900',
        link: '/landing',
        buttonText: 'Ver Gimbal KM03',
    },
    {
        desktop: '/images/combos/combo_1/K18.mp4',
        mobile: '/images/combos/combo_1/K18_MOBILE.mp4',
        title: 'REMAX Micrófono K18',
        description: 'Audio Inalámbrico Premium',
        price: '$149.900',
        link: '/landing',
        buttonText: 'Ver Micrófono K18',
    },
    {
        desktop: '/images/combos/combo_1/KM01.mp4',
        mobile: '/images/combos/combo_1/KM01_MOBILE.mp4',
        title: 'KOOSDA Mini Gimbal KM01',
        description: 'Compacto y Versátil',
        price: '$189.900',
        link: '/landing/kit-esencial',
        buttonText: 'Ver Mini Gimbal',
    },
];

export default function HeroSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const mobileVideoRef = useRef<HTMLVideoElement>(null);
    const desktopVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % heroVideos.length);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    // Reiniciar y reproducir video mobile cuando cambia el índice
    useEffect(() => {
        const video = mobileVideoRef.current;
        if (video) {
            // Pausar el video actual
            video.pause();
            // Cambiar la fuente
            video.src = heroVideos[activeIndex].mobile;
            // Cargar el nuevo video
            video.load();
            // Esperar a que esté listo y reproducir
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.log('Error playing mobile video:', err);
                });
            }
        }
    }, [activeIndex]);

    // Reiniciar y reproducir video desktop cuando cambia el índice
    useEffect(() => {
        const video = desktopVideoRef.current;
        if (video) {
            // Pausar el video actual
            video.pause();
            // Cambiar la fuente
            video.src = heroVideos[activeIndex].desktop;
            // Cargar el nuevo video
            video.load();
            // Esperar a que esté listo y reproducir
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.log('Error playing desktop video:', err);
                });
            }
        }
    }, [activeIndex]);

    const handleCTAClick = () => {
        router.push(heroVideos[activeIndex].link);
    };

    return (
        <section className="relative bg-background w-full py-16 md:py-24">
            {/* Desktop: Grid con CTA y Video */}
            <div className="hidden md:block container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                    {/* Columna izquierda: Call to Actions */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-yellow-500 mb-4">
                                CCS 724
                            </h2>
                            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
                                {heroVideos[activeIndex].title}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                {heroVideos[activeIndex].description}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-bold text-primary">
                                    {heroVideos[activeIndex].price}
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
                                {heroVideos[activeIndex].buttonText}
                            </Button>
                        </div>
                    </div>

                    {/* Columna derecha: Video */}
                    <div className="relative w-full cursor-pointer group" onClick={handleCTAClick}>
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
                            <video
                                ref={desktopVideoRef}
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-contain bg-black"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        </div>
                    </div>
                </div>

                {/* Indicadores de navegación para desktop */}
                <div className="flex justify-center gap-3 mt-12">
                    {heroVideos.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                activeIndex === index
                                    ? 'w-8 bg-primary shadow-md'
                                    : 'w-1.5 bg-border hover:bg-foreground/30 dark:bg-muted dark:hover:bg-muted-foreground/50'
                            }`}
                            aria-label={`Mostrar video ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile: Video vertical con CTA abajo */}
            <div className="block md:hidden relative w-full px-4">
                <div className="relative w-full max-w-sm mx-auto">
                    <div
                        className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-xl mb-8 cursor-pointer"
                        onClick={handleCTAClick}
                    >
                        <video
                            ref={mobileVideoRef}
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-contain bg-black"
                        />
                    </div>

                    {/* CTA para mobile */}
                    <div className="space-y-5 mb-8">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-yellow-500 mb-3">
                                CCS 724
                            </h3>
                            <h2 className="text-3xl font-bold text-foreground mb-3">
                                {heroVideos[activeIndex].title}
                            </h2>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                {heroVideos[activeIndex].description}
                            </p>
                        </div>

                        <div className="text-center space-y-2">
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-4xl font-bold text-primary">
                                    {heroVideos[activeIndex].price}
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

                        <Button size="lg" onClick={handleCTAClick} className="w-full font-semibold">
                            {heroVideos[activeIndex].buttonText}
                        </Button>
                    </div>

                    {/* Indicadores de navegación para mobile */}
                    <div className="flex justify-center gap-2.5">
                        {heroVideos.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    activeIndex === index
                                        ? 'w-8 bg-primary shadow-md'
                                        : 'w-1.5 bg-border hover:bg-foreground/30 dark:bg-muted dark:hover:bg-muted-foreground/50'
                                }`}
                                aria-label={`Mostrar video ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
