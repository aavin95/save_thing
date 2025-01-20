import React, { useState } from "react";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import { File } from "../types/types";

const FileCardWrapper = styled.div`
  break-inside: avoid;
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
  margin: 10px 0;
  position: relative; /* For absolute positioning of the button */

  /* Add padding to make space for the download button */
  padding-bottom: 50px;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }

  img,
  video,
  div {
    width: 100%;
    height: auto;
    object-fit: contain;
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
  const [title, setTitle] = useState<string>(file?.title || file.name); // Use name as fallback
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

  const openFile = () => {
    window.open(file.storageUrl || "/public/default_image.png", "_blank");
  };

  return (
    <FileCardWrapper>
      {/* File Preview */}
      {file.type.startsWith("video/") ? (
        <video
          src={file.storageUrl || "/public/default_image.png"}
          controls
          width="100%"
          height="auto"
          onClick={openFile}
        />
      ) : (
        <div style={{ position: "relative", width: "100%", height: "auto" }}>
          {/* Transparent overlay */}
          <div
            onClick={openFile}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              cursor: "pointer",
              background: "rgba(0, 0, 0, 0)", // Fully transparent
            }}
          ></div>

          {/* PDF display */}
          <object
            data={file.storageUrl || "/public/default_image.png"}
            type={file.type}
            style={{
              width: "100%",
              height: "auto",
            }}
          ></object>
        </div>
      )}

      {/* Title or Editable Input */}
      {isEditing ? (
        <EditableInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleChange}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleTitleChange();
          }}
          autoFocus
          style={{ color: "black" }}
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          style={{ cursor: "pointer", color: "black" }}
        >
          {title}
        </p>
      )}
    </FileCardWrapper>
  );
};

export default FileCard;
