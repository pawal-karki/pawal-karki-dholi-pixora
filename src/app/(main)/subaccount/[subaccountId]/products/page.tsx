import { getProducts } from "@/lib/queries";
import { ProductClient } from "./_components/product-client";

interface PageProps {
    params: {
        subaccountId: string;
    };
}

const ProductsPage = async ({ params }: PageProps) => {
    const { subaccountId } = await params;
    const products = await getProducts(subaccountId);

    return (
        <div className="blur-page">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Products</h1>
            </div>
            <ProductClient data={products} subaccountId={subaccountId} />
        </div>
    );
};

export default ProductsPage;
