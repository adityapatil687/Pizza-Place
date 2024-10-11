import { useState, useEffect, useContext } from "react";
import "./CartScreen.css";
import { json, Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import CartCard from "../components/CartCard";
import Checkout from "../components/Checkout";
import ReactDOM from "react-dom";
import { CartContext } from "../context/CartContextProvider";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-bootstrap/Modal";

import { UserStateContext } from "../context/UserStateContextProvider";

import axios from "axios";

const CartScreen = () => {
  const { cartData, setCartData } = useContext(CartContext);
  const endpoint =
    " https://20stkgbhdg.execute-api.ap-south-1.amazonaws.com/default/checkout";
  const [total, setTotal] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [modelBody, setModelBody] = useState("");
  const [show, setShow] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const navigate = useNavigate();

  const handleClose = () => {
    setShow(false);
    navigate("/login");
  };
  const handleShow = () => setShow(true);

  const { isSignedIn, setIsSignedIn } = useContext(UserStateContext);

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  let res = loadScript("https://checkout.razorpay.com/v1/checkout.js");

  useEffect(() => {
    let element = document.getElementById("root");
    element.classList.remove("my-auto");
    //console.log(cartData);

    let pageTitle = document.getElementById("pageTitle");
    pageTitle.innerHTML = "Cart";
  }, []);

  useEffect(() => {
    const newTotal = cartData.reduce((acc, curr) => {
      const totalPrice = curr.price * curr.quantity;
      return acc + totalPrice;
    }, 0);
    setTotal(newTotal);
  }, [cartData]);

  // const deleteHandler = (id) => {
  //   const updatedCartData = cartData.filter((obj) => obj.id !== id);
  //   setCartData(updatedCartData);
  // };

  const showToastMessage = (str) => {
    toast.success(str, {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: "border rounded bg-light-subtle text-light-emphasis mb-5",
      autoClose: 1000,
      pauseOnHover: false,
      transition: Slide,
      progressStyle: { backgroundColor: "#198754" },
      icon: false,
      bodyClassName: "bg-light-subtle",
    });
  };

  const placeOrder = async () => {
    if (total > 0) {
      if (isSignedIn === true) {
        await postData();
        //await displayRazorpay();
      } else {
        setModelBody("Bhai login krle pehle !");
        setShow(true);
      }
    } else {
      setModelBody("Cannot proceed");
      setShow(true);
    }
  };

  const postData = async () => {
    try {
      const response = await axios.post(endpoint, cartData);
      setResponseData(response.data);
      console.log("Order created successfully:", response.data);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  useEffect(() => {
    if (responseData != null) {
      displayRazorpay();
    }
  }, [responseData]);

  async function displayRazorpay() {
    //res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: "rzp_test_yHKOcyVvlSH2ZM",
      currency: responseData.currency,
      amount: responseData.amount,
      order_id: responseData.order_id,
      name: "Pizza Place",
      description: "Plese make a payment",
      image:
        "https://d1skhftcq2dyo4.cloudfront.net/PizzaPlaceAssets/8701016.jpg",

      handler: async function (response) {
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature);
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modelBody}</Modal.Body>
        <Modal.Footer>
          <button
            variant="secondary"
            className=" btn btn-success"
            onClick={handleClose}
          >
            Ok
          </button>
          {/* <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button> */}
        </Modal.Footer>
      </Modal>

      <div className="cart-screen" data-aos="fade-up" data-aos-duration="1000">
        <div className="cart-items">
          {cartData !== null && cartData.length > 0 ? (
            cartData.map((obj, index) => {
              return (
                <CartCard
                  key={Math.random()}
                  data={obj}
                  // deleteHandler={deleteHandler}
                  showToastMessage={showToastMessage}
                  listId={index}
                />
              );
            })
          ) : (
            <div className="text-center">
              <p>Your cart is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* 
          {cartData !== null && cartData.length > 0 ? (
        <div
          className="cart-screen"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <div className="cart-items">
            {cartData.map((obj) => {
              return (
                <CartCard
                  key={obj.id}
                  data={obj}
                  deleteHandler={deleteHandler}
                  showToastMessage={showToastMessage}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p>Your cart is empty</p>
        </div>
      )}
      */}
      <ToastContainer />
      {ReactDOM.createPortal(
        <Checkout total={total} placeOrder={placeOrder} />,
        document.getElementById("footer")
      )}
    </>
  );
};

export default CartScreen;
