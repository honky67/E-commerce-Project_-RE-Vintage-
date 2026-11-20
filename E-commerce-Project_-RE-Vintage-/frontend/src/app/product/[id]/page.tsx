import { notFound } from "next/navigation";
import ProductView from "../../../components/ProductView";
import { getProduct, getShop } from "../../../lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  const vendor = product && (await getShop(product.vendorId));
  if (!product || !vendor) notFound();
  return <ProductView product={product} vendor={vendor} />;
}
