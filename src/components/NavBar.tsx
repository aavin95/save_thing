"use client";
import React from "react";
import LoginButton from "./Auth"; // Import the Auth component

const NavBar: React.FC = () => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: "10px",
        margin: "0",
        boxSizing: "border-box",
      }}
    >
      <LoginButton signInText="Log In" signOutText="Log Out" />
    </nav>
  );
};

export default NavBar;
