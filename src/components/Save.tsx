import React, { useState, useEffect } from "react";
import Upload from "@/components/Upload";
import FileDisplay from "@/components/FileDisplay";
import { useSession } from "next-auth/react";
import LoadingSpinner from "./LoadingSpinner";

interface File {
  _id?: string; // Optional, as some files might not have an ID
  name: string; // File name
  type: string; // MIME type of the file (e.g., "image/png")
  storageUrl?: string; // URL where the file is stored (e.g., on S3)
  content?: string; // Fallback for file content (e.g., base64 or other inline representation)
}

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
    <div>
      {session?.user?.id && (
        <Upload userId={session.user.id} files={files} setFiles={setFiles} />
      )}
      <FileDisplay files={files} />
    </div>
  );
};

export default Save;
