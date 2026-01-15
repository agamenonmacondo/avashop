'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  LogOut,
  Package,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  X,
  Maximize2
} from 'lucide-react';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase');
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const AUTHORIZED_ADMIN_EMAILS = [
  'agamenonmacondo@gmail.com',
  'elkinleon87@gmail.com',
];

function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase());
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  subcategory_id: string;
  image: string;
  cost?: number;
  isEditing?: boolean;
  newPrice?: number;
  newCost?: number;
  newName?: string;
}

interface GroupedProducts {
  [categoryId: string]: {
    category: Category;
    subcategories: {
      [subcategoryId: string]: {
        subcategory: Subcategory;
        products: Product[];
      };
    };
  };
}

function calculateProfit(price: number, cost?: number): { absolute: number; relative: number } {
  if (!cost || cost === 0) {
    return { absolute: 0, relative: 0 };
  }
  const absolute = price - cost;
  const relative = ((price - cost) / cost) * 100;
  return { absolute, relative };
}

// Modal de zoom
function ImageZoomModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  productName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageUrl: string; 
  productName: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full p-2 sm:max-w-3xl sm:p-6">
        <DialogHeader className="p-2 pb-1 sm:p-4 sm:pb-2">
          <DialogTitle className="text-sm sm:text-lg">{productName}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-square bg-muted/30 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png';
              e.currentTarget.onerror = null;
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Tarjeta de producto optimizada para móvil
function ProductCard({ 
  product, 
  isEditing, 
  savingId, 
  onEdit, 
  onCancel, 
  onSave, 
  onPriceChange,
  onCostChange,
  onNameChange 
}: {
  product: Product;
  isEditing: boolean;
  savingId: string | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onPriceChange: (value: string) => void;
  onCostChange: (value: string) => void;
  onNameChange: (value: string) => void;
}) {
  const [showImageZoom, setShowImageZoom] = useState(false);
  
  const { absolute, relative } = calculateProfit(
    isEditing ? (product.newPrice ?? product.price) : product.price,
    isEditing ? (product.newCost ?? product.cost) : product.cost
  );
  const isPositive = absolute > 0;

  return (
    <>
      <div className="border rounded-md p-2 bg-card">
        {/* Sección superior: Imagen + Info básica */}
        <div className="flex gap-2">
          {/* Imagen compacta */}
          <div className="flex-shrink-0 relative group">
            {product.image ? (
              <>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md shadow-sm cursor-pointer transition-transform active:scale-95"
                  onClick={() => setShowImageZoom(true)}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                    e.currentTarget.onerror = null;
                  }}
                />
                <button
                  onClick={() => setShowImageZoom(true)}
                  className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition-opacity"
                  aria-label="Ampliar imagen"
                >
                  <Maximize2 className="h-2.5 w-2.5" />
                </button>
              </>
            ) : (
              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info principal */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                type="text"
                value={product.newName ?? product.name}
                onChange={(e) => onNameChange(e.target.value)}
                className="h-7 text-[11px] font-semibold px-2 mb-1"
                placeholder="Nombre del producto"
              />
            ) : (
              <h4 className="font-semibold text-[11px] leading-tight line-clamp-2 mb-0.5">{product.name}</h4>
            )}
            <p className="text-[9px] text-muted-foreground truncate">{product.id}</p>
            
            {/* Grid de precios cuando NO está editando */}
            {!isEditing && (
              <div className="mt-1 grid grid-cols-3 gap-1 text-[9px]">
                <div>
                  <span className="text-muted-foreground block">Costo</span>
                  <p className="font-semibold text-[10px]">
                    ${product.cost?.toLocaleString('es-CO', { maximumFractionDigits: 0 }) ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Precio</span>
                  <p className="font-bold text-primary text-[11px]">
                    ${product.price.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Utilidad</span>
                  {product.cost && product.cost > 0 ? (
                    <div className="flex flex-col items-start">
                      <span className={`font-bold text-[10px] ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        ${absolute.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </span>
                      <span className={`text-[8px] ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{relative.toFixed(0)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[9px]">N/A</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de edición */}
        {isEditing && (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="text-[9px] text-muted-foreground w-10 flex-shrink-0">Costo:</label>
              <Input
                type="number"
                value={product.newCost ?? product.cost ?? ''}
                onChange={(e) => onCostChange(e.target.value)}
                className="h-7 text-[11px] font-medium px-2"
                min="0"
                step="100"
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[9px] text-muted-foreground w-10 flex-shrink-0">Precio:</label>
              <Input
                type="number"
                value={product.newPrice ?? product.price}
                onChange={(e) => onPriceChange(e.target.value)}
                className="h-7 text-[11px] font-medium px-2"
                min="0"
                step="100"
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="text-muted-foreground w-10 flex-shrink-0">Utilidad:</span>
              <span className={`font-bold text-[10px] ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                ${absolute.toLocaleString('es-CO', { maximumFractionDigits: 0 })} ({relative.toFixed(0)}%)
              </span>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="mt-2 flex gap-1.5">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={onSave}
                disabled={savingId === product.id}
                className="flex-1 h-8 text-[10px] font-semibold bg-green-600 hover:bg-green-700 px-2"
              >
                {savingId === product.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Guardar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                disabled={savingId === product.id}
                className="h-8 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={onEdit}
              className="w-full h-8 text-[10px] font-semibold"
            >
              ✏️ Editar
            </Button>
          )}
        </div>
      </div>

      <ImageZoomModal
        isOpen={showImageZoom}
        onClose={() => setShowImageZoom(false)}
        imageUrl={product.image}
        productName={product.newName ?? product.name}
      />
    </>
  );
}

export default function AdminProductosPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

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
      router.push('/login?redirect=/admin/productos');
      return;
    }

    if (!authLoading && user && !isAuthorizedAdmin(user.email)) {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && isAuthorizedAdmin(user.email)) {
      fetchAllData();
    }
  }, [user]);

  async function fetchAllData() {
    if (!supabase) {
      setMessage({ type: 'error', text: 'Error de configuración: Faltan credenciales de Supabase' });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      
      const [categoriesRes, subcategoriesRes, productsRes] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('subcategories').select('id, name, category_id').order('name'),
        supabase.from('products').select('id, name, price, subcategory_id, image, cost').order('name')
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;
      if (productsRes.error) throw productsRes.error;
      
      setCategories(categoriesRes.data || []);
      setSubcategories(subcategoriesRes.data || []);
      setProducts(productsRes.data || []);

      const allCategoryIds = new Set((categoriesRes.data || []).map(c => c.id));
      setExpandedCategories(allCategoryIds);
      
    } catch (error: any) {
      console.error('Error completo:', error);
      setMessage({ type: 'error', text: error?.message || 'Error desconocido al cargar datos' });
    } finally {
      setLoading(false);
    }
  }

  const groupedProducts = useMemo(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subcategory_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped: GroupedProducts = {};

    filtered.forEach(product => {
      const subcategory = subcategories.find(s => s.id === product.subcategory_id);
      const categoryId = subcategory?.category_id || 'sin-categoria';
      const category = categories.find(c => c.id === categoryId) || { id: categoryId, name: 'Sin Categoría' };

      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          category,
          subcategories: {}
        };
      }

      const subcategoryId = product.subcategory_id || 'sin-subcategoria';
      if (!grouped[categoryId].subcategories[subcategoryId]) {
        grouped[categoryId].subcategories[subcategoryId] = {
          subcategory: subcategory || { id: subcategoryId, name: 'Sin Subcategoría', category_id: categoryId },
          products: []
        };
      }

      grouped[categoryId].subcategories[subcategoryId].products.push(product);
    });

    return grouped;
  }, [products, categories, subcategories, searchTerm]);

  function toggleCategory(categoryId: string) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function toggleSubcategory(subcategoryId: string) {
    setExpandedSubcategories(prev => {
      const next = new Set(prev);
      if (next.has(subcategoryId)) {
        next.delete(subcategoryId);
      } else {
        next.add(subcategoryId);
      }
      return next;
    });
  }

  async function handleSignOut() {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
    router.push('/');
  }

  function handleEdit(productId: string) {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { 
          ...p, 
          isEditing: true, 
          newPrice: p.price,
          newCost: p.cost,
          newName: p.name 
        };
      }
      return p;
    }));
  }

  function handleCancel(productId: string) {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { 
          ...p, 
          isEditing: false, 
          newPrice: undefined,
          newCost: undefined,
          newName: undefined 
        };
      }
      return p;
    }));
  }

  async function handleSave(productId: string) {
    if (!supabase) {
      setMessage({ type: 'error', text: 'Error de configuración de Supabase' });
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      setMessage({ type: 'error', text: 'Error: No se encontró el producto' });
      return;
    }

    try {
      setSavingId(productId);
      
      const updateData: { price?: number; cost?: number; name?: string } = {};
      
      if (product.newPrice !== undefined) {
        updateData.price = product.newPrice;
      }
      
      if (product.newCost !== undefined) {
        updateData.cost = product.newCost;
      }

      if (product.newName !== undefined && product.newName.trim() !== '') {
        updateData.name = product.newName.trim();
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'error', text: 'No hay cambios para guardar' });
        setSavingId(null);
        return;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(error.message || 'Error al actualizar');
      }

      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return { 
            ...p, 
            name: product.newName?.trim() ?? p.name,
            price: product.newPrice ?? p.price,
            cost: product.newCost ?? p.cost,
            isEditing: false, 
            newPrice: undefined,
            newCost: undefined,
            newName: undefined
          };
        }
        return p;
      }));

      setMessage({ 
        type: 'success', 
        text: `✅ "${product.newName ?? product.name}" actualizado` 
      });
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Error al guardar:', error);
      setMessage({ 
        type: 'error', 
        text: error?.message || 'Error al guardar. Verifica permisos en Supabase.' 
      });
    } finally {
      setSavingId(null);
    }
  }

  function handlePriceChange(productId: string, value: string) {
    const numValue = parseFloat(value) || 0;
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, newPrice: numValue };
      }
      return p;
    }));
  }

  function handleCostChange(productId: string, value: string) {
    const numValue = parseFloat(value) || 0;
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, newCost: numValue };
      }
      return p;
    }));
  }

  function handleNameChange(productId: string, value: string) {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, newName: value };
      }
      return p;
    }));
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAuthorizedAdmin(user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header ultra compacto */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Package className="h-4 w-4 text-primary" />
            <div>
              <h1 className="text-[11px] font-bold">Admin Productos</h1>
              <p className="text-[9px] text-muted-foreground">{totalProducts} items</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-7 w-7 p-0">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-2 pb-16">
        {/* Message */}
        {message && (
          <div className={`mb-2 p-2 rounded-md flex items-center gap-1.5 text-[10px] ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-3 w-3 flex-shrink-0" /> : <AlertCircle className="h-3 w-3 flex-shrink-0" />}
            <span className="flex-1 leading-tight">{message.text}</span>
          </div>
        )}

        {/* Búsqueda */}
        <div className="flex gap-1.5 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 text-[11px]"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchAllData} className="h-8 w-8">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-[10px] text-muted-foreground">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {Object.entries(groupedProducts).length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-[10px] text-muted-foreground">No se encontraron productos</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedProducts).map(([categoryId, categoryData]) => (
                <Card key={categoryId} className="overflow-hidden">
                  <Collapsible 
                    open={expandedCategories.has(categoryId)}
                    onOpenChange={() => toggleCategory(categoryId)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer py-1.5 px-2 hover:bg-muted/50">
                        <div className="flex items-center gap-1.5">
                          {expandedCategories.has(categoryId) ? (
                            <ChevronDown className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 flex-shrink-0" />
                          )}
                          <CardTitle className="text-[11px] flex-1 leading-tight">{categoryData.category.name}</CardTitle>
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                            {Object.values(categoryData.subcategories).reduce((sum, s) => sum + s.products.length, 0)}
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0 px-1.5 pb-1.5">
                        <div className="space-y-1">
                          {Object.entries(categoryData.subcategories).map(([subcategoryId, subcategoryData]) => (
                            <Collapsible 
                              key={subcategoryId}
                              open={expandedSubcategories.has(subcategoryId)}
                              onOpenChange={() => toggleSubcategory(subcategoryId)}
                            >
                              <div className="border rounded-md overflow-hidden">
                                <CollapsibleTrigger asChild>
                                  <div className="p-1.5 cursor-pointer hover:bg-muted/30 flex items-center gap-1.5">
                                    {expandedSubcategories.has(subcategoryId) ? (
                                      <ChevronDown className="h-2.5 w-2.5 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="h-2.5 w-2.5 flex-shrink-0" />
                                    )}
                                    <span className="text-[10px] font-medium flex-1 leading-tight">{subcategoryData.subcategory.name}</span>
                                    <Badge variant="outline" className="text-[8px] h-3.5 px-1">
                                      {subcategoryData.products.length}
                                    </Badge>
                                  </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <div className="border-t p-1 space-y-1 bg-muted/20">
                                    {subcategoryData.products.map((product) => (
                                      <ProductCard
                                        key={product.id}
                                        product={product}
                                        isEditing={product.isEditing ?? false}
                                        savingId={savingId}
                                        onEdit={() => handleEdit(product.id)}
                                        onCancel={() => handleCancel(product.id)}
                                        onSave={() => handleSave(product.id)}
                                        onPriceChange={(value) => handlePriceChange(product.id, value)}
                                        onCostChange={(value) => handleCostChange(product.id, value)}
                                        onNameChange={(value) => handleNameChange(product.id, value)}
                                      />
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}