"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import FileCard from "./FileCard";
import TextCard from "./TextCard";
import { File } from "../types/types";
import LoadingSpinner from "./LoadingSpinner";

const FileWrapper = styled.div`
  column-count: 3;
  column-gap: 20px;
  max-width: 1200px;
  margin: 50px auto;
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

const FileSelectionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== "isactive", // Prevent `isactive` from being forwarded to the DOM
})<{ isactive: boolean }>`
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

const FileDisplay = ({
  files,
  setFiles,
  userId,
}: {
  files: File[];
  setFiles: (files: File[]) => void;
  userId: string;
}) => {
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
        <FileSelectionButton
          isactive={selectedFileType === "text/plain"}
          onClick={() =>
            setSelectedFileType(
              selectedFileType === "text/plain" ? "" : "text/plain"
            )
          }
        >
          Text
        </FileSelectionButton>
      </FileSelectionWrapper>
      <FileWrapper>
        {filteredFiles.map((file, index) => {
          if (file.type === "text/plain") {
            return (
              <TextCard
                key={file._id || `${file.name}-${index}`}
                text={file.text || file.name || "No content available"}
                title={file.title || file.name || "No content available"}
                setFiles={setFiles}
                files={files}
                userId={userId}
                cardKey={file._id || `${file.name}-${index}`}
              />
            );
          } else {
            return (
              <FileCard key={file._id || `${file.name}-${index}`} file={file} />
            );
          }
        })}
      </FileWrapper>
    </>
  );
};

export default FileDisplay;
