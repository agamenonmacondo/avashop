"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, ZoomIn, Package, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  product_url?: string;
  image_url?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: Product[];
}

interface ChatWidgetProps {
  apiUrl?: string;
  userEmail?: string;
  userName?: string;
}

export function ChatWidget({
  apiUrl = "https://agentecss724.agamenonmacondo.workers.dev/webhook/agent",
  userEmail,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy el Agente CCS724. ¿Qué producto buscas hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [zoomedProduct, setZoomedProduct] = useState<Product | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ URL del producto - usa el ID directamente como en la página de productos
  const getProductUrl = (product: Product): string => {
    // La página de productos usa: /productos/[id]
    // Donde [id] es el product.id de la base de datos
    const productId = product.id;
    return `https://www.ccs724.com/productos/${productId}`;
  };

  // ✅ URL de imagen - usa la ruta correcta de las imágenes
  const getImageUrl = (product: Product): string => {
    const imageSource = product.image_url || product.image || "";
    
    if (!imageSource) {
      return "/images/placeholder.png";
    }
    
    // Si ya es URL completa, usarla
    if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
      return imageSource;
    }
    
    // Si es ruta relativa, construir URL completa
    if (imageSource.startsWith("/images/") || imageSource.startsWith("/")) {
      return imageSource;
    }
    
    // Agregar /images/ si no tiene
    return `/images/${imageSource}`;
  };

  // Función para extraer productos mencionados en el texto
  const extractMentionedProducts = (text: string, allProducts: Product[]): Product[] => {
    if (!allProducts || allProducts.length === 0) return [];
    
    const textLower = text.toLowerCase();
    const mentionedProducts: Product[] = [];
    
    for (const product of allProducts) {
      const productNameLower = product.name.toLowerCase();
      const nameParts = productNameLower.split(/\s+/);
      const significantParts = nameParts.filter(part => part.length > 3);
      const matchCount = significantParts.filter(part => textLower.includes(part)).length;
      
      if (matchCount >= 2 || textLower.includes(productNameLower)) {
        if (!mentionedProducts.find(p => p.id === product.id)) {
          mentionedProducts.push(product);
        }
      }
    }
    
    const priceMatches = text.match(/\$[\d.,]+/g) || [];
    for (const priceStr of priceMatches) {
      const price = parseInt(priceStr.replace(/[$.,]/g, ''));
      const productByPrice = allProducts.find(p => 
        Math.abs(p.price - price) < 100 && !mentionedProducts.find(mp => mp.id === p.id)
      );
      if (productByPrice) {
        mentionedProducts.push(productByPrice);
      }
    }
    
    return mentionedProducts.slice(0, 8);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          email: userEmail || "guest@ccs724.com",
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.error || errorData.message || errorDetail;
        } catch {
          const errorText = await response.text();
          if (errorText) errorDetail = errorText.substring(0, 100);
        }
        throw new Error(errorDetail);
      }

      const data = await response.json();

      if (data.session_id) setSessionId(data.session_id);

      let products: Product[] = [];
      const rawProducts = data.products || [];

      if (Array.isArray(rawProducts) && rawProducts.length > 0) {
        const allProducts = rawProducts.map((p: Record<string, unknown>) => {
          let imageUrl = "";
          
          if (p.image_url && typeof p.image_url === "string") {
            imageUrl = p.image_url;
          } else if (p.image && typeof p.image === "string") {
            imageUrl = p.image;
          } else if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) {
            imageUrl = p.imageUrls[0] as string;
          }
          
          return {
            id: (p.id as string) || "",
            name: (p.name as string) || "Producto",
            price: (p.price as number) || 0,
            image: imageUrl,
            image_url: imageUrl,
            product_url: (p.product_url as string) || "",
          };
        });
        
        const responseText = data.response || "";
        products = extractMentionedProducts(responseText, allProducts);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response || "No pude procesar tu solicitud.",
          timestamp: new Date(),
          products: products.length > 0 ? products : undefined,
        },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error del servidor: ${errorMessage}\n\nPor favor, intenta de nuevo o contacta a soporte.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <>
      {/* Modal de producto ampliado */}
      {zoomedProduct && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomedProduct(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-amber-500 p-4 flex items-center justify-between">
              <span className="text-gray-900 font-bold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Vista del producto
              </span>
              <button
                onClick={() => setZoomedProduct(null)}
                className="p-2 bg-black/20 hover:bg-black/30 rounded-full"
              >
                <X className="h-5 w-5 text-gray-900" />
              </button>
            </div>
            <div className="relative aspect-square bg-white dark:bg-gray-800 group cursor-zoom-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(zoomedProduct)}
                alt={zoomedProduct.name}
                className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-150"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/placeholder.png";
                }}
              />
            </div>
            <div className="p-6 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {zoomedProduct.name}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-black text-amber-500">
                  {formatPrice(zoomedProduct.price)}
                </span>
              </div>
              <a
                href={getProductUrl(zoomedProduct)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setZoomedProduct(null)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Ver en tienda
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Botón flotante - Posición fija arriba del totalizador */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 bottom-28 sm:bottom-32 z-[140] group"
        >
          <div className="relative w-14 h-14 rounded-full 
            bg-white dark:bg-gray-800 
            shadow-xl flex items-center justify-center
            transition-transform duration-300 group-hover:scale-110
            border-3 border-amber-500">
            <Image
              src="/images/AVALOGO/ccs724_logo_solo_transparent.png"
              alt="Agente CCS724"
              width={40}
              height={40}
              className="object-contain dark:hidden"
            />
            <Image
              src="/images/AVALOGO/ccs724_icon_transparent.png"
              alt="Agente CCS724"
              width={40}
              height={40}
              className="object-contain hidden dark:block"
            />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 
            bg-gray-900 text-white text-xs font-semibold rounded-lg
            opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
            ¿Necesitas ayuda?
          </span>
        </button>
      )}

      {/* ✅ Panel del chat - CORREGIDO para móvil */}
      <div
        className={`fixed z-[160] transition-all duration-300
          ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
          
          /* ✅ MÓVIL: Ocupa casi toda la pantalla, posicionado desde abajo */
          inset-x-2 bottom-2 top-auto
          
          /* ✅ DESKTOP: Tamaño fijo en esquina derecha */
          sm:inset-auto sm:right-4 sm:bottom-28`}
      >
        <div className="w-full sm:w-[400px] h-[calc(100vh-120px)] sm:h-[500px] max-h-[600px] 
          bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col 
          border border-gray-200 dark:border-gray-700 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-amber-500 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white p-1 shadow-lg flex-shrink-0">
                <Image
                  src="/images/AVALOGO/ccs724_logo_solo_transparent.png"
                  alt="CCS724"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Agente CCS724</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${sessionId ? "bg-green-600" : "bg-gray-600"}`} />
                  <p className="text-xs text-gray-800">{sessionId ? "En línea" : "Disponible"}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="h-6 w-6 text-gray-900" />
            </button>
          </div>

          {/* Messages - área scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 p-0.5 mr-2 flex-shrink-0 shadow border-2 border-amber-400">
                        <Image
                          src="/images/AVALOGO/ccs724_logo_solo_transparent.png"
                          alt="CCS724"
                          width={28}
                          height={28}
                          className="w-full h-full object-contain dark:hidden"
                        />
                        <Image
                          src="/images/AVALOGO/ccs724_icon_transparent.png"
                          alt="CCS724"
                          width={28}
                          height={28}
                          className="w-full h-full object-contain hidden dark:block"
                        />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow ${
                        msg.role === "user"
                          ? "bg-amber-500 text-gray-900 rounded-br-sm max-w-[80%]"
                          : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-600 max-w-[90%]"
                      }`}
                    >
                      <div
                        className="text-sm leading-relaxed"
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {msg.content}
                      </div>
                      <p
                        className={`text-[10px] mt-2 text-right ${
                          msg.role === "user" ? "text-gray-700/70" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  {/* Productos */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 ml-10">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        {msg.products.length} productos encontrados
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {msg.products.map((product, pIdx) => (
                          <div
                            key={pIdx}
                            className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 
                              shadow hover:shadow-md hover:border-amber-500 transition-all overflow-hidden"
                          >
                            <div 
                              className="relative h-20 sm:h-24 bg-white dark:bg-gray-800 cursor-pointer group"
                              onClick={() => setZoomedProduct(product)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getImageUrl(product)}
                                alt={product.name}
                                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/placeholder.png";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center">
                                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg" />
                              </div>
                            </div>
                            
                            <div className="p-2">
                              <p className="text-[10px] sm:text-xs font-medium text-gray-800 dark:text-gray-100 line-clamp-2 min-h-[28px] sm:min-h-[32px]">
                                {product.name}
                              </p>
                              <p className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
                                {formatPrice(product.price)}
                              </p>
                              
                              <a
                                href={getProductUrl(product)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 text-[10px] font-semibold rounded flex items-center justify-center gap-1 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Ver producto
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 p-0.5 mr-2 shadow border-2 border-amber-400">
                    <Image
                      src="/images/AVALOGO/ccs724_logo_solo_transparent.png"
                      alt="CCS724"
                      width={28}
                      height={28}
                      className="w-full h-full object-contain dark:hidden"
                    />
                    <Image
                      src="/images/AVALOGO/ccs724_icon_transparent.png"
                      alt="CCS724"
                      width={28}
                      height={28}
                      className="w-full h-full object-contain hidden dark:block"
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-200 dark:border-gray-600 shadow">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input - fijo en la parte inferior */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Busca productos..."
                disabled={isLoading}
                className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 
                  focus:border-amber-500 text-sm text-gray-900 dark:text-gray-100 h-11"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="rounded-lg bg-amber-500 hover:bg-amber-600 w-11 h-11 text-gray-900"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay - z-index menor que el chat */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[155]" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}