'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { formatColombianCurrency } from '@/lib/utils';

interface ShareProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    imageUrl: string;
  };
  productUrl: string;
}

export default function ShareProductModal({
  isOpen,
  onClose,
  product,
  productUrl
}: ShareProductModalProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Verificar si Web Share API está disponible
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${formatColombianCurrency(product.price)}`,
          url: productUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-200 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - MÁS GRANDE */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-background rounded-xl shadow-2xl border p-8 mx-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Share2 className="h-7 w-7 text-primary" />
              Compartir Producto
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-2 hover:bg-secondary"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Product Info - MÁS GRANDE */}
          <div className="flex gap-6 mb-8 p-6 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border-2 border-secondary">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-bold text-xl line-clamp-2 mb-3">
                {product.name}
              </h4>
              <p className="text-primary font-bold text-3xl">
                {formatColombianCurrency(product.price)}
              </p>
            </div>
          </div>

          {/* URL Section */}
          <div className="mb-6">
            <label className="block text-base font-semibold mb-3">
              Link del producto
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={productUrl}
                readOnly
                className="flex-1 px-4 py-3 border-2 rounded-lg bg-secondary/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyLink}
                className={`px-6 transition-all duration-200 ${
                  copied 
                    ? 'bg-green-500 text-white hover:bg-green-600 border-green-500' 
                    : ''
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Buttons - MÁS GRANDES */}
          <div className="space-y-3">
            {canShare && (
              <Button
                variant="default"
                size="lg"
                className="w-full py-6 text-lg font-semibold"
                onClick={handleNativeShare}
              >
                <Share2 className="h-6 w-6 mr-3" />
                Compartir en Aplicaciones
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              className="w-full py-6 text-lg font-semibold"
              onClick={handleCopyLink}
            >
              <Copy className="h-6 w-6 mr-3" />
              Copiar Enlace Completo
            </Button>
          </div>

          {/* Footer Info */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Comparte este producto con tus amigos y familiares
          </p>
        </div>
      </div>
    </>
  );
}