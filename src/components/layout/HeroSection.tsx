'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const heroContent = [
    {
        type: 'image',
        src: '/images/UTILES/BANNER UTILES.png',
        title: '📚 Útiles Escolares 2025',
        description: 'Todo lo que necesitas para el regreso a clases',
        price: '',
        link: '/landing/utiles-escolares',
        buttonText: 'Ver Productos',
        showCard: false, // No mostrar tarjeta en útiles
    },
    {
        type: 'image',
        src: '/images/creatina/hero_creatina.jpeg',
        title: '💪 Creatina Monohidrato',
        description: 'Potencia tu energía y fuerza',
        price: '$65.000',
        link: '/landing/creatina',
        buttonText: 'Comprar Ahora',
        showCard: true, // Sí mostrar tarjeta en creatina
    },
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
        }, 4000);
        return () => clearInterval(interval);
    }, [isHovered]);

    // Handle video changes
    useEffect(() => {
        const video = videoRef.current;
        if (video && activeContent.type === 'video') {
            video.src = activeContent.src;
            video.load();
            video.play().catch(() => {});
        }
    }, [activeIndex, activeContent]);

    const goToSlide = (index: number) => {
        setActiveIndex(index);
    };

    const goToPrevious = () => {
        setActiveIndex((prev) => (prev - 1 + heroContent.length) % heroContent.length);
    };

    const goToNext = () => {
        setActiveIndex((prev) => (prev + 1) % heroContent.length);
    };

    const handleImageClick = () => {
        router.push(activeContent.link);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(activeContent.link);
    };

    return (
        <section 
            className="relative w-full bg-black group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] max-h-[60vh] sm:max-h-[60vh] md:max-h-[70vh]">
                {/* Imagen o video clickable */}
                <div className="absolute inset-0 cursor-pointer" onClick={handleImageClick}>
                    {activeContent.type === 'video' ? (
                        <video
                            ref={videoRef}
                            src={activeContent.src}
                            loop
                            muted
                            playsInline
                            autoPlay
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Image
                            src={activeContent.src}
                            alt={activeContent.title}
                            fill
                            className="object-cover transition-all duration-300"
                            priority={activeIndex === 0}
                        />
                    )}
                </div>

                {/* Tarjeta flotante - Solo en slides con showCard: true */}
                {activeContent.showCard && (
                    <div className="absolute right-3 sm:right-6 md:right-10 lg:right-16 top-1/2 -translate-y-1/2 w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] animate-fade-in">
                        <div className="bg-gradient-to-br from-white via-white to-gray-50 backdrop-blur-md rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
                            {/* Descripción */}
                            <p className="text-gray-700 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 font-medium leading-snug line-clamp-2">
                                {activeContent.description}
                            </p>
                            
                            {/* Precio */}
                            {activeContent.price && (
                                <div className="mb-3 sm:mb-4">
                                    <p className="text-primary text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                                        {activeContent.price}
                                    </p>
                                    <p className="text-gray-500 text-[10px] sm:text-xs font-medium">
                                        Envío gratis
                                    </p>
                                </div>
                            )}
                            
                            {/* Botón CTA */}
                            <button
                                onClick={handleButtonClick}
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                            >
                                <span>{activeContent.buttonText}</span>
                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Flechas navegación */}
                <button
                    onClick={goToPrevious}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-xl z-10"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                </button>
                <button
                    onClick={goToNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-xl z-10"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                </button>

                {/* Indicadores - Minimalistas */}
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {heroContent.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`rounded-full transition-all duration-300 shadow-lg ${
                                activeIndex === index
                                    ? 'w-8 sm:w-12 h-2 sm:h-2.5 bg-white'
                                    : 'w-2 h-2 sm:h-2.5 bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Ir a slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </section>
    );
}
