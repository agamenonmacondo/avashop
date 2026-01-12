"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

interface OrdersListProps {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No tienes pedidos</h3>
        <p className="text-gray-500 mt-2">
          Cuando realices una compra, aparecerá aquí.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600"
        >
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.order_number}`}
          className="block bg-white rounded-xl border hover:border-amber-400 hover:shadow-md transition-all p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900">
                Pedido #{order.order_number}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                {statusLabels[order.status] || order.status}
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {order.order_items.slice(0, 4).map((item) => (
              <div key={item.id} className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                {item.products?.image ? (
                  <Image
                    src={item.products.image}
                    alt={item.products.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {order.order_items.length > 4 && (
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-500">+{order.order_items.length - 4}</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {order.order_items.length} {order.order_items.length === 1 ? "producto" : "productos"}
            </span>
            <span className="font-bold text-amber-600">
              ${order.total.toLocaleString("es-CO")} COP
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}