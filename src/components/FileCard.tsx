"use client";

import React, { useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { File } from "../types/types";

const FileCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.3s, transform 0.3s;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  img,
  video,
  div {
    width: 100px;
    height: 100px;
    object-fit: cover;
    margin-bottom: 10px;
    border-radius: 12px;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const EditableInput = styled.input`
  border: none;
  border-bottom: 1px solid #ccc;
  font-size: 0.9rem;
  text-align: center;
  padding: 5px;
  margin-top: 5px;
  width: 100%;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-bottom: 1px solid #2563eb;
  }
`;

const FileCard = ({ file }: { file: File }) => {
  const [title, setTitle] = useState<string>(file?.title || ""); // Local state for title
  const [isEditing, setIsEditing] = useState(false); // State to track editing
  const { data: session } = useSession();

  const handleTitleChange = async () => {
    if (title !== file.title) {
      try {
        const response = await fetch(
          `/api/edit/${session?.user?.id}/${file._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title }),
          }
        );

        if (!response.ok) {
          console.error("Failed to update title");
          setTitle(file.name); // Revert on failure
        }
      } catch (error) {
        console.error("Error updating title:", error);
        setTitle(file.name); // Revert on error
      }
    }

    setIsEditing(false); // Exit editing mode
  };

  return (
    <FileCardWrapper>
      {file.type.startsWith("image/") ? (
        <Image
          src={file.storageUrl || file.content || "/public/default_image.png"} // Provide a default image path
          alt={file.name}
          width={80}
          height={80}
        />
      ) : file.type.startsWith("video/") ? (
        <video
          src={file.storageUrl || file.content || "/public/default_image.png"} // URL for video
          controls
          width="80"
          height="80"
        />
      ) : file.type === "application/pdf" ? (
        <iframe
          src={file.storageUrl || file.content || "/public/default_image.png"}
          width="80"
          height="80"
        />
      ) : file.type === "text/plain" ? (
        <div>
          <p>{file.text || "No content available"}</p>
        </div>
      ) : (
        <div
          style={{
            width: "80px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e5e7eb",
            borderRadius: "8px",
            fontSize: "1.5rem",
            color: "#6b7280",
          }}
        >
          ❓
        </div>
      )}
      {isEditing ? (
        <EditableInput
          value={title}
          onChange={(e) => setTitle(e.target.value)} // Update local state
          onBlur={handleTitleChange} // Save on blur
          onKeyPress={(e) => {
            if (e.key === "Enter") handleTitleChange(); // Save on Enter
          }}
          autoFocus
          style={{ color: "black" }} // Set text color to black
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)} // Enable editing on click
          style={{ cursor: "pointer", color: "black" }} // Set text color to black
        >
          {title}
        </p>
      )}
    </FileCardWrapper>
  );
};

export default FileCard;
