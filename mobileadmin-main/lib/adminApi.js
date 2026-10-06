const API_BASE_URL = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || "Không thể kết nối với máy chủ.");
  }

  return payload;
}

function padId(prefix, value) {
  return `${prefix}${String(value).padStart(3, "0")}`;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function toDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function formatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

const statusLabels = {
  cancelled: "Đã hủy",
  completed: "Đã giao",
  confirmed: "Chờ xác nhận",
  pending: "Chờ xác nhận",
  shipping: "Đang giao",
};

const statusValues = {
  "Chờ xác nhận": "pending",
  "Đang giao": "shipping",
  "Đã giao": "completed",
  "Đã hủy": "cancelled",
};

const voucherStatusLabels = {
  active: "Đang hoạt động",
  exhausted: "Hết lượt",
  expired: "Hết hạn",
  inactive: "Tạm ngưng",
  scheduled: "Chưa bắt đầu",
};

const voucherStatusValues = {
  "Đang hoạt động": "active",
  "Hết hạn": "expired",
  "Tạm ngưng": "inactive",
};

function productStatus(status, stock) {
  if (status === "out_of_stock" || toNumber(stock) === 0) return "Hết hàng";
  if (toNumber(stock) <= 10) return "Sắp hết";
  return "Đang bán";
}

function mapProduct(item) {
  const variants = (item.variants || []).map((variant) => ({
    color: variant.color || "",
    id: Number(variant.id),
    price: toNumber(variant.price),
    size: variant.size || "",
    status: variant.status,
    stock: toNumber(variant.stock),
  }));
  return {
    brand: item.brand || "",
    category: item.typeName || "Chưa phân loại",
    categoryId: Number(item.typeId),
    description: item.description || "",
    id: padId("SP", item.id),
    image: item.image || "",
    name: item.name,
    price: toNumber(item.price),
    rawId: Number(item.id),
    status: productStatus(item.status, item.stock),
    stock: toNumber(item.stock),
    supplier: item.supplierName || "",
    supplierId: Number(item.supplierId),
    variants,
  };
}

function mapProductType(item) {
  return {
    categoryId: Number(item.categoryId),
    categoryName: item.categoryName,
    description: item.description || "",
    id: padId("LSP", item.id),
    name: item.name,
    products: toNumber(item.productCount),
    rawId: Number(item.id),
    status: item.status === "inactive" ? "Tạm ngưng" : "Đang sử dụng",
  };
}

function mapSupplier(item) {
  return {
    address: item.address || "",
    contact: item.contact || "",
    email: item.email || "",
    id: padId("NCC", item.id),
    name: item.name,
    phone: item.phone || "",
    products: toNumber(item.productCount),
    rawId: Number(item.id),
    status: item.status === "inactive" ? "Tạm ngưng" : "Đang hợp tác",
    taxCode: item.taxCode || "",
  };
}

function mapImport(item) {
  return {
    date: formatDate(item.importedAt),
    dateValue: toDateInput(item.importedAt),
    id: padId("PN", item.id),
    items: item.items || [],
    products: toNumber(item.productCount),
    quantity: toNumber(item.quantity),
    rawId: Number(item.id),
    status: item.status === "completed" ? "Đã nhập" : "Chờ nhập",
    supplier: item.supplierName,
    supplierId: Number(item.supplierId),
    total: toNumber(item.total),
  };
}

function mapOrder(item) {
  return {
    address: item.address || "",
    customer: item.customer,
    date: formatDate(item.createdAt),
    discount: toNumber(item.discount),
    id: padId("DH", item.id),
    items: (item.items || []).map((line) => ({
      color: line.color || "",
      name: line.name,
      price: toNumber(line.price),
      quantity: toNumber(line.quantity),
      size: line.size || "",
    })),
    payment:
      item.paymentMethod === "ChuyenKhoan"
        ? "Chuyển khoản"
        : item.paymentMethod,
    paymentStatus: item.paymentStatus,
    phone: item.phone || "",
    rawId: Number(item.id),
    shippingFee: toNumber(item.shippingFee),
    status: statusLabels[item.status] || item.status,
    subtotal: toNumber(item.subtotal),
    total: toNumber(item.total),
  };
}

function mapCustomer(item) {
  return {
    address: item.address || "Chưa có địa chỉ",
    date: formatDate(item.createdAt),
    email: item.email || "",
    id: padId("KH", item.id),
    name: item.name,
    orders: toNumber(item.orderCount),
    phone: item.phone || "",
    rawId: Number(item.id),
    spent: toNumber(item.spent),
    status: item.status === "locked" ? "Không hoạt động" : "Hoạt động",
  };
}

function mapVoucher(item) {
  return {
    code: item.code || "",
    editingStatus: voucherStatusLabels[item.configuredStatus || item.status] || "Đang hoạt động",
    discountType: item.discountType === "phan_tram" ? "phan_tram" : "tien_mat",
    discountValue: toNumber(item.discountValue),
    endsAt: formatDateTime(item.endsAt),
    endsAtValue: toDateTimeInput(item.endsAt),
    id: padId("VC", item.id),
    maxDiscount:
      item.maxDiscount === null || item.maxDiscount === undefined
        ? ""
        : toNumber(item.maxDiscount),
    minOrderValue: toNumber(item.minOrderValue),
    name: item.name || "",
    orderCount: toNumber(item.orderCount),
    quantity: toNumber(item.quantity),
    rawId: Number(item.id),
    startsAt: formatDateTime(item.startsAt),
    startsAtValue: toDateTimeInput(item.startsAt),
    status: voucherStatusLabels[item.status] || item.status,
    statusValue: item.status,
    totalDiscount: toNumber(item.totalDiscount),
    usedCount: toNumber(item.usedCount),
  };
}

function mapAccount(item) {
  return {
    date: formatDate(item.createdAt),
    email: item.email || "",
    id: padId("TK", item.id),
    name: item.name,
    phone: item.phone || "",
    rawId: Number(item.id),
    role: item.role === "admin" ? "Admin" : "Khách hàng",
    status: item.status === "locked" ? "Đã khóa" : "Đang hoạt động",
    username: item.username || (item.email || "").split("@")[0],
  };
}

function voucherPayload(form) {
  return {
    code: form.code,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    endsAt: form.endsAt,
    maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
    minOrderValue: Number(form.minOrderValue),
    name: form.name,
    quantity: Number(form.quantity),
    startsAt: form.startsAt,
    status: voucherStatusValues[form.status] || "active",
  };
}

export const adminApi = {
  accounts: {
    create: (form) =>
      request("/admin/accounts", {
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          password: form.password,
          phone: form.phone,
          role: form.role === "Admin" ? "admin" : "user",
          status: form.status === "Đã khóa" ? "locked" : "active",
        }),
        method: "POST",
      }),
    delete: (id) => request(`/admin/accounts/${id}`, { method: "DELETE" }),
    list: async () => (await request("/admin/accounts")).map(mapAccount),
    update: (id, form) =>
      request(`/admin/accounts/${id}`, {
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone,
          role: form.role === "Admin" ? "admin" : "user",
          status: form.status === "Đã khóa" ? "locked" : "active",
        }),
        method: "PUT",
      }),
  },
  categories: {
    list: () => request("/admin/categories"),
  },
  customers: {
    create: (form) =>
      request("/admin/customers", {
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          password: form.password,
          phone: form.phone,
          role: "user",
          status: form.status === "Không hoạt động" ? "locked" : "active",
        }),
        method: "POST",
      }),
    delete: (id) => request(`/admin/customers/${id}`, { method: "DELETE" }),
    list: async () => (await request("/admin/customers")).map(mapCustomer),
    update: (id, form) =>
      request(`/admin/customers/${id}`, {
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone,
          role: "user",
          status: form.status === "Không hoạt động" ? "locked" : "active",
        }),
        method: "PUT",
      }),
  },
  dashboard: () => request("/admin/dashboard"),
  imports: {
    create: (form) =>
      request("/admin/imports", {
        body: JSON.stringify({
          importedAt: form.date,
          productId: Number(form.productId),
          variantId: Number(form.variantId),
          quantity: Number(form.quantity),
          status: form.status === "Đã nhập" ? "completed" : "draft",
          supplierId: Number(form.supplierId),
          unitPrice: Number(form.unitPrice),
        }),
        method: "POST",
      }),
    delete: (id) => request(`/admin/imports/${id}`, { method: "DELETE" }),
    list: async () => (await request("/admin/imports")).map(mapImport),
    receive: (id) =>
      request(`/admin/imports/${id}/receive`, { method: "POST" }),
  },
  orders: {
    delete: (id) => request(`/admin/orders/${id}`, { method: "DELETE" }),
    list: async () => (await request("/admin/orders")).map(mapOrder),
    updateStatus: (id, status) =>
      request(`/admin/orders/${id}/status`, {
        body: JSON.stringify({ status: statusValues[status] || status }),
        method: "PUT",
      }),
  },
  productTypes: {
    create: (form) =>
      request("/admin/product-types", {
        body: JSON.stringify({
          categoryId: Number(form.categoryId),
          code: form.id,
          description: form.description,
          name: form.name,
          status: form.status === "Tạm ngưng" ? "inactive" : "active",
        }),
        method: "POST",
      }),
    delete: (id) => request(`/admin/product-types/${id}`, { method: "DELETE" }),
    list: async () =>
      (await request("/admin/product-types")).map(mapProductType),
    update: (id, form) =>
      request(`/admin/product-types/${id}`, {
        body: JSON.stringify({
          categoryId: Number(form.categoryId),
          code: form.id,
          description: form.description,
          name: form.name,
          status: form.status === "Tạm ngưng" ? "inactive" : "active",
        }),
        method: "PUT",
      }),
  },
  products: {
    create: (form) =>
      request("/admin/products", {
        body: JSON.stringify({
          brand: form.brand,
          description: form.description,
          image: form.image,
          name: form.name,
          price: Math.min(
            ...form.variants.map((variant) => Number(variant.price)),
          ),
          status: form.status === "Hết hàng" ? "out_of_stock" : "active",
          stock: form.variants.reduce(
            (total, variant) => total + Number(variant.stock),
            0,
          ),
          supplierId: Number(form.supplierId),
          typeId: Number(form.categoryId),
          variants: form.variants.map((variant) => ({
            color: variant.color,
            id: variant.id || null,
            price: Number(variant.price),
            size: variant.size,
            stock: Number(variant.stock),
          })),
        }),
        method: "POST",
      }),
    delete: (id) => request(`/admin/products/${id}`, { method: "DELETE" }),
    list: async () => (await request("/admin/products")).map(mapProduct),
    update: (id, form) =>
      request(`/admin/products/${id}`, {
        body: JSON.stringify({
          brand: form.brand,
          description: form.description,
          image: form.image,
          name: form.name,
          price: Math.min(
            ...form.variants.map((variant) => Number(variant.price)),
          ),
          status: form.status === "Hết hàng" ? "out_of_stock" : "active",
          stock: form.variants.reduce(
            (total, variant) => total + Number(variant.stock),
            0,
          ),
          supplierId: Number(form.supplierId),
          typeId: Number(form.categoryId),
          variants: form.variants.map((variant) => ({
            color: variant.color,
            id: variant.id || null,
            price: Number(variant.price),
            size: variant.size,
            stock: Number(variant.stock),
          })),
        }),
        method: "PUT",
      }),
  },
  statistics: () => request("/admin/statistics"),
  suppliers: {
    create: (form) =>
      request("/admin/suppliers", {
        body: JSON.stringify({
          address: form.address,
          contact: form.contact,
          email: form.email,
          name: form.name,
          phone: form.phone,
          status: form.status === "Tạm ngưng" ? "inactive" : "active",
          taxCode: form.taxCode,
        }),
        method: "POST",
      }),
    delete: (id) => request(`/admin/suppliers/${id}`, { method: "DELETE" }),
    list: async () => (await request("/admin/suppliers")).map(mapSupplier),
    update: (id, form) =>
      request(`/admin/suppliers/${id}`, {
        body: JSON.stringify({
          address: form.address,
          contact: form.contact,
          email: form.email,
          name: form.name,
          phone: form.phone,
          status: form.status === "Tạm ngưng" ? "inactive" : "active",
          taxCode: form.taxCode,
        }),
        method: "PUT",
      }),
  },
  vouchers: {
    create: (form) =>
      request("/admin/vouchers", {
        body: JSON.stringify(voucherPayload(form)),
        method: "POST",
      }),
    delete: (id) => request(`/admin/vouchers/${id}`, { method: "DELETE" }),
    list: async () => (await request("/admin/vouchers")).map(mapVoucher),
    update: (id, form) =>
      request(`/admin/vouchers/${id}`, {
        body: JSON.stringify(voucherPayload(form)),
        method: "PUT",
      }),
  },
};

export { formatDate, mapOrder, productStatus, statusLabels, toNumber };
