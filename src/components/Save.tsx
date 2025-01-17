import React, { useState, useEffect } from "react";
import Upload from "@/components/Upload";
import FileDisplay from "@/components/FileDisplay";
import { useSession } from "next-auth/react";
import LoadingSpinner from "./LoadingSpinner";
import TextField from "./TextField";
import { File } from "../types/types";
import styled from "styled-components";

const SaveContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  > * {
    flex-shrink: 0; /* Disable shrinking for all child components */
    width: 100%; /* Ensure child components take the full width if needed */
  }
`;

const Save: React.FC = () => {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState<File[]>([]); // Shared state for files
  const [loading, setLoading] = useState(true); // Loading indicator for initial fetch

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch existing files for the user
      const fetchFiles = async () => {
        try {
          const response = await fetch(`/api/upload/${session.user.id}`);
          const data = await response.json();

          if (response.ok) {
            setFiles(data.files || []); // Initialize files with data from server
          } else {
            console.error("Failed to fetch files:", data.error);
          }
        } catch (error) {
          console.error("Error fetching files:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFiles();
    }
  }, [session?.user?.id]);

  if (status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  return (
    <SaveContainer>
      {session?.user?.id && (
        <>
          <Upload userId={session.user.id} files={files} setFiles={setFiles} />
          <TextField
            userId={session.user.id}
            files={files}
            setFiles={setFiles}
          />
          <FileDisplay
            files={files}
            setFiles={setFiles}
            userId={session.user.id}
          />
        </>
      )}
    </SaveContainer>
  );
};

export default Save;
