import { Package } from "lucide-react";

const ProductGridPlaceholder = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 rounded-md bg-muted/30 border-2 border-dashed">
      <div className="flex gap-1">
        <Package className="h-4 w-4 text-muted-foreground" />
        <Package className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="text-[10px] text-muted-foreground">Products</span>
    </div>
  );
};

export default ProductGridPlaceholder;
