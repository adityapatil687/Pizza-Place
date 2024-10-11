import React, { useState, useEffect, useContext } from "react";
import MenuCard from "../components/MenuCard";
import { CartContext } from "../context/CartContextProvider";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Spinner } from "react-bootstrap"; // Import Spinner component from React Bootstrap

const MenuScreen = () => {
  const [pizzaMenu, setPizzaMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cartData, setCartData } = useContext(CartContext);

  const endpoint = "https://20stkgbhdg.execute-api.ap-south-1.amazonaws.com/default/menu";

  useEffect(() => {
    const element = document.getElementById("root");
    element.classList.add("my-auto");

    const pageTitle = document.getElementById("pageTitle");
    pageTitle.innerHTML = "Menu";

    // Fetch the pizza menu using Axios
    axios.get(endpoint, {
      headers: {
        "Content-Type": "application/json", // Set content type
      },
    })
      .then(response => {
        setPizzaMenu(response.data);
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch(error => {
        console.error('Error fetching menu:', error.response ? error.response.data : error.message);
        setError("Failed to fetch menu. Please try again."); // Set error state
        setLoading(false); // Also set loading to false in case of error
      });
  }, []);

  const showToastMessage = () => {
    toast.success("Added to cart", {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: "border rounded bg-light-subtle text-light-emphasis",
      autoClose: 1000,
      pauseOnHover: false,
      transition: Slide,
      progressStyle: { backgroundColor: "#198754" },
      icon: false,
      bodyClassName: "bg-light-subtle",
    });
  };

  // Centered loading state using Bootstrap
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading...</span> {/* Optional loading text */}
      </div>
    ); // Show loading state
  }

  if (error) {
    return <div>{error}</div>; // Show error message
  }

  return (
    <>
      <div className="my-5">
        <div data-aos="fade-up" data-aos-duration="1000">
          <div className="row">
            {pizzaMenu.map((currentIndex) => (
              <MenuCard
                key={currentIndex.id}
                pizzaMenu={currentIndex}
                showToastMessage={showToastMessage}
              />
            ))}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default MenuScreen;
