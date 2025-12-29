'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const heroContent = [
    {
        type: 'image',
        src: '/images/creatina/hero_creatina.jpeg',
        title: '💪 Creatina Monohidrato',
        description: 'Potencia tu energía y fuerza con creatina para mujeres',
        price: '$65.000',
        link: '/landing/creatina',
        buttonText: 'Ver Creatina',
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
            {/* Contenedor principal - MÁS ESPACIO para el video en mobile */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] max-h-[60vh] sm:max-h-[60vh] md:max-h-[70vh]">
                {/* Video o Imagen de fondo */}
                {activeContent.type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={activeContent.src}
                        loop
                        muted
                        playsInline
                        autoPlay
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <Image
                        src={activeContent.src}
                        alt={activeContent.title}
                        fill
                        className="object-cover"
                        priority={activeIndex === 0}
                    />
                )}

                {/* Overlay gradiente REDUCIDO - Solo en los bordes para legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Contenido sobre el video - ULTRA COMPACTO en mobile */}
                <div className="absolute inset-0 flex items-end sm:items-center pb-10 sm:pb-0">
                    <div className="container mx-auto px-3 sm:px-6 md:px-12 max-w-7xl">
                        <div className="max-w-lg space-y-1 sm:space-y-4 md:space-y-5">
                            {/* Badge - EXTRA PEQUEÑO en mobile */}
                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-4 sm:py-2 rounded-full shadow-2xl ${
                                activeIndex === 0 
                                    ? 'bg-red-600 animate-pulse' 
                                    : 'bg-primary'
                            }`}>
                                <span className="text-[9px] sm:text-sm md:text-base font-bold text-white tracking-wide">
                                    {activeIndex === 0 ? '🎄 NAVIDAD 2025' : 'CCS724'}
                                </span>
                            </div>

                            {/* Título - MUCHO MÁS PEQUEÑO en mobile */}
                            <h1 className="text-sm sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                                {activeContent.title}
                            </h1>

                            {/* Descripción - EXTRA PEQUEÑA en mobile */}
                            <p className="text-[10px] sm:text-base md:text-lg text-white/95 leading-tight sm:leading-relaxed max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {activeContent.description}
                            </p>

                            {/* Precio - MÁS PEQUEÑO en mobile */}
                            {activeContent.price && (
                                <div className="flex flex-wrap items-baseline gap-1 sm:gap-3">
                                    <span className="text-xl sm:text-4xl md:text-5xl font-black text-primary drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                                        {activeContent.price}
                                    </span>
                                    <span className="text-[10px] sm:text-base text-white/90 font-semibold">COP</span>
                                    {activeIndex === 0 && (
                                        <span className="px-1.5 py-0.5 sm:px-3 sm:py-1 bg-green-500 text-white text-[9px] sm:text-sm font-bold rounded-full shadow-lg">
                                            ENVÍO GRATIS
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* CTA Button - EXTRA PEQUEÑO en mobile */}
                            <div className="pt-0.5 sm:pt-3">
                                <Button
                                    size="sm"
                                    onClick={handleCTAClick}
                                    className={`w-auto text-[10px] sm:text-base md:text-lg px-3 sm:px-8 md:px-10 py-1.5 sm:py-4 md:py-5 font-bold shadow-2xl hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 rounded-full ${
                                        activeIndex === 0
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                    }`}
                                >
                                    {activeContent.buttonText}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controles de navegación - Flechas MÁS PEQUEÑAS en mobile */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 p-1 sm:p-3 md:p-4 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 shadow-xl"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="h-3.5 w-3.5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </button>
                <button
                    onClick={goToNext}
                    className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 p-1 sm:p-3 md:p-4 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 shadow-xl"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="h-3.5 w-3.5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </button>

                {/* Indicadores de navegación - EXTRA PEQUEÑOS en mobile */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 flex items-center gap-1 sm:gap-3">
                    {/* Contador - Solo en tablet/desktop */}
                    <span className="hidden sm:inline text-white/90 text-sm md:text-base font-semibold mr-2 drop-shadow-lg">
                        {activeIndex + 1} / {heroContent.length}
                    </span>
                    
                    {/* Dots - EXTRA PEQUEÑOS en mobile */}
                    {heroContent.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-1 sm:h-2.5 rounded-full transition-all duration-300 shadow-lg ${
                                activeIndex === index
                                    ? 'w-3 sm:w-8 md:w-10 bg-primary'
                                    : 'w-1 sm:w-2.5 bg-white/70 hover:bg-white/90'
                            }`}
                            aria-label={`Ir a slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Barra de progreso - EXTRA DELGADA en mobile */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1.5 bg-white/20">
                    <div 
                        className="h-full bg-primary transition-all duration-300 shadow-lg"
                        style={{ 
                            width: `${((activeIndex + 1) / heroContent.length) * 100}%` 
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
