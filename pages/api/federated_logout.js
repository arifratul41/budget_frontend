import { NextResponse } from "next/server";
import { getSession, signOut } from "next-auth/react";

function logoutParams(token) {
  return {
    id_token_hint: token,
    post_logout_redirect_uri: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
  };
}

function handleEmptyToken() {
  const response = { error: "No session present" };
  const responseHeaders = { status: 400 };
  return NextResponse.json(response, responseHeaders);
}

async function sendEndSessionEndpointToURL(token) {
  const endSessionEndPoint = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`;

  const params = logoutParams(token);
  const endSessionParams = new URLSearchParams(params);
  const response = await fetch(endSessionEndPoint + `?${endSessionParams}`, {
    mode: "no-cors",
  });
  return NextResponse.json(response);
}

export async function federatedLogout() {
  try {
    const session = await getSession();
    if (session) {
      const response = await sendEndSessionEndpointToURL(session?.idToken);
      if (response.ok) {
        await signOut({ redirect: false });
        window.location.href = process.env.NEXT_PUBLIC_NEXTAUTH_URL;
        return;
      }
    }
    const response = handleEmptyToken();

    // const response = await fetch("/api/auth/federated-logout");
    const data = await response.json();
    if (response.ok) {
      await signOut({ redirect: false });
      window.location.href = data.url;
      return;
    }
    throw new Error(data.error);
  } catch (error) {
    console.log(error);
    alert(error);
    await signOut({ redirect: false });
    window.location.href = "/";
  }
}
