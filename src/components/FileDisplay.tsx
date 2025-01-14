"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import FileCard from "./FileCard";

const FileWrapper = styled.div`
  max-width: 1200px;
  margin: 50px auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
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

const FileSelectionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
  background-color: #f7efdf;
  border-radius: 20px;
  padding: 10px;
  margin-left: 299px;
  margin-right: 299px;
`;

const FileSelectionButton = styled.button<{ isactive: boolean }>`
  background: ${({ isactive }) => (isactive ? "#F87171" : "#2563eb")};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
    background-color: #f87171;
  }
`;

interface File {
  _id?: string; // Optional, as some files might not have an ID
  name: string; // File name
  type: string; // MIME type of the file (e.g., "image/png")
  storageUrl?: string; // URL where the file is stored (e.g., on S3)
  content?: string; // Fallback for file content (e.g., base64 or other inline representation)
}

const FileDisplay = ({ files }: { files: File[] }) => {
  const { status } = useSession();
  const [selectedFileType, setSelectedFileType] = useState<string>("");

  const filteredFiles = files.filter((file) =>
    file.type.startsWith(selectedFileType)
  );

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (files.length === 0) {
    return (
      <p style={{ textAlign: "center" }}>No files found for this account.</p>
    );
  }

  return (
    <>
      <FileSelectionWrapper>
        <FileSelectionButton
          isactive={selectedFileType === "image/"}
          onClick={() =>
            setSelectedFileType(selectedFileType === "image/" ? "" : "image/")
          }
        >
          Images
        </FileSelectionButton>
        <FileSelectionButton
          isactive={selectedFileType === "video/"}
          onClick={() =>
            setSelectedFileType(selectedFileType === "video/" ? "" : "video/")
          }
        >
          Videos
        </FileSelectionButton>
        <FileSelectionButton
          isactive={selectedFileType === "application/"}
          onClick={() =>
            setSelectedFileType(
              selectedFileType === "application/" ? "" : "application/"
            )
          }
        >
          Documents
        </FileSelectionButton>
      </FileSelectionWrapper>
      <FileWrapper>
        {filteredFiles.map((file, index) => (
          <FileCard key={file._id || `${file.name}-${index}`} file={file} />
        ))}
      </FileWrapper>
    </>
  );
};

export default FileDisplay;
