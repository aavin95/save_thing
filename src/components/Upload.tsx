"use client";

import React from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { FiUploadCloud } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { Document, Page } from "react-pdf";
import Image from "next/image";
import LoadingSpinner from "./LoadingSpinner";
// Configure pdfjs worker

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

  canvas {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
`;

const Upload = ({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  const uploadFile = async (file: File) => {
    if (!session?.user?.id) {
      console.error("User not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", session.user.id);

    try {
      const response = await fetch(`/api/upload/${session.user.id}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Upload failed:", data.error);
      } else {
        console.log("File uploaded:", data.id);

        const newFile = {
          _id: data.id, // Replace with the actual file ID from your API response
          name: file.name,
          type: file.type,
          storageUrl: data.storageUrl, // Replace with the actual file URL from your API response
        };

        setFiles((prevFiles) => [...prevFiles, newFile]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    // Upload each file to the server
    await Promise.all(
      acceptedFiles.map(async (file) => {
        await uploadFile(file);
      })
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [],
      "video/*": [],
    },
    multiple: true,
  });

  return (
    <DropzoneWrapper {...getRootProps()} tabIndex={0}>
      <input {...getInputProps()} />
      <div className="icon">
        <FiUploadCloud />
      </div>
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <p>Drag & drop files here, or click to select files (PDF, MP4, MP3)</p>
      )}
    </DropzoneWrapper>
  );
};

export default Upload;
