"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import Image from "next/image";
import { FiUploadCloud } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { Document, Page, pdfjs } from "react-pdf";

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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

const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { data: session } = useSession();

  const uploadFileToS3 = async (file: File) => {
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
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);

    // Upload each file to the server
    acceptedFiles.forEach((file) => uploadFileToS3(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "video/mp4": [".mp4"],
      "audio/mpeg": [".mp3"],
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

      <FilePreview>
        {files.map((file, index) => (
          <div key={index}>
            {file.type === "application/pdf" ? (
              <Document file={file}>
                <Page pageNumber={1} width={100} />
              </Document>
            ) : file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                onLoad={() => URL.revokeObjectURL(file)}
              />
            ) : (
              <>
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  <span role="img" aria-label="file">
                    📄
                  </span>
                </div>
                <p>{file.name}</p>
              </>
            )}
          </div>
        ))}
      </FilePreview>
    </DropzoneWrapper>
  );
};

export default FileUpload;
