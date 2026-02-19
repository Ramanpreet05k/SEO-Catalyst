export { default } from "next-auth/middleware";

export const config = {
  // Add all routes you want to protect inside this array.
  // Right now, it protects any route starting with /dashboard
  matcher: ["/dashboard/:path*"], 
};