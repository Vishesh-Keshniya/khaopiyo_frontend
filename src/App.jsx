import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Coffee,
  Cigarette,
  Search,
  Plus,
  Minus,
  Trash2,
  Pencil,
  Check,
  X,
  Package,
  Users,
  ShoppingCart,
  IndianRupee,
  BarChart3,
  History,
  Menu,
  Home,
  RefreshCw,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  Utensils,
  CakeSlice,
  GlassWater,
} from "lucide-react";

import "./App.css";

/* =========================================================
   API
========================================================= */

const API = "https://khaopiyo-blush.vercel.app";

/* =========================================================
   HELPERS
========================================================= */

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const getProductId = (product) =>
  product?._id || product?.id || product?.productId;

const getOrderId = (order) =>
  order?._id || order?.id || order?.orderId;

const getCategoryIcon = (category) => {
  const value = String(category || "").toLowerCase();

  if (value.includes("chai") || value.includes("tea")) {
    return <Coffee size={20} />;
  }

  if (value.includes("coffee")) {
    return <Coffee size={20} />;
  }

  if (value.includes("cigarette") || value.includes("smoke")) {
    return <Cigarette size={20} />;
  }

  if (value.includes("drink") || value.includes("cold")) {
    return <GlassWater size={20} />;
  }

  if (
    value.includes("burger") ||
    value.includes("food") ||
    value.includes("snack")
  ) {
    return <Utensils size={20} />;
  }

  if (value.includes("cake") || value.includes("sweet")) {
    return <CakeSlice size={20} />;
  }

  return <Package size={20} />;
};

const defaultCategories = [
  "All",
  "Cigarette",
  "Chai",
  "Coffee",
  "Food",
  "Drinks",
  "Other",
];

/* =========================================================
   APP
========================================================= */

export default function App() {
  /* =======================================================
     PAGE
  ======================================================= */

  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    category: "Other",
    price: "",
    available: true,
  });

  /* =======================================================
     CUSTOMERS / ORDERS
  ======================================================= */

  const [customers, setCustomers] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  /* =======================================================
     PRODUCT PICKER
  ======================================================= */

  const [showProductPicker, setShowProductPicker] = useState(false);
  const [pickerCustomerId, setPickerCustomerId] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState("All");

  /* =======================================================
     HISTORY
  ======================================================= */

  const [orders, setOrders] = useState([]);
  const [historySearch, setHistorySearch] = useState("");

  /* =======================================================
     BILL
  ======================================================= */

  const [showBill, setShowBill] = useState(false);
  const [billCustomer, setBillCustomer] = useState(null);

  /* =======================================================
     UI
  ======================================================= */

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API}/api/products`);

      const data = response.data?.data || [];

      setProducts(data);
      setError("");
    } catch (err) {
      console.error("Load products error:", err);

      setError(
        "Unable to load products. Please check the server and API connection."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD ORDER HISTORY
  ======================================================= */

  const loadOrders = async () => {
    try {
      const response = await axios.get(`${API}/api/orders/history`);

      const data = response.data?.data || [];

      setOrders(data);
    } catch (err) {
      console.error("Load order history error:", err);

      setOrders([]);
    }
  };

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const existing = products
      .map((item) => item.category)
      .filter(Boolean);

    return [...new Set([...defaultCategories, ...existing])];
  }, [products]);

  /* =======================================================
     FILTERED PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const searchMatch = String(item.name || "")
        .toLowerCase()
        .includes(productSearch.toLowerCase());

      const categoryMatch =
        selectedCategory === "All" ||
        String(item.category || "").toLowerCase() ===
          selectedCategory.toLowerCase();

      return searchMatch && categoryMatch;
    });
  }, [products, productSearch, selectedCategory]);

  /* =======================================================
     PRODUCT FORM
  ======================================================= */

  const openAddProduct = () => {
    setEditingProduct(null);

    setProductForm({
      name: "",
      category: "Other",
      price: "",
      available: true,
    });

    setShowProductForm(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);

    setProductForm({
      name: product.name || "",
      category: product.category || "Other",
      price: product.price || "",
      available: product.available !== false,
    });

    setShowProductForm(true);
  };

  const handleProductForm = (event) => {
    const { name, value, type, checked } = event.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!productForm.name.trim()) {
      showToast("Please enter a product name.", "error");
      return;
    }

    if (!productForm.price || Number(productForm.price) <= 0) {
      showToast("Please enter a valid price.", "error");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: productForm.name.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        available: productForm.available,
      };

      if (editingProduct) {
        await axios.put(
          `${API}/api/products/${getProductId(editingProduct)}`,
          payload
        );

        showToast("Product updated successfully.");
      } else {
        await axios.post(`${API}/api/products`, payload);

        showToast("Product added successfully.");
      }

      setShowProductForm(false);
      setEditingProduct(null);

      await loadProducts();
    } catch (err) {
      console.error("Save product error:", err);

      showToast(
        err?.response?.data?.message ||
          "Unable to save the product. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  const deleteProduct = async (product) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API}/api/products/${getProductId(product)}`
      );

      showToast("Product deleted successfully.");

      await loadProducts();
    } catch (err) {
      console.error("Delete product error:", err);

      showToast(
        "Unable to delete the product. Please try again.",
        "error"
      );
    }
  };

  /* =======================================================
     TOGGLE PRODUCT
  ======================================================= */

  const toggleProductAvailability = async (product) => {
    try {
      await axios.put(
        `${API}/api/products/${getProductId(product)}`,
        {
          ...product,
          available: product.available === false,
        }
      );

      await loadProducts();

      showToast(
        product.available === false
          ? "Product enabled successfully."
          : "Product disabled successfully."
      );
    } catch (err) {
      console.error("Update availability error:", err);

      showToast(
        "Unable to update product availability. Please try again.",
        "error"
      );
    }
  };

  /* =======================================================
     CUSTOMER
  ======================================================= */

  const createCustomer = () => {
    if (!customerName.trim()) {
      showToast("Please enter a customer name.", "error");
      return;
    }

    const newCustomer = {
      id: Date.now(),
      name: customerName.trim(),
      items: [],
      createdAt: new Date(),
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    setCustomerName("");
    setShowCustomerForm(false);

    showToast("Customer added successfully.");
  };

  /* =======================================================
     CUSTOMER TOTAL
  ======================================================= */

  const getCustomerTotal = (customer) => {
    return customer.items.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  };

  const getCustomerQuantity = (customer) => {
    return customer.items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  };

  /* =======================================================
     ADD PRODUCT TO CUSTOMER
  ======================================================= */

  const openProductPicker = (customerId) => {
    setPickerCustomerId(customerId);
    setPickerSearch("");
    setPickerCategory("All");
    setShowProductPicker(true);
  };

  const addProductToCustomer = (product) => {
    if (product.available === false) {
      showToast("This product is currently unavailable.", "error");
      return;
    }

    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== pickerCustomerId) {
          return customer;
        }

        const existing = customer.items.find(
          (item) =>
            getProductId(item.product) === getProductId(product)
        );

        if (existing) {
          return {
            ...customer,
            items: customer.items.map((item) =>
              getProductId(item.product) === getProductId(product)
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item
            ),
          };
        }

        return {
          ...customer,
          items: [
            ...customer.items,
            {
              product,
              quantity: 1,
              price: Number(product.price),
            },
          ],
        };
      })
    );

    showToast(`${product.name} added successfully.`);
  };

  /* =======================================================
     CHANGE QUANTITY
  ======================================================= */

  const changeQuantity = (customerId, productId, change) => {
    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== customerId) {
          return customer;
        }

        return {
          ...customer,

          items: customer.items
            .map((item) => {
              if (getProductId(item.product) !== productId) {
                return item;
              }

              return {
                ...item,
                quantity: item.quantity + change,
              };
            })
            .filter((item) => item.quantity > 0),
        };
      })
    );
  };

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  const removeItem = (customerId, productId) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              items: customer.items.filter(
                (item) =>
                  getProductId(item.product) !== productId
              ),
            }
          : customer
      )
    );
  };

  /* =======================================================
     DELETE CUSTOMER
  ======================================================= */

  const deleteCustomer = (customerId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this customer's current order?"
    );

    if (!confirmDelete) return;

    setCustomers((prev) =>
      prev.filter((customer) => customer.id !== customerId)
    );

    showToast("Customer order removed.");
  };

  /* =======================================================
     QUICK ADD
  ======================================================= */

  const quickAdd = (customerId, product) => {
    setPickerCustomerId(customerId);

    setCustomers((prev) =>
      prev.map((customer) => {
        if (customer.id !== customerId) return customer;

        const existing = customer.items.find(
          (item) =>
            getProductId(item.product) === getProductId(product)
        );

        if (existing) {
          return {
            ...customer,
            items: customer.items.map((item) =>
              getProductId(item.product) === getProductId(product)
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item
            ),
          };
        }

        return {
          ...customer,
          items: [
            ...customer.items,
            {
              product,
              quantity: 1,
              price: Number(product.price),
            },
          ],
        };
      })
    );

    showToast(`${product.name} added successfully.`);
  };

  /* =======================================================
     SAVE / COMPLETE ORDER
  ======================================================= */

  const completeOrder = async (customer) => {
    if (!customer.items.length) {
      showToast(
        "Please add at least one item before completing the order.",
        "error"
      );
      return;
    }

    const total = getCustomerTotal(customer);

    try {
      setLoading(true);

      /* -----------------------------------------------
         STEP 1: CREATE ACTIVE ORDER
      ------------------------------------------------ */

      const createResponse = await axios.post(
        `${API}/api/orders`,
        {
          customerName: customer.name,
        }
      );

      const order = createResponse.data?.data;

      if (!order?._id) {
        throw new Error(
          "Order ID was not returned by the server."
        );
      }

      /* -----------------------------------------------
         STEP 2: SAVE ORDER ITEMS
      ------------------------------------------------ */

      await axios.put(
        `${API}/api/orders/${order._id}`,
        {
          customerName: customer.name,

          items: customer.items.map((item) => ({
            productId: getProductId(item.product),
            name: item.product.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            subtotal:
              Number(item.price) * Number(item.quantity),
          })),

          total,

          status: "active",
        }
      );

      /* -----------------------------------------------
         STEP 3: COMPLETE ORDER
      ------------------------------------------------ */

      await axios.patch(
        `${API}/api/orders/${order._id}/complete`
      );

      /* -----------------------------------------------
         UPDATE UI
      ------------------------------------------------ */

      setCustomers((prev) =>
        prev.filter((item) => item.id !== customer.id)
      );

      await loadOrders();

      openBill({
        ...customer,
        total,
      });

      showToast("Order completed successfully.");
    } catch (err) {
      console.error("Complete order error:", err);

      showToast(
        err?.response?.data?.message ||
          "Unable to complete the order. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     BILL
  ======================================================= */

  const openBill = (customer) => {
    setBillCustomer(customer);
    setShowBill(true);
  };

  /* =======================================================
     HISTORY FILTER
  ======================================================= */

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      String(order.customerName || "")
        .toLowerCase()
        .includes(historySearch.toLowerCase())
    );
  }, [orders, historySearch]);

  /* =======================================================
     TODAY SALES
  ======================================================= */

  const todaySales = useMemo(() => {
    const today = new Date().toDateString();

    return orders
      .filter((order) => {
        const date = new Date(
          order.createdAt || order.date || Date.now()
        );

        return date.toDateString() === today;
      })
      .reduce(
        (total, order) => total + Number(order.total || 0),
        0
      );
  }, [orders]);

  /* =======================================================
     TODAY ORDER COUNT
  ======================================================= */

  const todayOrderCount = useMemo(() => {
    const today = new Date().toDateString();

    return orders.filter((order) => {
      const date = new Date(
        order.createdAt || order.date || Date.now()
      );

      return date.toDateString() === today;
    }).length;
  }, [orders]);

  /* =======================================================
     ACTIVE SALES
  ======================================================= */

  const activeSales = useMemo(() => {
    return customers.reduce(
      (total, customer) =>
        total + getCustomerTotal(customer),
      0
    );
  }, [customers]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigate = (page) => {
    setActivePage(page);
    setMobileMenu(false);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="app">

      {/* ===================================================
          MOBILE OVERLAY
      =================================================== */}

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`sidebar ${
          mobileMenu ? "mobile-open" : ""
        }`}
      >

        <div className="brand">

          <div className="brand-logo">
            <Coffee size={27} />
          </div>

          <div>
            <h1>Khao Piyo</h1>
            <span>Fuko Cafe</span>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={21} />
          </button>

        </div>

        <div className="nav-section">

          <p className="nav-title">
            MAIN
          </p>

          <button
            className={`nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => navigate("dashboard")}
          >
            <Home size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "products"
                ? "active"
                : ""
            }`}
            onClick={() => navigate("products")}
          >
            <Package size={19} />
            <span>Products</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "history"
                ? "active"
                : ""
            }`}
            onClick={() => navigate("history")}
          >
            <History size={19} />
            <span>Order History</span>
          </button>

        </div>

        <div className="sidebar-bottom">

          <div className="sidebar-info">

            <div className="sidebar-info-icon">
              <BarChart3 size={18} />
            </div>

            <div>
              <strong>{money(todaySales)}</strong>
              <span>Today's sales</span>
            </div>

          </div>

        </div>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="main">

        {/* HEADER */}

        <header className="topbar">

          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={23} />
          </button>

          <div className="topbar-title">

            <h2>
              {activePage === "dashboard" &&
                "Dashboard"}

              {activePage === "products" &&
                "Product Management"}

              {activePage === "history" &&
                "Order History"}
            </h2>

            <p>
              Manage your cafe orders easily
            </p>

          </div>

          <button
            className="refresh-button"
            onClick={() => {
              loadProducts();
              loadOrders();
              showToast(
                "Data refreshed successfully."
              );
            }}
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>

        </header>

        {/* CONTENT */}

        <div className="content">

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activePage === "dashboard" && (
            <>

              {/* STATS */}

              <section className="stats-grid">

                <div className="stat-card">

                  <div className="stat-icon purple">
                    <Users size={23} />
                  </div>

                  <div>
                    <span>Active Customers</span>
                    <strong>{customers.length}</strong>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon orange">
                    <ShoppingCart size={23} />
                  </div>

                  <div>
                    <span>Active Orders</span>
                    <strong>{customers.length}</strong>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon green">
                    <IndianRupee size={23} />
                  </div>

                  <div>
                    <span>Today's Sales</span>
                    <strong>
                      {money(todaySales)}
                    </strong>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon blue">
                    <CheckCircle2 size={23} />
                  </div>

                  <div>
                    <span>Completed Orders</span>
                    <strong>
                      {todayOrderCount}
                    </strong>
                  </div>

                </div>

              </section>

              {/* DASHBOARD HEADER */}

              <div className="section-header">

                <div>
                  <h3>Current Customers</h3>

                  <p>
                    Keep adding items as the customer orders
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() =>
                    setShowCustomerForm(true)
                  }
                >
                  <Plus size={19} />
                  New Customer
                </button>

              </div>

              {/* QUICK PRODUCTS */}

              <div className="quick-products">

                <div className="quick-products-header">

                  <div>
                    <h3>Quick Add</h3>

                    <p>
                      Fast access to your frequently used items
                    </p>
                  </div>

                </div>

                <div className="quick-product-list">

                  {products
                    .filter(
                      (product) =>
                        product.available !== false
                    )
                    .slice(0, 8)
                    .map((product) => (

                      <div
                        className="quick-product"
                        key={getProductId(product)}
                        onClick={() => {

                          if (!customers.length) {
                            showToast(
                              "Please create a customer first.",
                              "error"
                            );
                            return;
                          }

                          quickAdd(
                            customers[0].id,
                            product
                          );

                        }}
                      >

                        <div className="quick-product-icon">
                          {getCategoryIcon(
                            product.category
                          )}
                        </div>

                        <div className="quick-product-info">

                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            {money(product.price)}
                          </span>

                        </div>

                        <Plus size={17} />

                      </div>

                    ))}

                </div>

              </div>

              {/* CUSTOMER CARDS */}

              {customers.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    <Users size={40} />
                  </div>

                  <h3>No active customers</h3>

                  <p>
                    Create a customer order to get started.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() =>
                      setShowCustomerForm(true)
                    }
                  >
                    <Plus size={18} />
                    Add First Customer
                  </button>

                </div>

              ) : (

                <div className="customer-grid">

                  {customers.map((customer) => (

                    <div
                      className="customer-card"
                      key={customer.id}
                    >

                      {/* CUSTOMER HEADER */}

                      <div className="customer-header">

                        <div className="customer-profile">

                          <div className="avatar">
                            {customer.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <h3>
                              {customer.name}
                            </h3>

                            <span>
                              <Clock size={13} />
                              Active order
                            </span>

                          </div>

                        </div>

                        <button
                          className="icon-button danger-light"
                          onClick={() =>
                            deleteCustomer(
                              customer.id
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                      {/* ITEMS */}

                      <div className="customer-items">

                        {customer.items.length === 0 ? (

                          <div className="customer-empty">

                            <ShoppingCart size={24} />

                            <span>
                              No items added yet
                            </span>

                          </div>

                        ) : (

                          customer.items.map((item) => (

                            <div
                              className="order-item"
                              key={getProductId(
                                item.product
                              )}
                            >

                              <div className="order-item-info">

                                <div className="order-item-icon">
                                  {getCategoryIcon(
                                    item.product.category
                                  )}
                                </div>

                                <div>

                                  <strong>
                                    {item.product.name}
                                  </strong>

                                  <span>
                                    {money(item.price)} each
                                  </span>

                                </div>

                              </div>

                              <div className="quantity-box">

                                <button
                                  onClick={() =>
                                    changeQuantity(
                                      customer.id,
                                      getProductId(
                                        item.product
                                      ),
                                      -1
                                    )
                                  }
                                >
                                  <Minus size={14} />
                                </button>

                                <strong>
                                  {item.quantity}
                                </strong>

                                <button
                                  onClick={() =>
                                    changeQuantity(
                                      customer.id,
                                      getProductId(
                                        item.product
                                      ),
                                      1
                                    )
                                  }
                                >
                                  <Plus size={14} />
                                </button>

                              </div>

                              <strong className="item-total">
                                {money(
                                  item.price *
                                    item.quantity
                                )}
                              </strong>

                              <button
                                className="remove-item"
                                onClick={() =>
                                  removeItem(
                                    customer.id,
                                    getProductId(
                                      item.product
                                    )
                                  )
                                }
                              >
                                <X size={15} />
                              </button>

                            </div>

                          ))

                        )}

                      </div>

                      {/* ADD ITEM */}

                      <button
                        className="add-item-button"
                        onClick={() =>
                          openProductPicker(
                            customer.id
                          )
                        }
                      >
                        <Plus size={17} />
                        Add Item
                      </button>

                      {/* FOOTER */}

                      <div className="customer-footer">

                        <div>

                          <span>
                            {getCustomerQuantity(
                              customer
                            )}{" "}
                            items
                          </span>

                          <strong>
                            {money(
                              getCustomerTotal(
                                customer
                              )
                            )}
                          </strong>

                        </div>

                        <button
                          className="done-button"
                          onClick={() =>
                            completeOrder(
                              customer
                            )
                          }
                          disabled={
                            !customer.items.length ||
                            loading
                          }
                        >
                          <Check size={17} />
                          Done
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </>
          )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {activePage === "products" && (
            <>

              <div className="page-card">

                <div className="product-page-header">

                  <div>

                    <h3>Products</h3>

                    <p>
                      Add and manage all cafe items and prices
                    </p>

                  </div>

                  <button
                    className="primary-button"
                    onClick={openAddProduct}
                  >
                    <Plus size={18} />
                    Add Product
                  </button>

                </div>

                {/* SEARCH */}

                <div className="product-toolbar">

                  <div className="search-box">

                    <Search size={19} />

                    <input
                      value={productSearch}
                      onChange={(e) =>
                        setProductSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search products..."
                    />

                    {productSearch && (
                      <button
                        onClick={() =>
                          setProductSearch("")
                        }
                      >
                        <X size={16} />
                      </button>
                    )}

                  </div>

                </div>

                {/* CATEGORIES */}

                <div className="category-list">

                  {categories.map((category) => (

                    <button
                      key={category}
                      className={
                        selectedCategory === category
                          ? "category active"
                          : "category"
                      }
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                    >
                      {category}
                    </button>

                  ))}

                </div>

                {/* PRODUCTS */}

                {loading ? (

                  <div className="loading">
                    Loading products...
                  </div>

                ) : filteredProducts.length === 0 ? (

                  <div className="empty-state small">

                    <Package size={35} />

                    <h3>No products found</h3>

                    <p>
                      Try changing the search or category.
                    </p>

                  </div>

                ) : (

                  <div className="product-grid">

                    {filteredProducts.map((product) => (

                      <div
                        className={`product-card ${
                          product.available === false
                            ? "unavailable"
                            : ""
                        }`}
                        key={getProductId(product)}
                      >

                        <div className="product-card-top">

                          <div className="product-icon">
                            {getCategoryIcon(
                              product.category
                            )}
                          </div>

                          <span
                            className={
                              product.available === false
                                ? "status unavailable"
                                : "status"
                            }
                          >
                            {product.available === false
                              ? "Unavailable"
                              : "Available"}
                          </span>

                        </div>

                        <div className="product-card-body">

                          <span className="product-category">
                            {product.category ||
                              "Other"}
                          </span>

                          <h3>{product.name}</h3>

                          <strong>
                            {money(product.price)}
                          </strong>

                        </div>

                        <div className="product-actions">

                          <button
                            className="availability-button"
                            onClick={() =>
                              toggleProductAvailability(
                                product
                              )
                            }
                          >
                            {product.available === false
                              ? "Enable"
                              : "Disable"}
                          </button>

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditProduct(
                                product
                              )
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteProduct(
                                product
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </>
          )}

          {/* =================================================
              HISTORY
          ================================================= */}

          {activePage === "history" && (
            <>

              <div className="history-stats">

                <div className="history-stat">

                  <span>Total Orders</span>

                  <strong>
                    {orders.length}
                  </strong>

                </div>

                <div className="history-stat">

                  <span>Today's Orders</span>

                  <strong>
                    {todayOrderCount}
                  </strong>

                </div>

                <div className="history-stat">

                  <span>Today's Sales</span>

                  <strong>
                    {money(todaySales)}
                  </strong>

                </div>

              </div>

              <div className="page-card">

                <div className="product-page-header">

                  <div>

                    <h3>Order History</h3>

                    <p>
                      Completed customer orders
                    </p>

                  </div>

                  <div className="search-box history-search">

                    <Search size={18} />

                    <input
                      value={historySearch}
                      onChange={(e) =>
                        setHistorySearch(
                          e.target.value
                        )
                      }
                      placeholder="Search customer..."
                    />

                  </div>

                </div>

                {filteredOrders.length === 0 ? (

                  <div className="empty-state">

                    <div className="empty-icon">
                      <History size={38} />
                    </div>

                    <h3>No orders yet</h3>

                    <p>
                      Completed orders will appear here.
                    </p>

                  </div>

                ) : (

                  <div className="history-list">

                    {filteredOrders.map(
                      (order, index) => {

                        const date = new Date(
                          order.createdAt ||
                            order.date ||
                            Date.now()
                        );

                        return (

                          <div
                            className="history-row"
                            key={
                              getOrderId(order) ||
                              index
                            }
                          >

                            <div className="history-customer">

                              <div className="avatar small-avatar">

                                {String(
                                  order.customerName ||
                                    "C"
                                )
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>

                              <div>

                                <strong>
                                  {order.customerName ||
                                    "Customer"}
                                </strong>

                                <span>
                                  {date.toLocaleDateString(
                                    "en-IN"
                                  )}{" "}
                                  •{" "}
                                  {date.toLocaleTimeString(
                                    "en-IN",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>

                              </div>

                            </div>

                            <div className="history-items">
                              {order.items?.length || 0}{" "}
                              items
                            </div>

                            <strong className="history-total">
                              {money(order.total)}
                            </strong>

                            <button
                              className="view-button"
                              onClick={() =>
                                openBill({
                                  name:
                                    order.customerName ||
                                    "Customer",
                                  items:
                                    order.items || [],
                                  total:
                                    order.total || 0,
                                  createdAt:
                                    order.createdAt,
                                })
                              }
                            >
                              <Receipt size={16} />
                              View
                            </button>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

            </>
          )}

        </div>

      </main>

      {/* =====================================================
          CUSTOMER MODAL
      ===================================================== */}

      {showCustomerForm && (

        <div className="modal-backdrop">

          <div className="modal customer-modal">

            <div className="modal-header">

              <div>

                <h3>New Customer</h3>

                <p>
                  Create an active customer order
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowCustomerForm(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="modal-body">

              <label>
                Customer Name
              </label>

              <input
                autoFocus
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createCustomer();
                  }
                }}
                placeholder="e.g. Rahul"
              />

            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setShowCustomerForm(false)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={createCustomer}
              >
                <Plus size={18} />
                Create Customer
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          PRODUCT FORM MODAL
      ===================================================== */}

      {showProductForm && (

        <div className="modal-backdrop">

          <div className="modal">

            <div className="modal-header">

              <div>

                <h3>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h3>

                <p>
                  Set product name, category and price
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowProductForm(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={saveProduct}
              className="product-form"
            >

              <div className="form-group">

                <label>
                  Product Name
                </label>

                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleProductForm}
                  placeholder="e.g. Cutting Chai"
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductForm}
                  >

                    {categories
                      .filter(
                        (item) => item !== "All"
                      )
                      .map((category) => (

                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>

                      ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Price
                  </label>

                  <div className="price-input">

                    <span>₹</span>

                    <input
                      name="price"
                      type="number"
                      min="0"
                      value={productForm.price}
                      onChange={handleProductForm}
                      placeholder="0"
                    />

                  </div>

                </div>

              </div>

              <label className="checkbox-row">

                <input
                  name="available"
                  type="checkbox"
                  checked={
                    productForm.available
                  }
                  onChange={handleProductForm}
                />

                <span>
                  Product available for ordering
                </span>

              </label>

              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowProductForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Check size={18} />

                  {editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          PRODUCT PICKER MODAL
      ===================================================== */}

      {showProductPicker && (

        <div className="modal-backdrop">

          <div className="modal product-picker">

            <div className="modal-header">

              <div>

                <h3>
                  Add Item
                </h3>

                <p>
                  Select a product for this customer
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowProductPicker(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="picker-toolbar">

              <div className="search-box">

                <Search size={18} />

                <input
                  autoFocus
                  value={pickerSearch}
                  onChange={(e) =>
                    setPickerSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search item..."
                />

              </div>

              <div className="category-list">

                {categories.map((category) => (

                  <button
                    key={category}
                    className={
                      pickerCategory === category
                        ? "category active"
                        : "category"
                    }
                    onClick={() =>
                      setPickerCategory(
                        category
                      )
                    }
                  >
                    {category}
                  </button>

                ))}

              </div>

            </div>

            <div className="picker-products">

              {products
                .filter(
                  (product) =>
                    product.available !== false
                )
                .filter((product) => {

                  const searchMatch =
                    String(product.name || "")
                      .toLowerCase()
                      .includes(
                        pickerSearch.toLowerCase()
                      );

                  const categoryMatch =
                    pickerCategory === "All" ||
                    String(
                      product.category || ""
                    )
                      .toLowerCase() ===
                      pickerCategory.toLowerCase();

                  return (
                    searchMatch &&
                    categoryMatch
                  );
                })
                .map((product) => (

                  <button
                    className="picker-product"
                    key={getProductId(product)}
                    onClick={() => {
                      addProductToCustomer(
                        product
                      );
                      setShowProductPicker(false);
                    }}
                  >

                    <div className="picker-product-icon">
                      {getCategoryIcon(
                        product.category
                      )}
                    </div>

                    <div>

                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {product.category}
                      </span>

                    </div>

                    <strong>
                      {money(product.price)}
                    </strong>

                    <Plus size={18} />

                  </button>

                ))}

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          BILL MODAL
      ===================================================== */}

      {showBill && billCustomer && (

        <div className="modal-backdrop">

          <div className="modal bill-modal">

            <div className="modal-header">

              <div>

                <h3>
                  Order Bill
                </h3>

                <p>
                  {billCustomer.name ||
                    billCustomer.customerName}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowBill(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="bill-content">

              <div className="bill-title">

                <div className="bill-logo">
                  <Coffee size={22} />
                </div>

                <div>

                  <strong>
                    Khao Piyo Fuko
                  </strong>

                  <span>
                    Order Summary
                  </span>

                </div>

              </div>

              <div className="bill-items">

                {(billCustomer.items || []).map(
                  (item, index) => {

                    const itemName =
                      item.product?.name ||
                      item.name ||
                      "Item";

                    const quantity =
                      item.quantity || 0;

                    const price =
                      item.price || 0;

                    return (

                      <div
                        className="bill-row"
                        key={index}
                      >

                        <div>

                          <strong>
                            {itemName}
                          </strong>

                          <span>
                            {quantity} ×{" "}
                            {money(price)}
                          </span>

                        </div>

                        <strong>
                          {money(
                            quantity * price
                          )}
                        </strong>

                      </div>

                    );
                  }
                )}

              </div>

              <div className="bill-total">

                <span>
                  Total
                </span>

                <strong>
                  {money(
                    billCustomer.total ||
                      getCustomerTotal(
                        billCustomer
                      )
                  )}
                </strong>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="primary-button full-width"
                onClick={() =>
                  setShowBill(false)
                }
              >
                <Check size={18} />
                Done
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (

        <div
          className={`toast ${
            toast.type === "error"
              ? "toast-error"
              : ""
          }`}
        >

          {toast.type === "error" ? (
            <AlertCircle size={19} />
          ) : (
            <CheckCircle2 size={19} />
          )}

          <span>
            {toast.message}
          </span>

        </div>

      )}

    </div>
  );
}