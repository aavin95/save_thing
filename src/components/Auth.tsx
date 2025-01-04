"use client";

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

  &:hover {
    transform: scale(1.05);
    background-color: #1e40af;
  }
`;

const LoginButton = ({ signInText = "Sign In", signOutText = "Sign Out" }) => {
  const { data: session, status } = useSession();

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
