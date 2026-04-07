import { getBrands, getProducts } from "@/lib/supabase/queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandsClient from "./BrandsClient";

export const revalidate = 3600; // Cache for 1 hour

export default async function BrandsPage() {
  const brands = await getBrands();
  
  // Fetch up to 100 products to group by brand
  const { products: allProducts } = await getProducts(0, {}, 100);
  
  return (
    <>
      <header>
        <title>NOS MARQUES | NUTRI-STORE</title>
      </header>
      <Navbar />
      <main style={{ minHeight: "80vh", background: "#000", paddingTop: "120px", paddingBottom: "100px" }}>
        <BrandsClient brands={brands} initialProducts={allProducts} />
      </main>
      <Footer />
    </>
  );
}
