export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  images: string[];
  brand_id: string;
  category_id: string;
  is_active: boolean;
  is_on_sale: boolean;
  bienfaits?: string;
  utilisation?: string;
  ingredients?: string;
  brand?: Brand;
  category?: Category;
  variants?: Variant[];
}

export interface Variant {
  id: string;
  product_id: string;
  flavor: string;
  size: string;
  stock: number;
}

export interface Brand {
  id: string;
  name: string;
  logo_url: string;
  is_visible: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

export interface Order {
  id: string;
  full_name: string;
  phone: string;
  wilaya: string;
  address: string;
  total: number;
  delivery_fee: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
  variant?: Variant;
}

export interface CartItem {
  product: Product;
  variant: Variant;
  quantity: number;
}

export const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra",
  "Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret",
  "Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda","Skikda",
  "Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem",
  "M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arréridj",
  "Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela",
  "Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
  "Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal",
  "Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet",
  "El M'Ghair","El Meniaa"
];
