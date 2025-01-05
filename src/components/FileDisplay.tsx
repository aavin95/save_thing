"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";

const FileWrapper = styled.div`
  max-width: 800px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FileCard = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  img,
  video {
    width: 80px;
    height: 80px;
    object-fit: cover;
    margin-right: 20px;
    border-radius: 8px;
    border: 1px solid #ddd;
  }

  p {
    font-size: 1rem;
    color: #374151;
    margin: 0;
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

const ErrorMessage = styled.div`
  color: #f87171;
  text-align: center;
  font-size: 1.2rem;
`;

const FileDisplay = ({ userId }: { userId: string }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/upload/${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch files");
        }

        setFiles(data.files);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (files.length === 0) {
    return (
      <p style={{ textAlign: "center" }}>No files found for this account.</p>
    );
  }

  return (
    <FileWrapper>
      {files.map((file) => (
        <FileCard key={file._id}>
          {file.type.startsWith("image/") ? (
            <Image
              src={file.content} // Assuming the content field contains a URL or Base64 image
              alt={file.name}
              width={80}
              height={80}
            />
          ) : file.type.startsWith("video/") ? (
            <video src={file.content} controls width="80" height="80" />
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
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              {file.type}
            </div>
          )}
          <p>{file.name}</p>
        </FileCard>
      ))}
    </FileWrapper>
  );
};

export default FileDisplay;
