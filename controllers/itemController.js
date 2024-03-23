const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
// dest starts from root
const upload = multer({ dest: "./public/uploads/" });

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
  // upload goes first
  upload.single("item_img"),
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must be specified").trim().isLength({ min: 1 }).escape(),
  body("category", "No category selected").isLength({ min: 1 }).escape(),
  body("in_stock").escape(),
  asyncHandler(async (req, res, next) => {
    console.log(req.file);
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
      res.redirect(item.url);
    }
  })
];

exports.item_details_get = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().exec()
  ]);
  res.render("item_details", {
    title: "Item Details",
    item: item,
    categories: allCategories
  });
});

exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();
  res.render("item_delete", {
    title: "Item Delete",
    item: item
  });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.item_id);
  res.redirect("/catalog/items");
});

exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find().exec()
  ]);
  res.render("item_create", {
    title: "Update Item",
    categories: allCategories,
    item: item,
    errors: ""
  });
});

exports.item_update_post = [
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must be specified").trim().isLength({ min: 1 }).escape(),
  body("category", "No category selected").isLength({ min: 1 }).escape(),
  body("in_stock").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const item = await Item.findById(req.params.id).exec();
    if (!errors.isEmpty()) {
      const allCategories = await Category.find().exec();
      res.render("item_create", {
        title: "Update Item",
        categories: allCategories,
        item: item,
        errors: errors.array()
      });
      return;
    } else {
      item.name = req.body.name;
      item.description = req.body.description;
      item.category = req.body.category;
      item.in_stock = req.body.in_stock;
      await item.save();
      res.redirect(item.url);
    }
  })
];
