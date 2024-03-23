const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find().populate("category").exec();
  res.render("item_list", {
    title: "All Items",
    items: allItems
  });
});

exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();
  res.render("item_create", {
    title: "Create Item",
    categories: allCategories,
    item: "",
    errors: ""
  });
});

exports.item_create_post = [
  body("name", "Name must be specified").trim().isLength({ min: 10 }).escape(),
  body("description", "Description must be specified").trim().isLength({ min: 1 }).escape(),
  body("category", "No category selected").isLength({ min: 1 }).escape(),
  body("in_stock").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      in_stock: req.body.in_stock
    });
    if (!errors.isEmpty()) {
      const allCategories = await Category.find().exec();
      res.render("item_create", {
        title: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array()
      });
      return;
    } else {
      await item.save();
      res.redirect("/catalog/items");
    }
  })
];
