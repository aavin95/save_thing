"use client";

import React from "react";
import styled from "styled-components";
import "tailwindcss/tailwind.css";
import LoginButton from "../components/Auth";

const HighlightedText = styled.span`
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: bold;
`;

const WelcomePage = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-5xl font-bold mb-6">Welcome to Save Thing</h1>
        <h2 className="text-2xl mb-4">The easy second brain</h2>
        <p className="text-lg mb-8">
          <HighlightedText>Effortlessly</HighlightedText> save links, text,
          photos, and files in a{" "}
          <HighlightedText>beautiful word cloud</HighlightedText>.
        </p>
        <LoginButton signInText="Get Started" />
      </div>
    </>
  );
};

export default WelcomePage;
