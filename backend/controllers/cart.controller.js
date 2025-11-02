import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find((item) => item.id === product.id);
      return { ...product.toJSON(), quantity: item.quantity };
    });
    res.json(cartItems);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        message: "Server error while getting cart items",
        error: error.message,
      });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }
    await user.save();
    res.json(cartItems);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error while adding item to cart",
      error: error.message,
    });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    return res.json(cartItems);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error while removing item from cart",
      error: error.message,
    });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.json(cartItems);
      }
      existingItem.quantity = quantity;
    } else {
      res.status(404).json({ message: "Item not found in the cart" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error while updating quantity",
      error: error.message,
    });
  }
};
