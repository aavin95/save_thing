import React from "react";
import Upload from "@/components/Upload";
import FileDisplay from "@/components/FileDisplay";
import { useSession } from "next-auth/react";
const Save: React.FC = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  console.log(userId);
  return (
    <div>
      <Upload />
      <FileDisplay userId={userId} />
    </div>
  );
};

export default Save;
