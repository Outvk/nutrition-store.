import { Product } from "@/types";

export interface CartItem {
  product: Product;
  variant: any;
  quantity: number;
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("nutrition_cart");
  return stored ? JSON.parse(stored) : [];
}

export function saveCart(cart: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("nutrition_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));
  }
}

export function addToCart(product: Product, variant: any, quantity: number) {
  const cart = getCart();
  const existingId = cart.findIndex(i => i.product.id === product.id && (i.variant?.id === variant?.id || !variant));
  
  if (existingId >= 0) {
    cart[existingId].quantity += quantity;
  } else {
    cart.push({ product, variant, quantity });
  }
  
  saveCart(cart);
}

export function removeFromCart(index: number) {
  const cart = getCart();
  const newCart = cart.filter((_, i) => i !== index);
  saveCart(newCart);
}

export function updateQuantity(index: number, quantity: number) {
  const cart = getCart();
  if (index >= 0 && index < cart.length) {
    cart[index].quantity = quantity;
    saveCart(cart);
  }
}

export function clearCart() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("nutrition_cart");
    window.dispatchEvent(new Event("cart_updated"));
  }
}
