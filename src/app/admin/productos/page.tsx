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
  ZoomIn,
  Maximize2
} from 'lucide-react';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase con validación
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase');
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Lista de correos autorizados
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

// Función para calcular utilidad de un producto
function calculateProfit(price: number, cost?: number): { absolute: number; relative: number } {
  if (!cost || cost === 0) {
    return { absolute: 0, relative: 0 };
  }
  const absolute = price - cost;
  const relative = ((price - cost) / cost) * 100;
  return { absolute, relative };
}

// Componente para mostrar la utilidad con colores
function ProfitBadge({ price, cost }: { price: number; cost?: number }) {
  const { absolute, relative } = calculateProfit(price, cost);
  
  if (!cost || cost === 0) {
    return <span className="text-muted-foreground text-xs">N/A</span>;
  }

  const isPositive = absolute > 0;

  return (
    <div className="flex flex-col items-start">
      <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        ${absolute.toLocaleString('es-CO')}
      </span>
      <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{relative.toFixed(1)}%
      </span>
    </div>
  );
}

// Modal de zoom para imagen
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
      <DialogContent className="max-w-3xl w-full p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-lg">{productName}</DialogTitle>
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

// Componente de tarjeta de producto para móvil
function ProductCard({ 
  product, 
  isEditing, 
  savingId, 
  onEdit, 
  onCancel, 
  onSave, 
  onPriceChange,
  onCostChange 
}: {
  product: Product;
  isEditing: boolean;
  savingId: string | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onPriceChange: (value: string) => void;
  onCostChange: (value: string) => void;
}) {
  const [showImageZoom, setShowImageZoom] = useState(false);
  
  const { absolute, relative } = calculateProfit(
    isEditing ? (product.newPrice ?? product.price) : product.price,
    isEditing ? (product.newCost ?? product.cost) : product.cost
  );
  const isPositive = absolute > 0;

  return (
    <>
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex gap-4">
          {/* Imagen con botón de zoom */}
          <div className="flex-shrink-0 relative group">
            {product.image ? (
              <>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setShowImageZoom(true)}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                    e.currentTarget.onerror = null;
                  }}
                />
                {/* Botón de zoom superpuesto */}
                <button
                  onClick={() => setShowImageZoom(true)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Ver imagen ampliada"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-muted rounded-xl flex items-center justify-center shadow-md">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base leading-tight line-clamp-2">{product.name}</h4>
            <p className="text-xs text-muted-foreground mt-1 truncate">{product.id}</p>
            
            {isEditing ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground w-14">Costo:</label>
                  <Input
                    type="number"
                    value={product.newCost ?? product.cost ?? ''}
                    onChange={(e) => onCostChange(e.target.value)}
                    className="h-10 text-base font-medium"
                    min="0"
                    step="100"
                    placeholder="Costo"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground w-14">Precio:</label>
                  <Input
                    type="number"
                    value={product.newPrice ?? product.price}
                    onChange={(e) => onPriceChange(e.target.value)}
                    className="h-10 text-base font-medium"
                    min="0"
                    step="100"
                    placeholder="Precio"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-14">Utilidad:</span>
                  <span className={`font-bold text-base ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    ${absolute.toLocaleString('es-CO')} ({relative.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Costo</span>
                  <p className="font-semibold">${product.cost?.toLocaleString('es-CO') ?? 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Precio</span>
                  <p className="font-bold text-primary text-lg">${product.price.toLocaleString('es-CO')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Utilidad</span>
                  <ProfitBadge price={product.price} cost={product.cost} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-4 flex gap-3">
          {isEditing ? (
            <>
              <Button
                size="lg"
                onClick={onSave}
                disabled={savingId === product.id}
                className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
              >
                {savingId === product.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onCancel}
                disabled={savingId === product.id}
                className="h-12 px-4"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              variant="default"
              onClick={onEdit}
              className="w-full h-12 text-base font-semibold"
            >
              ✏️ Editar Precio / Costo
            </Button>
          )}
        </div>
      </div>

      {/* Modal de zoom */}
      <ImageZoomModal
        isOpen={showImageZoom}
        onClose={() => setShowImageZoom(false)}
        imageUrl={product.image}
        productName={product.name}
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

  // Escuchar estado de autenticación de Firebase
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

  // Verificar autorización
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

  // Cargar datos
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

  // Filtrar y agrupar productos
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
          newCost: p.cost 
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
          newCost: undefined 
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
      
      const updateData: { price?: number; cost?: number } = {};
      
      if (product.newPrice !== undefined) {
        updateData.price = product.newPrice;
      }
      
      if (product.newCost !== undefined) {
        updateData.cost = product.newCost;
      }

      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'error', text: 'No hay cambios para guardar' });
        setSavingId(null);
        return;
      }

      console.log('Actualizando producto:', productId, updateData);

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
            price: product.newPrice ?? p.price,
            cost: product.newCost ?? p.cost,
            isEditing: false, 
            newPrice: undefined,
            newCost: undefined
          };
        }
        return p;
      }));

      setMessage({ 
        type: 'success', 
        text: `✅ "${product.name}" actualizado` 
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

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No autorizado
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
      {/* Header compacto */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-base font-bold">Admin Productos</h1>
              <p className="text-xs text-muted-foreground">{totalProducts} productos</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-3 pb-20">
        {/* Message */}
        {message && (
          <div className={`mb-3 p-3 rounded-lg flex items-center gap-2 text-sm ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            <span className="flex-1">{message.text}</span>
            {message.type === 'error' && (
              <Button size="sm" variant="ghost" onClick={fetchAllData} className="h-6 px-2">
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Búsqueda */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchAllData} className="h-10 w-10">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedProducts).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No se encontraron productos</p>
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
                      <CardHeader className="cursor-pointer py-3 px-3 hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          {expandedCategories.has(categoryId) ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                          <CardTitle className="text-base flex-1">{categoryData.category.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {Object.values(categoryData.subcategories).reduce((sum, s) => sum + s.products.length, 0)}
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0 px-2 pb-2">
                        <div className="space-y-2">
                          {Object.entries(categoryData.subcategories).map(([subcategoryId, subcategoryData]) => (
                            <Collapsible 
                              key={subcategoryId}
                              open={expandedSubcategories.has(subcategoryId)}
                              onOpenChange={() => toggleSubcategory(subcategoryId)}
                            >
                              <div className="border rounded-lg overflow-hidden">
                                <CollapsibleTrigger asChild>
                                  <div className="p-2 cursor-pointer hover:bg-muted/30 flex items-center gap-2">
                                    {expandedSubcategories.has(subcategoryId) ? (
                                      <ChevronDown className="h-3 w-3 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                                    )}
                                    <span className="text-sm font-medium flex-1">{subcategoryData.subcategory.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {subcategoryData.products.length}
                                    </Badge>
                                  </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <div className="border-t p-2 space-y-2 bg-muted/20">
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