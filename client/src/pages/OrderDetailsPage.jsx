import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
const API = process.env.REACT_APP_API_URL;
const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`${API}/api/v1/order/${id}`);
        setOrder(data.order);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <h2>Loading...</h2>;
  if (!order) return <h2>Order not found</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Status:</strong> {order.orderStatus}</p>
      <p><strong>Total Amount:</strong> ₹{order.totalPrice}</p>

      <hr />

      <h3>Shipping Info</h3>
      <p><strong>Name:</strong> {order.user?.name}</p>
      <p><strong>Email:</strong> {order.user?.email}</p>
      <p><strong>Phone:</strong> {order.shippingInfo?.phoneNo}</p>
      <p>
        <strong>Address:</strong>{" "}
        {order.shippingInfo?.address}, {order.shippingInfo?.city},{" "}
        {order.shippingInfo?.state}, {order.shippingInfo?.country} -{" "}
        {order.shippingInfo?.pinCode}
      </p>

      <hr />

      <h3>Payment Info</h3>
      <p>
        <strong>Status:</strong>{" "}
        {order.paymentInfo?.status === "succeeded"
          ? "Paid"
          : "Not Paid"}
      </p>
      <p><strong>Method:</strong> {order.paymentMethod}</p>

      <hr />

      <h3>Ordered Items</h3>

      {order.orderItems.map((item) => {

        // 🔥 DEBUG LOG
        console.log("PRODUCT:", item.product);

        return (
          <div
            key={item._id}
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "5px",
            }}
          >
            {/* Product Image */}
            {item.product?.images?.length > 0 ? (
              <img
  src={item.image}
  alt={item.name}
  style={{
    width: "120px",
    height: "120px",
    objectFit: "cover",
    marginRight: "20px",
  }}
/>

            ) : (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "20px",
                  borderRadius: "6px"
                }}
              >
                No Image
              </div>
            )}

            {/* Product Details */}
            <div>
              <h4>{item.product?.name}</h4>
              <p>Price: ₹{item.price}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Total: ₹{item.price * item.quantity}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderDetailsPage;
