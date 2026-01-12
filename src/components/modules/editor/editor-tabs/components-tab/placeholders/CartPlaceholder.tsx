import { ShoppingCart } from "lucide-react";

const CartPlaceholder = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 rounded-md bg-muted/30 border-2 border-dashed">
      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">Cart</span>
    </div>
  );
};

export default CartPlaceholder;
