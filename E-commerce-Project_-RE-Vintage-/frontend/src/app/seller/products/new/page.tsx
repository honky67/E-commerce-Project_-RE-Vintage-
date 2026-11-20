import AddProductForm from "../../../../components/AddProductForm";
import PageShell from "../../../../components/PageShell";

export default function NewProductPage() {
  return (
    <PageShell title="Add product to store">
      <AddProductForm />
    </PageShell>
  );
}
