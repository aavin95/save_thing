import React from "react";
import styled from "styled-components";

const SpinnerWrapper = styled.div`
  margin: 50px auto;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingSpinner: React.FC = () => {
  return <SpinnerWrapper />;
};

export default LoadingSpinner;
