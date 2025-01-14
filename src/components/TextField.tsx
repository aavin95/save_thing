import React, { useState } from "react";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import LoadingSpinner from "./LoadingSpinner";

const TextUploadWrapper = styled.div`
  max-width: 600px;
  margin: 50px auto;
  border: 2px dashed #2563eb;
  border-radius: 16px;
  padding: 40px;
  background: linear-gradient(135deg, #f3f4f6, #ffffff);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: #1d4ed8;
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
  }

  textarea {
    width: 100%;
    height: 150px;
    border: 1px solid #2563eb;
    border-radius: 8px;
    padding: 10px;
    font-family: "Inter", sans-serif;
    font-size: 1rem;
    color: #4b5563;
    margin-bottom: 20px;
    resize: none;
  }

  button {
    background-color: #2563eb;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;

    &:hover {
      background-color: #1d4ed8;
    }
  }
`;

const TextUpload = ({ userId }: { userId: string }) => {
  const { data: session, status } = useSession();
  const [text, setText] = useState("");

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  const handleTextUpload = async () => {
    if (!session?.user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      const response = await fetch(`/api/uploadText/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, userId }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Text upload failed:", data.error);
      } else {
        console.log("Text uploaded:", data.id);
        setText(""); // Clear the text area after successful upload
      }
    } catch (error) {
      console.error("Error uploading text:", error);
    }
  };

  return (
    <TextUploadWrapper>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here..."
      />
      <button onClick={handleTextUpload}>Upload Text</button>
    </TextUploadWrapper>
  );
};

export default TextUpload;
