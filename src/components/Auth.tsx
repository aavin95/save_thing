"use client";

import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import styled from "styled-components";

const StyledButton = styled.button`
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;

  &:hover {
    transform: scale(1.05);
    background-color: #1e40af;
  }
`;

const LoginButton = ({ signInText = "Sign In", signOutText = "Sign Out" }) => {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100); // Hide button after scrolling 100px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) {
    return null; // Hide button when isVisible is false
  }

  if (status === "loading") {
    return null;
  }

  if (session) {
    return (
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <span
          style={{
            color: "#333",
            fontSize: "0.9rem",
          }}
        ></span>
        <StyledButton
          onClick={() => {
            signOut();
          }}
        >
          {signOutText}
        </StyledButton>
      </div>
    );
  }

  return (
    <StyledButton
      onClick={() => signIn("google")}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2867e5")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
    >
      {signInText}
    </StyledButton>
  );
};

export default LoginButton;
