"use client";

import WelcomePage from "@/components/WelcomePage";
import Save from "@/components/Save";
import { useSession } from "next-auth/react";

const Page = () => {
  const { data: session, status } = useSession();

  // Show a loading state while the session is being determined
  if (status === "loading") {
    return <div>Loading...</div>; // Render a loading indicator
  }

  // Render based on session status
  const isUserSignedIn = !!session;
  return (
    <>
      <header>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📎 </text></svg>"
        />
      </header>
      {isUserSignedIn ? <Save /> : <WelcomePage />}
    </>
  );
};

export default Page;
