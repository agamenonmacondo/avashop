'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User as UserIcon, LogIn, UserPlus, ShoppingBag, LayoutDashboard, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'; 
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const AUTHORIZED_ADMIN_EMAILS = [
  'agamenonmacondo@gmail.com',
  'elkinleon87@gmail.com',
];

export default function UserNav() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // no auth available (build/SSR or env missing)
      setFirebaseUser(null);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user as FirebaseUser | null);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) return;
      await signOut(auth);
      toast({
        title: "Sesión Cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
      router.push('/login'); 
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (!firebaseUser) {
    return (
      <>
        <Button variant="ghost" asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-5 w-5" /> Iniciar Sesión
          </Link>
        </Button>
      </>
    );
  }

  const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Usuario";
  const fallbackName = displayName.substring(0, 2).toUpperCase();
  const isAdmin = firebaseUser.email && AUTHORIZED_ADMIN_EMAILS.includes(firebaseUser.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={firebaseUser.photoURL || undefined} alt={displayName} />
            <AvatarFallback>{fallbackName}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {firebaseUser.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {firebaseUser.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Panel de Control</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/orders">
               <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Pedidos</span>
            </Link>
          </DropdownMenuItem>
          {/* Mostrar Admin solo si el email es el del administrador */}
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/admin/productos">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Gestionar Precios</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/cotizaciones">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Cotizaciones Rápidas</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}> 
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
