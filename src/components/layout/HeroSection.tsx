'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const heroContent = [
    {
        type: 'video',
        src: '/images/combos/combo_1/COMBO PRO REEL DESKTOP.mp4',
        title: 'Combo PRO',
        description: 'Audio Dual y Estabilización Inteligente',
        price: '$489.900',
        link: '/landing',
        buttonText: 'Ver Combo PRO',
    },
    {
        type: 'video',
        src: '/images/combos/combo_1/ESENCIAL REEL DESKTOP.mp4',
        title: 'Kit Esencial',
        description: 'Micrófono K18 y Gimbal KM01',
        price: '$299.900',
        link: '/landing/kit-esencial',
        buttonText: 'Ver Kit Esencial',
    },
    {
        type: 'video',
        src: '/images/combos/combo_1/PROMO _DESKTOP.mp4',
        title: 'Crea Contenido Pro',
        description: 'Selfie Sticks, Aros de Luz y Carga Magnética',
        price: '',
        link: '/landing',
        buttonText: 'Ver Combo PRO',
    },
    {
        type: 'video',
        src: '/images/combos/combo_1/SEGURIDAD_DEKSTOP.mp4',
        title: '¡Captura tu Mejor Ángulo!',
        description: 'Kit de Creación: Selfie Stick + Aro de Luz + Carga Rápida',
        price: '',
        link: '/landing/kit-esencial',
        buttonText: 'Ver Kit Esencial',
    }
];

export default function HeroSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const activeContent = heroContent[activeIndex];

    // Auto-advance slides
    useEffect(() => {
        if (isHovered) return;
        
        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % heroContent.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [isHovered]);

    // Handle video changes
    useEffect(() => {
        const video = videoRef.current;
        if (video && activeContent.type === 'video') {
            video.src = activeContent.src;
            video.load();
            video.play().catch(() => {
                // Silently handle autoplay errors
            });
        }
    }, [activeIndex, activeContent]);

    const handleCTAClick = () => {
        router.push(activeContent.link);
    };

    const goToSlide = (index: number) => {
        setActiveIndex(index);
    };

    const goToPrevious = () => {
        setActiveIndex((prev) => (prev - 1 + heroContent.length) % heroContent.length);
    };

    const goToNext = () => {
        setActiveIndex((prev) => (prev + 1) % heroContent.length);
    };

    return (
        <section 
            className="relative w-full bg-black group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Contenedor principal - Compacto en mobile */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh]">
                {/* Video de fondo */}
                <video
                    ref={videoRef}
                    src={activeContent.src}
                    loop
                    muted
                    playsInline
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay gradiente oscuro para legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                {/* Contenido sobre el video */}
                <div className="absolute inset-0 flex items-end sm:items-center pb-12 sm:pb-0">
                    <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl">
                        <div className="max-w-lg space-y-2 sm:space-y-3 md:space-y-4">
                            {/* Badge - Siempre visible con buen contraste */}
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-primary rounded-full shadow-lg">
                                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-primary-foreground tracking-wide">
                                    CCS724
                                </span>
                            </div>

                            {/* Título - Blanco puro para máximo contraste */}
                            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                                {activeContent.title}
                            </h1>

                            {/* Descripción */}
                            <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed max-w-md drop-shadow">
                                {activeContent.description}
                            </p>

                            {/* Precio */}
                            {activeContent.price && (
                                <div className="flex items-baseline gap-1.5 sm:gap-2">
                                    <span className="text-xl sm:text-2xl md:text-4xl font-bold text-primary drop-shadow-lg">
                                        {activeContent.price}
                                    </span>
                                    <span className="text-xs sm:text-sm text-white/80 font-medium">COP</span>
                                </div>
                            )}

                            {/* CTA Button */}
                            <div className="pt-1 sm:pt-2">
                                <Button
                                    size="default"
                                    onClick={handleCTAClick}
                                    className="text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    {activeContent.buttonText}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controles de navegación - Flechas */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
                <button
                    onClick={goToNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>

                {/* Indicadores de navegación */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:bottom-4 sm:right-4 md:bottom-6 md:right-8 flex items-center gap-1.5 sm:gap-2">
                    {/* Contador - Solo en tablet/desktop */}
                    <span className="hidden sm:inline text-white/80 text-xs md:text-sm font-medium mr-2 drop-shadow">
                        {activeIndex + 1} / {heroContent.length}
                    </span>
                    
                    {/* Dots */}
                    {heroContent.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                                activeIndex === index
                                    ? 'w-5 sm:w-6 md:w-8 bg-primary'
                                    : 'w-1.5 sm:w-2 bg-white/60 hover:bg-white/80'
                            }`}
                            aria-label={`Ir a slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Barra de progreso */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-white/30">
                    <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ 
                            width: `${((activeIndex + 1) / heroContent.length) * 100}%` 
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
