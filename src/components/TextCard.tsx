"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "react-modal";
import { File } from "../types/types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CardWrapper = styled.div`
  break-inside: avoid;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 10px 0;
  transition: box-shadow 0.3s, transform 0.3s;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const TextContent = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "expanded", // Prevent expanded from being forwarded to the DOM
})<{ expanded: boolean }>`
  display: -webkit-box;
  -webkit-line-clamp: ${({ expanded }) => (expanded ? "none" : "3")};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  color: #374151;
`;

const ToggleButton = styled.button`
  margin-top: 10px;
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #1e40af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const StyledButton = styled.button`
  background-color: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
    background-color: #1e40af;
  }
`;

interface TextCardProps {
  title: string;
  text: string;
  files?: File[];
  setFiles?: (files: File[]) => void;
  userId: string;
  cardKey: string;
}

const TextCard: React.FC<TextCardProps> = ({
  text,
  files,
  setFiles,
  userId,
  cardKey,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedText, setEditedText] = useState(text);

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditedText(text);
  };

  const handleSave = async () => {
    if (editedText === text) {
      toast.error("No changes made!");
      closeModal();
      return;
    }
    console.log("editedText", editedText);
    if (editedText === "") {
      console.log("editedText is empty");
      toast.error("Text cannot be empty!");
      return;
    }
    const request = await fetch(`/api/uploadText/${userId}`, {
      method: "POST",
      body: JSON.stringify({ text: editedText, id: cardKey }),
    });
    if (request.ok) {
      const data = await request.json();
      if (setFiles && files) {
        const updatedFiles = files.map((file) =>
          file._id === data.id
            ? { ...file, text: data.text, name: data.name, title: data.name }
            : file
        );
        setFiles(updatedFiles);
      }
    } else {
      toast.error("Failed to save changes!");
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <CardWrapper onClick={handleCardClick}>
        <TextContent expanded={isExpanded}>{text}</TextContent>
        {text.length > 100 && (
          <ToggleButton
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? "Read less" : "Read more"}
          </ToggleButton>
        )}
      </CardWrapper>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "600px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            color: "black",
          },
        }}
      >
        <h2>Edit Text</h2>
        <TextArea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
        />
        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <StyledButton onClick={closeModal}>Cancel</StyledButton>
          <StyledButton onClick={handleSave}>Save</StyledButton>
        </div>
      </Modal>
    </>
  );
};

export default TextCard;
