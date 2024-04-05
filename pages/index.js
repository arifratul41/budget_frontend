import React from "react";
import Logout from "@/components/logout";
import Login from "@/components/login";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div>
      {session ? (
        <div>
          <div>Your name is {session.user?.name}</div>
          <div>
            <Logout />
          </div>
        </div>
      ) : (
        <div>
          <Login />
        </div>
      )}
    </div>
  );
}
