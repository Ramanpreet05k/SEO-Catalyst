export { default } from "next-auth/middleware";

export const config = {
  // Add all routes you want to protect inside this array.
  // Now it protects BOTH the dashboard and the onboarding flow
  matcher: ["/dashboard/:path*", "/onboarding"], 
};