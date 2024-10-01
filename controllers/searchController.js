import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

// Controller for advanced search
export const advancedSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, "i");

    // Fetch active brands
    const brands = await Brand.find({
      name: searchRegex,
      status: "active", 
    }).select("name logo status");

    // Fetch active categories
    const categories = await Category.find({
      name: searchRegex,
      status: "active", 
    }).select("name status");

    // Fetch approved products
    const products = await Product.find({
      name: searchRegex,
      approved: true, 
    })
      .populate("category", "name")
      .populate("brand", "name")
      .select("name price stock status");

    const searchResults = {
      brands,
      categories,
      products,
    };

    res.status(200).json({
      status: "success",
      doc: searchResults,
    });
  } catch (error) {
    console.error("Error during advanced search:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
    });
  }
};
