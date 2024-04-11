import { Button } from "@mui/material";
import { federatedLogout } from "@/pages/api/federated_logout";

export default function Logout() {
  return <Button onClick={() => federatedLogout()}>Sign Out</Button>;
}
