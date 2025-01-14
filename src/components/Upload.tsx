"use client";

import React from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { FiUploadCloud } from "react-icons/fi";
import { useSession } from "next-auth/react";
import LoadingSpinner from "./LoadingSpinner";

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

interface File {
  _id?: string; // Optional, as some files might not have an ID
  name: string; // File name
  type: string; // MIME type of the file (e.g., "image/png")
  storageUrl?: string; // URL where the file is stored (e.g., on S3)
  content?: string; // Fallback for file content (e.g., base64 or other inline representation)
  text?: string;
}

const Upload = ({
  userId,
  setFiles,
}: {
  userId: string;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) => {
  const { data: session, status } = useSession();

  // Ensure useDropzone is called unconditionally
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      await Promise.all(
        acceptedFiles.map(async (file) => {
          await uploadFile(file);
        })
      );
    },
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [],
      "video/*": [],
    },
    multiple: true,
  });

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  const uploadFile = async (file: File) => {
    if (!session?.user?.id) {
      console.error("User not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("file", file as unknown as Blob);
    formData.append("userId", userId);

    try {
      const response = await fetch(`/api/upload/${userId}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Upload failed:", data.error);
      } else {
        console.log("File uploaded:", data.id);

        const newFile = {
          _id: data.id,
          name: file.name,
          title: file.name,
          type: file.type,
          storageUrl: data.storageUrl,
        };

        setFiles((prevFiles) => [...prevFiles, newFile]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

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
