import Product from "../models/product.model.js";
import redis from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error fetching products",
      error: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) return res.json(JSON.parse(featuredProducts)); // redis stores as string
    // lean() returns plain javascript objects
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    return res.json(featuredProducts);
  } catch (error) {
    console.log(error);
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          name: 1,
          _id: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error getting recommendations",
      error: error.message,
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "server error getting products by category",
      error: error.message,
    });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: "No product was found" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Server error updating product", error: error.message });
  }
};
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    const product = await Product.create({
      name,
      price,
      category,
      image: cloudinaryResponse?.secure_url || "",
      description,
    });
    res.status(201).json(product);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(
        { message: "Server error creating new product" },
        { error: error.message }
      );
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (image) {
      const imagePublicId = product.image.split("/").pop().split(".")[0];

      try {
        await cloudinary.uploader.destroy(`products/${imagePublicId}`);
        console.log("Image was deleted from cloudinary");
      } catch (error) {
        console.log("Error deleting image", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product was deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error while deleting product",
      error: error.message,
    });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error in updating redis cache", error);
  }
}
