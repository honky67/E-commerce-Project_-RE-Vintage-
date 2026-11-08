import { notFound } from "next/navigation";
import ProductView from "../../../components/ProductView";
import { getProduct, getVendor, products } from "../../../data/mockData";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id);
  const vendor = product && getVendor(product.vendorId);
  if (!product || !vendor) notFound();
  return <ProductView product={product} vendor={vendor} />;
}
