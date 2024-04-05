import { signOut } from "next-auth/react";
import { Button } from "@mui/material";

export default function Logout() {
  return <Button onClick={() => signOut()}>Sign Out</Button>;
}
