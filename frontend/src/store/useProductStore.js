import { create } from "zustand";
import axios from "../../lib/axios";
import toast from "react-hot-toast";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products: products }),

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
      set({ loading: false });
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      set({ products: res.data.products, loading: false });
    } catch (error) {
      console.log(error);
      set({ loading: false });
      toast.error("Failed to fetch products");
    }
  },
  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products, loading: false });
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch category");
      set({ loading: false });
    }
  },
  toggleFeaturedProduct: async (id) => {
    console.log(id);
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${id}`);
      set((state) => ({
        products: state.products.map((product) =>
          product._id === id
            ? { ...product, isFeatured: response.data.isFeatured }
            : product
        ),
      }));
      set({ loading: false });
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to feature product");
      set({ loading: false });
    }
  },
  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${id}`);
      set((prev) => ({
        products: prev.products.filter((product) => product._id !== id),
      }));
      set({ loading: false });
      toast.success("Product deleted");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to delete product");
      set({ loading: false });
    }
  },
}));
