"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isLoading: true,
      orderId: "",
      order: null,
      allOrders: [],
      // 存储所有订单
      currentOrderIndex: 0,
      // 当前显示的订单索引
      apiBaseUrl: "http://localhost:3001/api",
      userId: 2
      // 默认用户ID
    };
  },
  onLoad(options) {
    console.log("订单详情页面加载, 参数:", options);
    if (options.userId) {
      this.userId = options.userId;
      console.log("使用传入的用户ID:", this.userId);
    }
    this.fetchOrderDetail();
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    fetchOrderDetail() {
      this.isLoading = true;
      console.log("开始获取所有订单数据");
      console.log(`正在请求用户ID ${this.userId} 的订单数据`);
      common_vendor.index.request({
        url: `${this.apiBaseUrl}/orders/user/${this.userId}`,
        method: "GET",
        success: (res) => {
          var _a;
          console.log("API返回数据:", res.data);
          if (res.data && res.data.status === "success") {
            const orderList = res.data.data;
            console.log(`用户ID ${this.userId} 的所有订单列表:`, orderList);
            console.log("订单数量:", orderList.length);
            if (orderList && orderList.length > 0) {
              this.allOrders = orderList.map((order) => this.formatOrderData(order));
              console.log(`加载了 ${this.allOrders.length} 个订单`);
              this.allOrders.forEach((order, index) => {
                console.log(`订单 ${index + 1}/${this.allOrders.length}:`, {
                  id: order.id,
                  商品: order.products.map((p) => p.name).join(", "),
                  金额: order.total_amount,
                  状态: this.getStatusText(order.status)
                });
              });
              this.currentOrderIndex = 0;
              this.order = this.allOrders[0];
              console.log("当前显示订单:", this.order);
              if (this.allOrders.length > 1) {
                setTimeout(() => {
                  common_vendor.index.showToast({
                    title: `发现${this.allOrders.length}个订单，上下滑动可切换`,
                    icon: "none",
                    duration: 2e3
                  });
                }, 500);
              }
            } else {
              this.allOrders = [];
              this.order = null;
              common_vendor.index.showToast({
                title: "暂无订单数据",
                icon: "none"
              });
            }
          } else {
            console.error("API返回错误:", res.data);
            common_vendor.index.showToast({
              title: ((_a = res.data) == null ? void 0 : _a.message) || "获取订单详情失败",
              icon: "none"
            });
            this.useFallbackData();
          }
        },
        fail: (err) => {
          console.error("获取订单详情失败:", err);
          common_vendor.index.showToast({
            title: "获取订单详情失败，请检查网络",
            icon: "none"
          });
          this.useFallbackData();
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    },
    // 处理滑动切换订单
    handleOrderChange(e) {
      const index = e.detail.current;
      console.log("滑动切换至订单索引:", index);
      this.currentOrderIndex = index;
      this.order = this.allOrders[index];
      const direction = index > e.detail.source ? "↑" : "↓";
      common_vendor.index.showToast({
        title: `${direction} 订单 ${index + 1}/${this.allOrders.length}`,
        icon: "none",
        duration: 1e3
      });
    },
    // 获取滑动提示文本
    getSwipeHintText(index) {
      if (this.allOrders.length <= 1)
        return "";
      if (index === 0) {
        return "↑ 向上滑动查看下一订单";
      } else if (index === this.allOrders.length - 1) {
        return "↓ 向下滑动查看上一订单";
      } else {
        return "↕ 上下滑动切换订单";
      }
    },
    // 格式化订单数据
    formatOrderData(orderData) {
      if (!orderData)
        return null;
      let productImage = orderData.product_image;
      if (productImage && productImage.startsWith("/uploads/")) {
        productImage = `${this.apiBaseUrl.replace("/api", "")}${productImage}`;
      }
      return {
        id: orderData.id,
        order_number: orderData.order_number || `ORD${orderData.id}`,
        status: orderData.status || 1,
        // 如果没有状态，默认为待发货状态（已支付）
        total_amount: orderData.total_price || "0.00",
        created_at: orderData.created_at,
        payment_time: orderData.payment_time || (/* @__PURE__ */ new Date()).toLocaleString(),
        // 处理商品数据
        products: Array.isArray(orderData.products) ? orderData.products.map((p) => {
          let image = p.image;
          if (image && image.startsWith("/uploads/")) {
            image = `${this.apiBaseUrl.replace("/api", "")}${image}`;
          }
          return { ...p, image };
        }) : [
          {
            id: orderData.product_id,
            name: orderData.product_name,
            price: orderData.product_price,
            quantity: orderData.quantity,
            image: productImage
          }
        ]
      };
    },
    // 使用模拟数据作为备选
    useFallbackData() {
      const mockOrders = [
        {
          id: "1001",
          order_number: "O2023051001",
          status: 1,
          // 待发货（已支付）
          total_amount: "299.00",
          created_at: "2023-05-10 14:30:00",
          payment_time: "2023-05-10 14:35:00",
          products: [
            {
              id: "101",
              name: "竹编包包",
              price: "299.00",
              quantity: 1,
              image: "/uploads/assets/商品/卖竹编包包1.jpg"
            }
          ]
        },
        {
          id: "1002",
          order_number: "O2023051002",
          status: 2,
          // 待收货
          total_amount: "599.00",
          created_at: "2023-05-12 10:20:00",
          payment_time: "2023-05-12 10:25:00",
          products: [
            {
              id: "102",
              name: "传统手工艺品",
              price: "599.00",
              quantity: 1,
              image: "/uploads/assets/商品/卖竹编包包1.jpg"
            }
          ]
        },
        {
          id: "1003",
          order_number: "O2023051003",
          status: 3,
          // 已完成
          total_amount: "199.00",
          created_at: "2023-05-15 16:40:00",
          payment_time: "2023-05-15 16:45:00",
          products: [
            {
              id: "103",
              name: "民族风饰品",
              price: "199.00",
              quantity: 1,
              image: "/uploads/assets/商品/卖竹编包包1.jpg"
            }
          ]
        }
      ];
      this.allOrders = mockOrders.map((order) => {
        const products = order.products.map((p) => {
          if (p.image && p.image.startsWith("/uploads/")) {
            p.image = `${this.apiBaseUrl.replace("/api", "")}${p.image}`;
          }
          return p;
        });
        return { ...order, products };
      });
      this.currentOrderIndex = 0;
      this.order = this.allOrders[0];
      console.log("使用模拟数据:", this.allOrders);
      if (this.allOrders.length > 1) {
        setTimeout(() => {
          common_vendor.index.showToast({
            title: `加载了${this.allOrders.length}个模拟订单，上下滑动可切换`,
            icon: "none",
            duration: 2e3
          });
        }, 500);
      }
    },
    getStatusText(status) {
      const statusMap = {
        0: "待付款",
        1: "待发货",
        2: "待收货",
        3: "已完成",
        4: "已取消"
      };
      return statusMap[status] || "未知状态";
    },
    getStatusDesc(status) {
      const descMap = {
        0: "请在24小时内完成支付，超时订单将自动取消",
        1: "商家正在备货中，请耐心等待",
        2: "商品已发出，请注意查收",
        3: "订单已完成，感谢您的购买",
        4: "订单已取消"
      };
      return descMap[status] || "";
    },
    getStatusIconText(status) {
      const iconMap = {
        0: "付",
        1: "备",
        2: "运",
        3: "完",
        4: "取"
      };
      return iconMap[status] || "?";
    },
    getProductsTotal(products) {
      if (!products || !products.length)
        return "0.00";
      const total = products.reduce((sum, product) => {
        return sum + parseFloat(product.price) * (product.quantity || 1);
      }, 0);
      return total.toFixed(2);
    },
    viewProduct(productId) {
      if (!productId)
        return;
      common_vendor.index.navigateTo({
        url: `/pages/buy/detail?id=${productId}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.isLoading
  }, $data.isLoading ? {} : {}, {
    c: !$data.isLoading && $data.allOrders.length > 0
  }, !$data.isLoading && $data.allOrders.length > 0 ? {
    d: common_vendor.f($data.allOrders, (orderItem, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.getStatusIconText(orderItem.status)),
        b: common_vendor.t($options.getStatusText(orderItem.status)),
        c: common_vendor.t($options.getStatusDesc(orderItem.status)),
        d: common_vendor.f(orderItem.products, (product, pIndex, i1) => {
          return {
            a: product.image,
            b: common_vendor.t(product.name),
            c: common_vendor.t(product.price),
            d: common_vendor.t(product.quantity),
            e: pIndex,
            f: common_vendor.o(($event) => $options.viewProduct(product.id), pIndex)
          };
        }),
        e: common_vendor.t($options.getProductsTotal(orderItem.products)),
        f: common_vendor.t(orderItem.total_amount),
        g: common_vendor.o((...args) => $options.goBack && $options.goBack(...args), orderItem.id),
        h: common_vendor.o(($event) => {
          var _a;
          return $options.viewProduct((_a = orderItem.products[0]) == null ? void 0 : _a.id);
        }, orderItem.id)
      }, $data.allOrders.length > 1 ? {
        i: common_vendor.t($options.getSwipeHintText(index)),
        j: common_vendor.t(index + 1),
        k: common_vendor.t($data.allOrders.length)
      } : {}, {
        l: orderItem.id
      });
    }),
    e: $data.allOrders.length > 1,
    f: $data.currentOrderIndex,
    g: common_vendor.o((...args) => $options.handleOrderChange && $options.handleOrderChange(...args))
  } : {}, {
    h: !$data.isLoading && $data.allOrders.length === 0
  }, !$data.isLoading && $data.allOrders.length === 0 ? {
    i: common_assets._imports_0$5,
    j: common_vendor.o((...args) => $options.goBack && $options.goBack(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
