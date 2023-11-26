"use strict";

const express = require("express");
const productController = require("../controllers/productController");

const api = express.Router();
const auth = require("../middlewares/authenticate");
const multiparty = require("connect-multiparty");
const path = multiparty({ uploadDir: "./uploads/products" });

// PRODUCTS
api.post(
    "/register_product_admin",
    [auth.auth, path],
    productController.register_product_admin
);

api.get(
    "/list_products_admin/:filter?",
    auth.auth,
    productController.list_products_admin
);

api.get("/get_cover/:img", productController.get_cover);

api.get(
    "/get_product_admin/:id",
    auth.auth,
    productController.get_product_admin
);

api.put(
    "/update_product_admin/:id",
    [auth.auth, path],
    productController.update_product_admin
);

api.delete(
    "/delete_product_admin/:id",
    auth.auth,
    productController.delete_product_admin
);

api.put(
    "/update_product_varieties_admin/:id",
    auth.auth,
    productController.update_product_varieties_admin
);

api.put(
    "/add_gallery_image_admin/:id",
    [auth.auth, path],
    productController.add_gallery_image_admin
);

api.put(
    "/delete_gallery_image_admin/:id",
    auth.auth,
    productController.delete_gallery_image_admin
);

// INVENTORY
// api.get(
//     "/list_product_inventory_admin/:id",
//     auth.auth,
//     productController.list_product_inventory_admin
// );
// api.delete(
//     "/delete_product_inventory_admin/:id",
//     auth.auth,
//     productController.delete_product_inventory_admin
// );
// api.post(
//     "/register_product_inventory_admin",
//     auth.auth,
//     productController.register_product_inventory_admin
// );

// PUBLIC
// api.get(
//   "/list_public_products/:filter?",
//   productController.list_public_products
// );
// api.get(
//   "/get_public_product_slug/:slug",
//   productController.get_public_product_slug
// );
// api.get(
//   "/list_recommended_public_products/:category",
//   productController.list_recommended_public_products
// );

// api.get(
//   "/list_new_public_products",
//   productController.list_new_public_products
// );
// api.get(
//   "/list_best_selling_public_products",
//   productController.list_best_selling_public_products
// );
// api.get(
//   "/get_public_product_reviews/:id",
//   productController.get_public_product_reviews
// );

module.exports = api;
