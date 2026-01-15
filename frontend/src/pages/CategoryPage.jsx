import { useEffect } from "react";
import { useProductStore } from "../store/useProductStore";

export default function CategoryPage() {
  const { fetchProductsByCategory, products } = useProductStore();
  useEffect(() => {
    fetchProductsByCategory("shoes");
  }, [fetchProductsByCategory]);
  console.log(products);
  return <div>CategoryPage</div>;
}
