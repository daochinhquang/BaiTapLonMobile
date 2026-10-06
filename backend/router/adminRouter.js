const express = require("express");
const ctrl = require("../controllers/adminController");
const userCtrl = require("../controllers/nguoidungController");
const { requireAdmin } = require("../common/adminSession");

const router = express.Router();

router.post("/login", userCtrl.adminLogin);
router.use(requireAdmin);

router.get("/dashboard", ctrl.dashboard);
router.get("/statistics", ctrl.statistics);

router.get("/products", ctrl.getProducts);
router.post("/products", ctrl.createProduct);
router.put("/products/:id", ctrl.updateProduct);
router.delete("/products/:id", ctrl.deleteProduct);

router.get("/product-types", ctrl.getProductTypes);
router.post("/product-types", ctrl.createProductType);
router.put("/product-types/:id", ctrl.updateProductType);
router.delete("/product-types/:id", ctrl.deleteProductType);
router.get("/categories", ctrl.getCategories);

router.get("/suppliers", ctrl.getSuppliers);
router.post("/suppliers", ctrl.createSupplier);
router.put("/suppliers/:id", ctrl.updateSupplier);
router.delete("/suppliers/:id", ctrl.deleteSupplier);

router.get("/vouchers", ctrl.getVouchers);
router.post("/vouchers", ctrl.createVoucher);
router.put("/vouchers/:id", ctrl.updateVoucher);
router.delete("/vouchers/:id", ctrl.deleteVoucher);

router.get("/imports", ctrl.getImports);
router.post("/imports", ctrl.createImport);
router.post("/imports/:id/receive", ctrl.receiveImport);
router.delete("/imports/:id", ctrl.deleteImport);

router.get("/orders", ctrl.getOrders);
router.put("/orders/:id/status", ctrl.updateOrderStatus);
router.delete("/orders/:id", ctrl.deleteOrder);

router.get("/customers", ctrl.getCustomers);
router.post("/customers", ctrl.createCustomer);
router.put("/customers/:id", ctrl.updateCustomer);
router.delete("/customers/:id", ctrl.deleteCustomer);

router.get("/accounts", ctrl.getAccounts);
router.post("/accounts", ctrl.createAccount);
router.put("/accounts/:id", ctrl.updateAccount);
router.delete("/accounts/:id", ctrl.deleteAccount);

module.exports = router;
