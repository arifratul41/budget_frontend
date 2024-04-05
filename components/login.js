import { signIn } from "next-auth/react";
import { Button } from "@mui/material";

export default function Login() {
  return <Button onClick={() => signIn()}>signin with Keycloak</Button>;
}
