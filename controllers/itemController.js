const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
// dest starts from root
const upload = multer({ dest: "./public/uploads/" });
const cloudinary = require("cloudinary").v2;
// For .env
const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
  // Change to Railway
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
  // Upload goes first
  upload.single("item_img"),
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must be specified").trim().isLength({ min: 1 }).escape(),
  body("category", "No category selected").isLength({ min: 1 }).escape(),
  body("in_stock").escape(),
  body("item_img").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      in_stock: req.body.in_stock,
      img_url: ""
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
      // Uploading to cloudinary
      const item_img = await cloudinary.uploader.upload(req.file.path);
      item.img_url = item_img.secure_url;
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
  upload.single("item_img"),
  body("name", "Name must be specified").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must be specified").trim().isLength({ min: 1 }).escape(),
  body("category", "No category selected").isLength({ min: 1 }).escape(),
  body("in_stock").escape(),
  body("item_img").escape(),
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
      const item_img = await cloudinary.uploader.upload(req.file.path);
      item.name = req.body.name;
      item.description = req.body.description;
      item.category = req.body.category;
      item.in_stock = req.body.in_stock;
      item.img_url = item_img.secure_url;
      await item.save();
      res.redirect(item.url);
    }
  })
];
