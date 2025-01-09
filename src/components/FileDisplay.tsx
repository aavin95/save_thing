"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
import { useSession } from "next-auth/react";

const FileWrapper = styled.div`
  max-width: 1200px;
  margin: 50px auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const FileCard = styled.a`
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

  p {
    font-size: 0.9rem;
    color: #374151;
    margin: 0;
    word-wrap: break-word;
  }
`;

const LoadingSpinner = styled.div`
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

const FileDisplay = ({ files }: { files: File[] }) => {
  const { status } = useSession();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (files.length === 0) {
    return (
      <p style={{ textAlign: "center" }}>No files found for this account.</p>
    );
  }

  return (
    <FileWrapper>
      {files.map((file, index) => (
        <FileCard
          key={file._id || `${file.name}-${index}`} // Ensure a fallback key if _id is missing
          href={file.storageUrl || file.content} // Use the file's S3 URL or content URL
          target="_blank"
          rel="noopener noreferrer"
        >
          {file.type.startsWith("image/") ? (
            <Image
              src={file.storageUrl || file.content} // URL or Base64 for image
              alt={file.name}
              width={80}
              height={80}
            />
          ) : file.type.startsWith("video/") ? (
            <video
              src={file.storageUrl || file.content} // URL for video
              controls
              width="80"
              height="80"
            />
          ) : file.type === "application/pdf" ? (
            <iframe
              src={file.storageUrl || file.content}
              width="80"
              height="80"
            />
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
          <p>{file.name}</p>
        </FileCard>
      ))}
    </FileWrapper>
  );
};

export default FileDisplay;
