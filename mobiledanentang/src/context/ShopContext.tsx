import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  addresses as mockAddresses,
  categories as mockCategories,
  currentUser,
  initialCartItems,
  initialFavoriteIds,
  initialOrders,
  products as mockProducts,
  vouchers as mockVouchers,
} from "@/services/api";
import {
  addBackendCartItem,
  cancelBackendOrder,
  changeBackendPassword,
  createBackendAddress,
  deleteBackendAddress,
  deleteBackendCartItem,
  fetchBackendCatalog,
  fetchBackendAddresses,
  fetchBackendOrders,
  fetchBackendShopData,
  fetchBackendVouchers,
  placeBackendOrder,
  setBackendDefaultAddress,
  updateBackendAddress,
  updateBackendCartItem,
  updateBackendUserProfile,
  validateBackendVoucher,
} from "@/services/backendApi";
import {
  buildCartLines,
  calculateCartSummary,
  calculateVoucherDiscount,
  getDefaultVariant,
} from "@/services/cartService";
import {
  clearStoredUserId,
  getStoredUserId,
  saveStoredUserId,
} from "@/services/sessionStorage";
import type { CartItem, CartLine, Category, Product } from "@/types/product";
import type { Order } from "@/types/order";
import type {
  Address,
  AddressInput,
  PaymentMethod,
  User,
  Voucher,
} from "@/types/user";

type PlaceOrderOptions = {
  clearSelectedCart?: boolean;
};

type ShopContextValue = {
  addresses: Address[];
  cartCount: number;
  cartItems: CartItem[];
  cartLines: CartLine[];
  cartSummary: ReturnType<typeof calculateCartSummary>;
  categories: Category[];
  dataSource: "backend" | "mock";
  favoriteIds: string[];
  favoriteProducts: Product[];
  isLoadingBackend: boolean;
  orders: Order[];
  products: Product[];
  selectedAddress: Address | undefined;
  selectedCartLines: CartLine[];
  selectedCartSummary: ReturnType<typeof calculateCartSummary>;
  user: User;
  vouchers: Voucher[];
  addAddress: (address: AddressInput) => Promise<Address>;
  addToCart: (productId: string, quantity?: number, variantId?: string) => void;
  cancelOrder: (orderId: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  clearAuthenticatedUser: () => void;
  deleteAddress: (addressId: string) => Promise<void>;
  editAddress: (addressId: string, address: AddressInput) => Promise<Address>;
  getCategoryById: (id: string) => Category | undefined;
  getProductById: (id: string) => Product | undefined;
  isFavorite: (productId: string) => boolean;
  placeOrder: (
    lines: CartLine[],
    paymentMethod: PaymentMethod,
    voucherDiscount: number,
    voucherId?: string,
    options?: PlaceOrderOptions,
  ) => Promise<Order>;
  removeCartItem: (productId: string, variantId: string) => void;
  refreshOrders: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshVouchers: () => Promise<void>;
  saveUserProfile: (user: User) => Promise<User>;
  setAuthenticatedUser: (user: User) => void;
  setDefaultAddress: (addressId: string) => Promise<void>;
  toggleCartItemSelected: (productId: string, variantId: string) => void;
  toggleFavorite: (productId: string) => void;
  updateCartQuantity: (
    productId: string,
    variantId: string,
    quantity: number,
  ) => void;
  validateVoucherCode: (code: string, subtotal: number) => Promise<Voucher>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: PropsWithChildren) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [user, setUser] = useState<User>(currentUser);
  const [vouchers, setVouchers] = useState<Voucher[]>(mockVouchers);
  const [dataSource, setDataSource] = useState<"backend" | "mock">("mock");
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const lastProductRefreshAt = useRef(0);
  const ordersRefreshInFlight = useRef(false);

  const cartLines = useMemo(
    () => buildCartLines(cartItems, products),
    [cartItems, products],
  );
  const selectedCartLines = useMemo(
    () => buildCartLines(cartItems, products, true),
    [cartItems, products],
  );
  const cartSummary = useMemo(
    () => calculateCartSummary(cartLines),
    [cartLines],
  );
  const selectedCartSummary = useMemo(
    () => calculateCartSummary(selectedCartLines),
    [selectedCartLines],
  );
  const favoriteProducts = useMemo(
    () => products.filter((product) => favoriteIds.includes(product.id)),
    [favoriteIds, products],
  );
  const selectedAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0];
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    let isMounted = true;

    async function loadBackendData() {
      setIsLoadingBackend(true);

      try {
        lastProductRefreshAt.current = Date.now();
        const storedUserId = await getStoredUserId();
        const data = await fetchBackendShopData(storedUserId);

        if (!isMounted) {
          return;
        }

        setCategories(data.categories);
        setProducts(data.products);
        setAddresses(data.addresses);
        setCartItems(data.cartItems);
        setOrders(data.orders);
        setUser(data.user);
        setVouchers(data.vouchers);
        setDataSource("backend");
        setFavoriteIds((currentIds) =>
          currentIds.filter((id) =>
            data.products.some((product) => product.id === id),
          ),
        );
      } catch {
        if (isMounted) {
          setDataSource("mock");
        }
      } finally {
        if (isMounted) {
          setIsLoadingBackend(false);
        }
      }
    }

    void loadBackendData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshProducts = useCallback(async () => {
    if (Date.now() - lastProductRefreshAt.current < 3000) return;
    lastProductRefreshAt.current = Date.now();

    try {
      const catalog = await fetchBackendCatalog();
      setCategories(catalog.categories);
      setProducts(catalog.products);
    } catch {
      // Keep the last loaded catalog when the backend is temporarily unavailable.
    }
  }, []);

  const refreshVouchers = useCallback(async () => {
    if (dataSource !== "backend") return;
    setVouchers(await fetchBackendVouchers(user.id));
  }, [dataSource, user.id]);

  useEffect(() => {
    let cancelled = false;
    if (dataSource === "backend") {
      void fetchBackendVouchers(user.id)
        .then((available) => { if (!cancelled) setVouchers(available); })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [dataSource, user.id]);

  const refreshOrders = useCallback(async () => {
    if (
      dataSource !== "backend" ||
      !/^\d+$/.test(user.id) ||
      ordersRefreshInFlight.current
    ) {
      return;
    }

    ordersRefreshInFlight.current = true;
    try {
      const refreshedOrders = await fetchBackendOrders(
        user.id,
        new Map(products.map((product) => [product.id, product])),
      );
      setOrders(refreshedOrders);
    } catch {
      // Keep the last loaded orders when the backend is temporarily unavailable.
    } finally {
      ordersRefreshInFlight.current = false;
    }
  }, [dataSource, products, user.id]);

  function addToCart(
    productId: string,
    quantity = 1,
    requestedVariantId?: string,
  ) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const variant =
      product.variants?.find((item) => item.id === requestedVariantId) ??
      getDefaultVariant(product);
    const variantId = variant.id;

    setCartItems((currentItems) => {
      const existedItem = currentItems.find(
        (item) => item.productId === productId && item.variantId === variantId,
      );

      if (!existedItem) {
        return [
          ...currentItems,
          { productId, quantity, selected: true, variantId },
        ];
      }

      return currentItems.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: item.quantity + quantity, selected: true }
          : item,
      );
    });

    if (dataSource === "backend" && /^\d+$/.test(user.id)) {
      void addBackendCartItem(user.id, productId, variantId, quantity)
        .then(setCartItems)
        .catch(() => undefined);
    }
  }

  function updateCartQuantity(
    productId: string,
    variantId: string,
    quantity: number,
  ) {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );

    if (dataSource === "backend" && /^\d+$/.test(user.id)) {
      void updateBackendCartItem(
        user.id,
        productId,
        variantId,
        Math.max(1, quantity),
      )
        .then((items) =>
          setCartItems((currentItems) =>
            items.map((item) => ({
              ...item,
              selected:
                currentItems.find(
                  (currentItem) =>
                    currentItem.productId === item.productId &&
                    currentItem.variantId === item.variantId,
                )?.selected ?? true,
            })),
          ),
        )
        .catch(() => undefined);
    }
  }

  function removeCartItem(productId: string, variantId: string) {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.productId !== productId || item.variantId !== variantId,
      ),
    );

    if (dataSource === "backend" && /^\d+$/.test(user.id)) {
      void deleteBackendCartItem(user.id, productId, variantId)
        .then(setCartItems)
        .catch(() => undefined);
    }
  }

  function toggleCartItemSelected(productId: string, variantId: string) {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  }

  function toggleFavorite(productId: string) {
    setFavoriteIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((id) => id !== productId)
        : [...currentIds, productId],
    );
  }

  function isFavorite(productId: string) {
    return favoriteIds.includes(productId);
  }

  function getProductById(id: string) {
    return products.find((product) => product.id === id);
  }

  function getCategoryById(id: string) {
    return categories.find((category) => category.id === id);
  }

  async function addAddress(address: AddressInput) {
    const savedAddresses = await createBackendAddress(user.id, address);
    const createdAddress = savedAddresses.find(
      (item) =>
        item.receiverName === address.receiverName &&
        item.phone === address.phone &&
        item.detail === address.detail,
    );

    setAddresses(savedAddresses);

    return createdAddress ?? savedAddresses[0];
  }

  async function editAddress(addressId: string, address: AddressInput) {
    const savedAddresses = await updateBackendAddress(
      user.id,
      addressId,
      address,
    );
    const updatedAddress =
      savedAddresses.find((item) => item.id === addressId) ?? savedAddresses[0];

    setAddresses(savedAddresses);

    return updatedAddress;
  }

  async function deleteAddress(addressId: string) {
    const savedAddresses = await deleteBackendAddress(user.id, addressId);

    setAddresses(savedAddresses);
  }

  async function setDefaultAddress(addressId: string) {
    const savedAddresses = await setBackendDefaultAddress(user.id, addressId);

    setAddresses(savedAddresses);
  }

  function setAuthenticatedUser(nextUser: User) {
    setUser(nextUser);
    void saveStoredUserId(nextUser.id);
    void fetchBackendShopData(nextUser.id)
      .then((data) => {
        setAddresses(data.addresses);
        setCartItems(data.cartItems);
        setCategories(data.categories);
        setOrders(data.orders);
        setProducts(data.products);
        setUser(data.user);
        setVouchers(data.vouchers);
        setDataSource("backend");
      })
      .catch(() => {
        void fetchBackendAddresses(nextUser.id)
          .then(setAddresses)
          .catch(() => setAddresses([]));
      });
  }

  async function saveUserProfile(nextUser: User) {
    const savedUser = await updateBackendUserProfile(nextUser);

    setUser(savedUser);
    await saveStoredUserId(savedUser.id);

    return savedUser;
  }

  function clearAuthenticatedUser() {
    setUser(currentUser);
    setAddresses([]);
    setCartItems([]);
    setOrders([]);
    setFavoriteIds([]);
    void clearStoredUserId();
  }

  async function placeOrder(
    lines: CartLine[],
    paymentMethod: PaymentMethod,
    _voucherDiscount: number,
    voucherId?: string,
    options?: PlaceOrderOptions,
  ) {
    if (!/^\d+$/.test(user.id)) {
      throw new Error("Vui lòng đăng nhập trước khi đặt hàng.");
    }
    if (!selectedAddress) {
      throw new Error("Vui lòng thêm địa chỉ nhận hàng trước khi đặt hàng.");
    }
    if (!/^\d+$/.test(selectedAddress.id)) {
      throw new Error("Vui lòng thêm địa chỉ nhận hàng cho tài khoản của bạn.");
    }
    if (!lines.length) {
      throw new Error("Vui lòng chọn ít nhất một sản phẩm.");
    }
    const newOrder = await placeBackendOrder({
      clearCart: options?.clearSelectedCart,
      addressId: selectedAddress.id,
      items: lines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
        variantId: line.variant.id,
      })),
      paymentMethod,
      productsById: new Map(products.map((product) => [product.id, product])),
      userId: user.id,
      voucherId,
    });

    setOrders((currentOrders) => [newOrder, ...currentOrders]);
    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        const purchasedLines = lines.filter(
          (line) => line.product.id === product.id,
        );
        const quantity = purchasedLines.reduce(
          (total, line) => total + line.quantity,
          0,
        );
        if (!quantity) return product;
        return {
          ...product,
          stock: Math.max(0, product.stock - quantity),
          variants: product.variants?.map((variant) => {
            const variantQuantity = purchasedLines
              .filter((line) => line.variant.id === variant.id)
              .reduce((total, line) => total + line.quantity, 0);
            return variantQuantity
              ? {
                  ...variant,
                  stock: Math.max(0, variant.stock - variantQuantity),
                }
              : variant;
          }),
        };
      }),
    );

    if (options?.clearSelectedCart) {
      setCartItems((currentItems) =>
        currentItems.filter((item) => !item.selected),
      );
    }

    if (voucherId) {
      setVouchers((currentVouchers) =>
        currentVouchers.filter((voucher) => voucher.id !== voucherId),
      );
      void refreshVouchers().catch(() => {});
    }

    return newOrder;
  }

  async function validateVoucherCode(code: string, subtotal: number) {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      throw new Error("Vui lòng nhập mã giảm giá.");
    }

    if (dataSource === "backend") {
      return validateBackendVoucher(normalizedCode, subtotal, /^\d+$/.test(user.id) ? user.id : undefined);
    }

    const voucher = vouchers.find(
      (item) => item.code.toUpperCase() === normalizedCode,
    );
    if (!voucher) {
      throw new Error("Mã giảm giá không hợp lệ.");
    }
    if (subtotal < voucher.minOrderValue) {
      throw new Error("Đơn hàng chưa đạt giá trị tối thiểu của mã giảm giá.");
    }
    if ((voucher.quantity !== undefined && voucher.quantity <= 0) ||
        (voucher.status && voucher.status !== "active")) {
      throw new Error("Mã giảm giá đã hết lượt hoặc ngừng hoạt động.");
    }

    return {
      ...voucher,
      discount: calculateVoucherDiscount(voucher, subtotal),
    };
  }

  async function cancelOrder(orderId: string) {
    if (!/^\d+$/.test(user.id) || !/^\d+$/.test(orderId)) {
      throw new Error("Vui lòng đăng nhập để hủy đơn hàng đã lưu của bạn.");
    }

    const cancelledOrder = await cancelBackendOrder(
      user.id,
      orderId,
      new Map(products.map((product) => [product.id, product])),
    );

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? cancelledOrder : order,
      ),
    );
    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        const cancelledItems = cancelledOrder.items.filter(
          (item) => item.product.id === product.id,
        );
        const quantity = cancelledItems.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        if (!quantity) return product;
        return {
          ...product,
          stock: product.stock + quantity,
          variants: product.variants?.map((variant) => {
            const variantQuantity = cancelledItems
              .filter((item) => item.variant?.id === variant.id)
              .reduce((total, item) => total + item.quantity, 0);
            return variantQuantity
              ? { ...variant, stock: variant.stock + variantQuantity }
              : variant;
          }),
        };
      }),
    );
    void refreshVouchers().catch(() => {});
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await changeBackendPassword(user.id, currentPassword, newPassword);
  }

  const value: ShopContextValue = {
    addresses,
    cartCount,
    cartItems,
    cartLines,
    cartSummary,
    categories,
    dataSource,
    favoriteIds,
    favoriteProducts,
    isLoadingBackend,
    orders,
    products,
    selectedAddress,
    selectedCartLines,
    selectedCartSummary,
    user,
    vouchers,
    addAddress,
    addToCart,
    cancelOrder,
    changePassword,
    clearAuthenticatedUser,
    deleteAddress,
    editAddress,
    getCategoryById,
    getProductById,
    isFavorite,
    placeOrder,
    removeCartItem,
    refreshOrders,
    refreshProducts,
    refreshVouchers,
    saveUserProfile,
    setAuthenticatedUser,
    setDefaultAddress,
    toggleCartItemSelected,
    toggleFavorite,
    updateCartQuantity,
    validateVoucherCode,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
