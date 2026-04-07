import { Suspense } from "react";
import OrderConfirmedClient from "./OrderConfirmedClient";

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0a0a0a", minHeight: "100vh" }} />}>
      <OrderConfirmedClient />
    </Suspense>
  );
}
