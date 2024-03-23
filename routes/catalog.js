const express = require("express");
const router = express.Router();

// Require controllers
const category_controller = require("../controllers/categoryController");
const item_controller = require("../controllers/itemController");

// Index Route
router.get("/", category_controller.index);

// Category Routes
router.get("/categories", category_controller.category_list);

router.get("/category/create", category_controller.category_create_get);

router.post("/category/create", category_controller.category_create_post);

router.get("/category/:id", category_controller.category_details_get);

router.get("/category/:id/delete", category_controller.category_delete_get);

router.post("/category/:id/delete", category_controller.category_delete_post);

router.get("/category/:id/update", category_controller.category_update_get);

router.post("/category/:id/update", category_controller.category_update_post);

// Item Routes
router.get("/items", item_controller.item_list);

router.get("/item/create", item_controller.item_create_get);

router.post("/item/create", item_controller.item_create_post);

module.exports = router;
