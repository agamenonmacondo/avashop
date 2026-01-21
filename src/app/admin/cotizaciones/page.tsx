'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Search, Loader2, LogOut, Package, X, Plus, Minus, Download, Send, History, MapPin, Edit2, ZoomIn, ShoppingCart, Check } from 'lucide-react';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import Image from 'next/image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const AUTHORIZED_ADMIN_EMAILS = [
  'agamenonmacondo@gmail.com',
  'elkinleon87@gmail.com',
];

const SHIPPING_PROVIDERS = [
  { id: '1', name: 'Interrapidísimo', logo: '🏃' },
  { id: '2', name: 'Coordinadora', logo: '📦' },
  { id: '3', name: 'TCC', logo: '🚚' },
  { id: '4', name: 'Servientrega', logo: '⚡' },
  { id: '5', name: 'Envía', logo: '✈️' },
];

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  weight?: number;
  subcategory_id?: string;
  subcategory_name?: string;
  category_id?: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface QuoteItem {
  product: Product;
  quantity: number;
}

interface SavedQuote {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  items: QuoteItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  weight: number;
  created_at: string;
}

// Componente separado para el formulario del cliente
interface CustomerFormProps {
  customerName: string;
  customerPhone: string;
  customerCity: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCityChange: (value: string) => void;
}

function CustomerForm({ 
  customerName, 
  customerPhone, 
  customerCity, 
  onNameChange, 
  onPhoneChange, 
  onCityChange 
}: CustomerFormProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Datos del Cliente</h3>
      <Input
        placeholder="Nombre del cliente"
        defaultValue={customerName}
        onBlur={(e) => onNameChange(e.target.value)}
        onChange={(e) => onNameChange(e.target.value)}
        className="h-10"
        type="text"
        autoComplete="off"
      />
      <Input
        placeholder="Teléfono (ej: 3001234567)"
        defaultValue={customerPhone}
        onBlur={(e) => onPhoneChange(e.target.value)}
        onChange={(e) => onPhoneChange(e.target.value)}
        className="h-10"
        type="tel"
        autoComplete="off"
      />
      <div className="flex gap-2 items-center">
        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Ciudad de destino"
          defaultValue={customerCity}
          onBlur={(e) => onCityChange(e.target.value)}
          onChange={(e) => onCityChange(e.target.value)}
          className="h-10 flex-1"
          type="text"
          autoComplete="off"
        />
      </div>
    </div>
  );
}

// Componente para items del carrito
interface CartItemProps {
  item: QuoteItem;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-2 p-2 border rounded-lg bg-muted/30">
      <div className="relative w-12 h-12 flex-shrink-0 rounded bg-muted overflow-hidden">
        {item.product.image ? (
          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="48px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium line-clamp-1">{item.product.name}</p>
        <p className="text-xs text-muted-foreground">${item.product.price.toLocaleString('es-CO')}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => onUpdateQuantity(item.product.id, -1)} className="h-6 w-6 p-0">
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
            <Button size="sm" variant="outline" onClick={() => onUpdateQuantity(item.product.id, 1)} className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold">${(item.quantity * item.product.price).toLocaleString('es-CO')}</span>
            <Button size="sm" variant="ghost" onClick={() => onRemove(item.product.id)} className="h-6 w-6 p-0 text-destructive">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CotizacionesPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [shippingCost, setShippingCost] = useState(13000);
  const [shippingProvider, setShippingProvider] = useState('2');
  const [editingShipping, setEditingShipping] = useState(false);
  const [tempShippingCost, setTempShippingCost] = useState('13000');
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [tab, setTab] = useState<'new' | 'history'>('new');
  const [saving, setSaving] = useState(false);
  
  // Mobile states
  const [zoomProduct, setZoomProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);

  const cartProductIds = useMemo(() => {
    return new Set(quoteItems.map(item => item.product.id));
  }, [quoteItems]);

  const selectedByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    quoteItems.forEach(item => {
      const catId = item.product.category_id || '';
      counts[catId] = (counts[catId] || 0) + item.quantity;
    });
    return counts;
  }, [quoteItems]);

  const selectedBySubcategory = useMemo(() => {
    const counts: Record<string, number> = {};
    quoteItems.forEach(item => {
      const subId = item.product.subcategory_id || '';
      counts[subId] = (counts[subId] || 0) + item.quantity;
    });
    return counts;
  }, [quoteItems]);

  const getProductQuantity = useCallback((productId: string): number => {
    const item = quoteItems.find(i => i.product.id === productId);
    return item?.quantity || 0;
  }, [quoteItems]);

  const { subtotal, totalWeight, total } = useMemo(() => {
    const sub = quoteItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    const weight = quoteItems.reduce((sum, item) => 
      sum + ((item.product.weight || 80) * item.quantity), 0
    );
    return { subtotal: sub, totalWeight: weight, total: sub + shippingCost };
  }, [quoteItems, shippingCost]);

  const totalItems = useMemo(() => 
    quoteItems.reduce((sum, item) => sum + item.quantity, 0)
  , [quoteItems]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/admin/cotizaciones');
      return;
    }

    if (!authLoading && user && !AUTHORIZED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && AUTHORIZED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
      fetchProducts();
      fetchSavedQuotes();
    }
  }, [user]);

  async function fetchProducts() {
    if (!supabase) return;

    try {
      setLoading(true);
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          image, 
          subcategory_id,
          subcategories(
            id,
            name,
            category_id,
            categories(
              id,
              name
            )
          )
        `)
        .order('name');

      if (productsError) throw productsError;
      
      const productsWithWeight = (productsData || []).map((p: any) => {
        const subcategory = Array.isArray(p.subcategories) ? p.subcategories[0] : p.subcategories;
        const category = subcategory?.categories;
        const categoryData = Array.isArray(category) ? category[0] : category;
        
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          subcategory_id: p.subcategory_id,
          subcategory_name: subcategory?.name || '',
          category_id: categoryData?.id || '',
          category_name: categoryData?.name || '',
          weight: estimateWeightByCategory(p.name, subcategory?.name || '', categoryData?.name || '')
        };
      });
      
      setProducts(productsWithWeight);
      
      const categoryMap = new Map<string, Category>();
      productsWithWeight.forEach(p => {
        if (!categoryMap.has(p.category_id)) {
          categoryMap.set(p.category_id, {
            id: p.category_id,
            name: p.category_name
          });
        }
      });
      setCategories(Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name)));

      const subcategoryMap = new Map<string, Subcategory>();
      productsWithWeight.forEach(p => {
        const key = `${p.category_id}__${p.subcategory_id}`;
        if (!subcategoryMap.has(key)) {
          subcategoryMap.set(key, {
            id: p.subcategory_id,
            name: p.subcategory_name,
            category_id: p.category_id
          });
        }
      });
      setSubcategories(Array.from(subcategoryMap.values()));
    } catch (error: any) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedQuotes() {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSavedQuotes(data || []);
    } catch (error: any) {
      console.error('Error al cargar cotizaciones guardadas:', error);
    }
  }

  async function saveQuote() {
    if (!supabase || !customerName || !customerPhone) {
      alert('Por favor completa nombre y teléfono');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_city: customerCity,
          items: quoteItems,
          subtotal,
          shipping_cost: shippingCost,
          total,
          weight: totalWeight
        });

      if (error) throw error;
      alert('✅ Cotización guardada correctamente');
      fetchSavedQuotes();
      setQuoteItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerCity('');
    } catch (error: any) {
      console.error('Error al guardar cotización:', error);
      alert('❌ Error al guardar: ' + (error.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  }

  function loadQuote(quote: SavedQuote) {
    setCustomerName(quote.customer_name);
    setCustomerPhone(quote.customer_phone);
    setCustomerCity(quote.customer_city || '');
    setQuoteItems(quote.items);
    setShippingCost(quote.shipping_cost);
    setTempShippingCost(quote.shipping_cost.toString());
    setTab('new');
  }

  function estimateWeightByCategory(productName: string, subcategory: string, category: string): number {
    const name = productName.toLowerCase();
    const subcat = subcategory.toLowerCase();
    const cat = category.toLowerCase();
    
    if (cat.includes('cuaderno')) {
      if (subcat.includes('argollado') && subcat.includes('105')) return 320;
      if (subcat.includes('argollado') && subcat.includes('85')) return 250;
      if (subcat.includes('cinco') && subcat.includes('105')) return 380;
      if (subcat.includes('cinco') && subcat.includes('85')) return 300;
      if (subcat.includes('siete') && subcat.includes('105')) return 480;
      if (subcat.includes('siete') && subcat.includes('85')) return 400;
      if (subcat.includes('cosido') && subcat.includes('100')) return 220;
      if (subcat.includes('cosido') && subcat.includes('50')) return 120;
      return 200;
    }
    
    if (cat.includes('escritura')) {
      if (subcat.includes('esfero')) return 12;
      if (subcat.includes('lapiz')) return 8;
      if (subcat.includes('marcador')) return 18;
      if (subcat.includes('resaltador')) return 15;
      return 12;
    }
    
    if (cat.includes('colores') || cat.includes('arte')) {
      if (name.includes('12 colores') || name.includes('x12')) return 150;
      if (name.includes('24 colores') || name.includes('x24')) return 280;
      if (name.includes('36 colores') || name.includes('x36')) return 400;
      if (subcat.includes('crayones')) return 120;
      if (subcat.includes('plastilina')) return 250;
      return 150;
    }
    
    if (cat.includes('correccion') || cat.includes('corrección')) {
      if (subcat.includes('borrador')) return 15;
      return 20;
    }
    
    if (cat.includes('corte') || cat.includes('pegado')) {
      if (subcat.includes('tijera')) return 45;
      if (subcat.includes('pegante')) return 80;
      return 50;
    }
    
    if (cat.includes('geometria') || cat.includes('geometría')) return 45;
    if (cat.includes('papeleria')) {
      if (name.includes('resma')) return 2400;
      return 100;
    }
    
    return 80;
  }

  const subcategoriesInCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategories.filter(s => s.category_id === selectedCategory).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCategory, subcategories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubcategory = !selectedSubcategory || p.subcategory_id === selectedSubcategory;
      return matchesSearch && matchesSubcategory;
    });
  }, [products, searchTerm, selectedSubcategory]);

  const addToQuote = useCallback((product: Product) => {
    setQuoteItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setQuoteItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  }, []);

  const removeFromQuote = useCallback((productId: string) => {
    setQuoteItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  async function getImageBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  async function generatePDFQuote() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const provider = SHIPPING_PROVIDERS.find(p => p.id === shippingProvider);
    
    let yPosition = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    try {
      const logoBase64 = await getImageBase64('/images/AVALOGO/ccs724_logo_transparent.png');
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, yPosition, 45, 22);
      }
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('COTIZACIÓN', pageWidth - margin, yPosition + 8, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`N° ${Date.now().toString().slice(-8)}`, pageWidth - margin, yPosition + 14, { align: 'right' });
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, pageWidth - margin, yPosition + 20, { align: 'right' });
    
    yPosition += 32;

    doc.setDrawColor(255, 200, 0);
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('DATOS DEL CLIENTE', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Cliente: ${customerName}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Teléfono: ${customerPhone}`, margin, yPosition);
    yPosition += 5;
    if (customerCity) {
      doc.text(`Ciudad: ${customerCity}`, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 5;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCTOS', margin, yPosition);
    yPosition += 8;

    for (const item of quoteItems) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      if (item.product.image) {
        try {
          const imgBase64 = await getImageBase64(item.product.image);
          if (imgBase64) {
            doc.addImage(imgBase64, 'JPEG', margin, yPosition, 18, 18);
          }
        } catch {
          // continuar sin imagen
        }
      }
      
      const textX = margin + 22;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      
      const productName = item.product.name.length > 40 
        ? item.product.name.substring(0, 40) + '...' 
        : item.product.name;
      doc.text(productName, textX, yPosition + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${item.quantity} x $${item.product.price.toLocaleString('es-CO')}`, textX, yPosition + 11);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      const itemTotal = `$${(item.quantity * item.product.price).toLocaleString('es-CO')}`;
      doc.text(itemTotal, pageWidth - margin, yPosition + 8, { align: 'right' });
      
      yPosition += 22;
    }

    yPosition += 3;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    doc.text('Subtotal:', margin, yPosition);
    doc.text(`$${subtotal.toLocaleString('es-CO')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;

    doc.text('Peso aproximado:', margin, yPosition);
    doc.text(`${(totalWeight / 1000).toFixed(2)} kg`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;

    doc.text(`Transportadora:`, margin, yPosition);
    doc.text(`${provider?.name || 'N/A'}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;

    doc.text('Flete:', margin, yPosition);
    doc.text(`$${shippingCost.toLocaleString('es-CO')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 10;

    doc.setFillColor(255, 200, 0);
    doc.roundedRect(margin, yPosition - 2, contentWidth, 14, 2, 2, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL:', margin + 5, yPosition + 7);
    doc.text(`$${total.toLocaleString('es-CO')}`, pageWidth - margin - 5, yPosition + 7, { align: 'right' });

    yPosition = pageHeight - 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('CCS724 - Tienda de Papelería', pageWidth / 2, yPosition, { align: 'center' });

    const fileName = `Cotizacion_${customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  async function sendWhatsApp() {
    const provider = SHIPPING_PROVIDERS.find(p => p.id === shippingProvider);
    
    let text = `*🛒 COTIZACIÓN CCS724*\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `👤 *Cliente:* ${customerName}\n`;
    text += `📱 *Tel:* ${customerPhone}\n`;
    if (customerCity) text += `📍 *Ciudad:* ${customerCity}\n`;
    text += `📅 *Fecha:* ${new Date().toLocaleDateString('es-CO')}\n\n`;
    
    text += `*📦 PRODUCTOS*\n\n`;
    
    quoteItems.forEach((item, index) => {
      text += `${index + 1}. ${item.product.name}\n`;
      text += `   ${item.quantity} x $${item.product.price.toLocaleString('es-CO')} = *$${(item.quantity * item.product.price).toLocaleString('es-CO')}*\n\n`;
    });
    
    text += `━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 *Subtotal:* $${subtotal.toLocaleString('es-CO')}\n`;
    text += `⚖️ *Peso:* ${(totalWeight / 1000).toFixed(2)} kg\n`;
    text += `🚚 *Transportadora:* ${provider?.name || 'N/A'}\n`;
    text += `📦 *Flete:* $${shippingCost.toLocaleString('es-CO')}\n\n`;
    text += `💰 *TOTAL: $${total.toLocaleString('es-CO')}*\n\n`;
    text += `_¿Le interesa esta cotización?_`;
    
    const encodedText = encodeURIComponent(text);
    const phone = customerPhone.replace(/\D/g, '');
    const url = `https://wa.me/57${phone}?text=${encodedText}`;
    window.open(url, '_blank');
  }

  async function handleSignOut() {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    router.push('/');
  }

  const handleShippingConfirm = () => {
    setShippingCost(Math.max(0, Number(tempShippingCost) || 0));
    setEditingShipping(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      {/* Modal de Zoom */}
      <Dialog open={!!zoomProduct} onOpenChange={() => setZoomProduct(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-sm line-clamp-2 pr-6">{zoomProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            {zoomProduct?.image && (
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-muted rounded-lg overflow-hidden">
                <Image src={zoomProduct.image} alt={zoomProduct.name} fill className="object-contain" sizes="224px" />
              </div>
            )}
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-primary">${zoomProduct?.price.toLocaleString('es-CO')}</p>
              <p className="text-xs text-muted-foreground">
                {zoomProduct?.category_name} / {zoomProduct?.subcategory_name}
              </p>
              {zoomProduct && getProductQuantity(zoomProduct.id) > 0 && (
                <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                  <Check className="h-3 w-3" />
                  {getProductQuantity(zoomProduct.id)} en carrito
                </p>
              )}
            </div>
            <Button onClick={() => { if (zoomProduct) addToQuote(zoomProduct); setZoomProduct(null); }} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Agregar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-30 shadow-sm">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/images/AVALOGO/ccs724_logo_transparent.png" alt="CCS724" fill className="object-contain" sizes="32px" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Cotizaciones</h1>
              <p className="text-[10px] text-muted-foreground">{totalItems} items • {(totalWeight / 1000).toFixed(2)} kg</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 py-1.5 border-t bg-muted/30">
          <Button variant={tab === 'new' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('new')} className="flex-1 h-8 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Nueva
          </Button>
          <Button variant={tab === 'history' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('history')} className="flex-1 h-8 text-xs">
            <History className="h-3 w-3 mr-1" /> Historial ({savedQuotes.length})
          </Button>
        </div>
      </header>

      {/* Tab: Nueva Cotización */}
      {tab === 'new' && (
        <div className="lg:grid lg:grid-cols-5 lg:gap-4 lg:p-4">
          {/* Catálogo */}
          <div className="lg:col-span-3 p-3 lg:p-0">
            <Card>
              <CardHeader className="pb-2 px-3">
                <CardTitle className="text-sm">Catálogo</CardTitle>
              </CardHeader>
              <CardContent className="px-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-8 h-9 text-sm" 
                  />
                </div>

                {/* Categorías */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Categorías</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 lg:flex-wrap lg:overflow-visible scrollbar-hide">
                    {categories.map(category => {
                      const count = selectedByCategory[category.id] || 0;
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            if (selectedCategory === category.id) {
                              setSelectedCategory(null);
                              setSelectedSubcategory(null);
                            } else {
                              setSelectedCategory(category.id);
                              setSelectedSubcategory(null);
                            }
                          }}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 ${
                            selectedCategory === category.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {category.name}
                          {count > 0 && (
                            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full ${
                              selectedCategory === category.id 
                                ? 'bg-white text-primary' 
                                : 'bg-green-500 text-white'
                            }`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subcategorías */}
                {selectedCategory && subcategoriesInCategory.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Subcategorías</p>
                    <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-3 px-3 lg:flex-wrap scrollbar-hide">
                      {subcategoriesInCategory.map(subcat => {
                        const count = selectedBySubcategory[subcat.id] || 0;
                        return (
                          <button
                            key={subcat.id}
                            onClick={() => setSelectedSubcategory(selectedSubcategory === subcat.id ? null : subcat.id)}
                            className={`flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap flex items-center gap-1 active:scale-95 ${
                              selectedSubcategory === subcat.id
                                ? 'bg-primary/80 text-primary-foreground'
                                : 'bg-muted/60 hover:bg-muted'
                            }`}
                          >
                            {subcat.name}
                            {count > 0 && (
                              <span className={`inline-flex items-center justify-center min-w-[16px] h-[16px] text-[9px] font-bold rounded-full ${
                                selectedSubcategory === subcat.id 
                                  ? 'bg-white text-primary' 
                                  : 'bg-green-500 text-white'
                              }`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Productos Grid */}
                {selectedSubcategory && filteredProducts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Productos ({filteredProducts.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-1">
                      {filteredProducts.map(product => {
                        const inCart = cartProductIds.has(product.id);
                        const quantity = getProductQuantity(product.id);
                        return (
                          <div 
                            key={product.id} 
                            className={`border rounded-lg p-2 bg-card group hover:shadow-md transition-all relative ${
                              inCart ? 'ring-2 ring-green-500 ring-offset-1' : ''
                            }`}
                          >
                            {inCart && (
                              <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-md">
                                {quantity}
                              </div>
                            )}
                            
                            <div className="relative aspect-square mb-2 bg-muted rounded overflow-hidden">
                              {product.image ? (
                                <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="150px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              
                              {inCart && (
                                <div className="absolute top-1 left-1 bg-green-500 text-white p-0.5 rounded-full">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                              
                              <button
                                onClick={() => setZoomProduct(product)}
                                className="absolute top-1 right-1 p-1.5 bg-black/50 rounded-full text-white lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                              >
                                <ZoomIn className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-[10px] font-medium line-clamp-2 min-h-[2rem] leading-tight">{product.name}</p>
                            <p className="text-xs font-bold text-primary">${product.price.toLocaleString('es-CO')}</p>
                            
                            {inCart ? (
                              <div className="flex items-center justify-between mt-1.5 bg-muted rounded-md p-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => updateQuantity(product.id, -1)} 
                                  className="h-7 w-7 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-xs font-bold">{quantity}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => updateQuantity(product.id, 1)} 
                                  className="h-7 w-7 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" onClick={() => addToQuote(product)} className="w-full mt-1.5 h-8 text-[10px]">
                                <Plus className="h-3 w-3 mr-0.5" /> Agregar
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Carrito - Desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <Card className="sticky top-28">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cotización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CustomerForm
                  customerName={customerName}
                  customerPhone={customerPhone}
                  customerCity={customerCity}
                  onNameChange={setCustomerName}
                  onPhoneChange={setCustomerPhone}
                  onCityChange={setCustomerCity}
                />

                <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                  {quoteItems.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Carrito vacío</p>
                    </div>
                  ) : (
                    quoteItems.map(item => (
                      <CartItem 
                        key={item.product.id} 
                        item={item} 
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromQuote}
                      />
                    ))
                  )}
                </div>

                {quoteItems.length > 0 && (
                  <div className="space-y-3 border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">${subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peso:</span>
                      <span>{(totalWeight / 1000).toFixed(2)} kg</span>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Transportadora:</label>
                      <Select value={shippingProvider} onValueChange={setShippingProvider}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SHIPPING_PROVIDERS.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.logo} {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Flete:</span>
                      {editingShipping ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">$</span>
                          <Input
                            type="number"
                            value={tempShippingCost}
                            onChange={(e) => setTempShippingCost(e.target.value)}
                            className="h-7 w-24 text-xs"
                            autoFocus
                          />
                          <Button size="sm" onClick={handleShippingConfirm} className="h-7 px-2 text-xs">OK</Button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setTempShippingCost(shippingCost.toString()); setEditingShipping(true); }} 
                          className="flex items-center gap-1 font-semibold text-sm hover:text-primary transition-colors"
                        >
                          ${shippingCost.toLocaleString('es-CO')} <Edit2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-base font-bold bg-primary/10 p-2 rounded-lg">
                      <span>TOTAL:</span>
                      <span className="text-primary">${total.toLocaleString('es-CO')}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={generatePDFQuote} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
                      <Button onClick={sendWhatsApp} disabled={!customerPhone} size="sm" className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50">
                        <Send className="h-4 w-4 mr-1" /> WhatsApp
                      </Button>
                      <Button 
                        onClick={saveQuote} 
                        disabled={saving || quoteItems.length === 0} 
                        size="sm" 
                        variant="outline" 
                        className="col-span-2"
                      >
                        {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Package className="h-4 w-4 mr-1" />}
                        {saving ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Historial */}
      {tab === 'history' && (
        <div className="p-3 max-w-2xl mx-auto">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cotizaciones Guardadas</CardTitle>
            </CardHeader>
            <CardContent>
              {savedQuotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay cotizaciones</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedQuotes.map(quote => (
                    <div key={quote.id} className="border rounded-lg p-3 hover:shadow-md transition-all active:scale-[0.99]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">{quote.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{quote.customer_phone}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(quote.created_at).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${quote.total.toLocaleString('es-CO')}</p>
                          <p className="text-[10px] text-muted-foreground">{quote.items.length} items</p>
                        </div>
                      </div>
                      <Button onClick={() => loadQuote(quote)} size="sm" className="w-full h-8 text-xs">
                        Cargar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Cart Button - Mobile */}
      {tab === 'new' && (
        <div className="lg:hidden fixed bottom-4 right-4 z-40">
          <Sheet open={showCart} onOpenChange={setShowCart}>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full h-14 w-14 shadow-lg relative">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
              <SheetHeader className="pb-2">
                <SheetTitle className="flex items-center justify-between">
                  <span>Cotización ({totalItems})</span>
                  <span className="text-primary font-bold">${total.toLocaleString('es-CO')}</span>
                </SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto h-[calc(90vh-80px)] pb-8 space-y-4">
                <CustomerForm
                  customerName={customerName}
                  customerPhone={customerPhone}
                  customerCity={customerCity}
                  onNameChange={setCustomerName}
                  onPhoneChange={setCustomerPhone}
                  onCityChange={setCustomerCity}
                />

                <div className="space-y-2">
                  {quoteItems.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Carrito vacío</p>
                    </div>
                  ) : (
                    quoteItems.map(item => (
                      <CartItem 
                        key={item.product.id} 
                        item={item} 
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromQuote}
                      />
                    ))
                  )}
                </div>

                {quoteItems.length > 0 && (
                  <div className="space-y-3 border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">${subtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peso:</span>
                      <span>{(totalWeight / 1000).toFixed(2)} kg</span>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Transportadora:</label>
                      <Select value={shippingProvider} onValueChange={setShippingProvider}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SHIPPING_PROVIDERS.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.logo} {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Flete:</span>
                      {editingShipping ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">$</span>
                          <Input
                            type="number"
                            value={tempShippingCost}
                            onChange={(e) => setTempShippingCost(e.target.value)}
                            className="h-8 w-24 text-sm"
                          />
                          <Button size="sm" onClick={handleShippingConfirm} className="h-8 px-3">OK</Button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setTempShippingCost(shippingCost.toString()); setEditingShipping(true); }} 
                          className="flex items-center gap-1 font-semibold text-sm hover:text-primary transition-colors py-1"
                        >
                          ${shippingCost.toLocaleString('es-CO')} <Edit2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-lg font-bold bg-primary/10 p-3 rounded-lg">
                      <span>TOTAL:</span>
                      <span className="text-primary">${total.toLocaleString('es-CO')}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button onClick={generatePDFQuote} className="bg-red-600 hover:bg-red-700 text-white h-11">
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
                      <Button onClick={sendWhatsApp} disabled={!customerPhone} className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 h-11">
                        <Send className="h-4 w-4 mr-1" /> WhatsApp
                      </Button>
                      <Button 
                        onClick={saveQuote} 
                        disabled={saving || quoteItems.length === 0} 
                        variant="outline" 
                        className="col-span-2 h-11"
                      >
                        {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Package className="h-4 w-4 mr-1" />}
                        {saving ? 'Guardando...' : 'Guardar Cotización'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}