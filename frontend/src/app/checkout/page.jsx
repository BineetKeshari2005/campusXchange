import axios from "axios";

export default function Checkout({ listingId }) {

  const handlePay = async () => {
    const { data } = await axios.post(
      `http://localhost:8080/api/payments/pay/${listingId}`,
      {},
      { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
    );

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: "CampusXChange",
      description: "Marketplace purchase",
      order_id: data.id,
      handler: async function (response) {
        alert("Payment Success");
      }
    };

    new window.Razorpay(options).open();
  };

  return <button onClick={handlePay}>Pay Now</button>;
}
