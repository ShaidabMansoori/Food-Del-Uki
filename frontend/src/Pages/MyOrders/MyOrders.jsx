import { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";

const MyOrders = () => {
  const [data, setData] = useState([]);
  const { url, token } = useContext(StoreContext);

  const fetchOrders = async () => {
    const response = await axios.post(
      url + "/api/order/userorders",
      {},
      { headers: { token } }
    );
    setData(response.data.data);
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => {
          return (
            <div key={index} className="my-orders-order">
              <img src={assets.parcel_icon} alt="" />
              <p>
                {order.items.map((items, index) => {
                  if (index === order.items.length - 1) {
                    return items.name + " x " + items.quantity;
                  } else {
                    return items.name + " x " + items.quantity + ", ";
                  }
                })}
              </p>
              <p>${order.amount}.00</p>
              <p>Items: {order.Items.length}</p>
              <p>
                <span>&#x25cf;</span>
                <b>{order.status}</b>
                <button onClick={fetchOrders}>Track Order</button>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
