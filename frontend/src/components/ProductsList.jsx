import { useProductStore } from "../store/useProductStore";

export default function ProductsList() {
  const { products } = useProductStore();
  console.log(products);
  return (
    <div>
      {products.map((product) => (
        <div key={product.name}>{product.name}</div>
      ))}
    </div>
  );
}
