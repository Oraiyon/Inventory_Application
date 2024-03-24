const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Shows number of categories & items
exports.index = asyncHandler(async (req, res, next) => {
  const [allCategories, allItems] = await Promise.all([
    Category.find().exec(),
    Item.find().populate("category").exec()
  ]);
  res.render("index", {
    title: "Hello, World!",
    categories: allCategories,
    items: allItems
  });
});

// Lists all categories
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render("category_list", {
    title: "All Categories",
    categories: allCategories
  });
});

// Create a category
exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render("category_create", {
    title: "Create Category",
    errors: "",
    category: ""
  });
});

exports.category_create_post = [
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("description", "Desctription must be specified").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newCategory = new Category({
      name: req.body.name,
      description: req.body.description
    });
    if (!errors.isEmpty()) {
      res.render("category_create", {
        title: "Create Category",
        errors: errors.array(),
        category: newCategory
      });
      return;
    } else {
      await newCategory.save();
      res.redirect(newCategory.url);
    }
  })
];

// Get category details
exports.category_details_get = asyncHandler(async (req, res, next) => {
  const [category, allItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find().populate("category").exec()
  ]);
  res.render("category_details", {
    title: "Category Details",
    category: category,
    items: allItems
  });
});

// Delete category
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();
  res.render("category_delete", {
    title: "Category Delete",
    category: category
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  await Category.findByIdAndDelete(req.body.category_id);
  res.redirect("/catalog/categories");
});

// Update category
exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();
  res.render("category_create", {
    title: "Update Category",
    errors: "",
    category: category
  });
});

exports.category_update_post = [
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("description", "Desctription must be specified").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = await Category.findById(req.params.id).exec();
    if (!errors.isEmpty()) {
      res.render("category_create", {
        title: "Update Category",
        errors: errors.array(),
        category: category
      });
      return;
    } else {
      category.name = req.body.name;
      category.description = req.body.description;
      await category.save();
      res.redirect(category.url);
    }
  })
];
