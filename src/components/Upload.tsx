"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import Image from "next/image";
import { FiUploadCloud } from "react-icons/fi";
import { useSession } from "next-auth/react";

const DropzoneWrapper = styled.div`
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

  p {
    font-family: "Inter", sans-serif;
    font-size: 1.25rem;
    color: #4b5563;
    margin: 10px 0;
  }

  .icon {
    font-size: 3rem;
    color: #2563eb;
    margin-bottom: 10px;
  }
`;

const FilePreview = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 100px;
    word-wrap: break-word;

    img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    p {
      font-size: 0.85rem;
      color: #6b7280;
      text-align: center;
      margin-top: 5px;
    }
  }
`;

const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState<string | null>(null);
  const { data: session } = useSession();

  // Handle dropped files
  const onDrop = async (acceptedFiles: File[]) => {
    if (!session || !session.user?.id) {
      console.error("User not authenticated");
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);

    // Upload files to the API
    for (const file of acceptedFiles) {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          content: await file.text(), // Convert the file to text or Base64
          userId: session.user.id, // Add the user ID
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!result.success) {
        console.error("Failed to upload file:", result.error);
      }
    }
  };

  // Configure useDropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "video/mp4": [".mp4"],
      "audio/mpeg": [".mp3"],
    },
    multiple: true,
  });

  // Handle pasted text
  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!session || !session.user?.id) {
      console.error("User not authenticated");
      return;
    }

    const clipboardText = event.clipboardData.getData("Text");
    if (clipboardText) {
      setPastedText(clipboardText);

      // Upload text to the API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          text: clipboardText,
          userId: session.user.id, // Add the user ID
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!result.success) {
        console.error("Failed to upload text:", result.error);
      }
    }
  };

  return (
    <DropzoneWrapper
      {...getRootProps()}
      onPaste={handlePaste}
      tabIndex={0} // Make the dropzone focusable
    >
      <input {...getInputProps()} />
      <div className="icon">
        <FiUploadCloud />
      </div>
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <p>
          Drag & drop files here, paste text, or click to select files (PDF,
          MP4, MP3)
        </p>
      )}

      {/* File Previews */}
      <FilePreview>
        {files.map((file, index) => (
          <div key={index}>
            {file.type.startsWith("image/") ? (
              <Image
                src={URL.createObjectURL(file)} // Generate the object URL
                alt={file.name}
                onLoad={(e) =>
                  URL.revokeObjectURL((e.target as HTMLImageElement).src)
                } // Revoke the object URL after the image loads
                width={100}
                height={100}
              />
            ) : (
              <>
                <Image
                  src="/file-icon.png" // Add a placeholder icon for non-image files
                  alt={file.name}
                  width={100}
                  height={100}
                />
                <p>{file.name}</p>
              </>
            )}
          </div>
        ))}
      </FilePreview>

      {/* Pasted Text Display */}
      {pastedText && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            textAlign: "left",
          }}
        >
          <strong>Pasted Text:</strong>
          <p>{pastedText}</p>
        </div>
      )}
    </DropzoneWrapper>
  );
};

export default FileUpload;
