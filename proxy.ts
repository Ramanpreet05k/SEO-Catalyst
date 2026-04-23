import { withAuth } from "next-auth/middleware";

export default withAuth({
  // This ensures unauthorized users are kicked back to YOUR custom login page
  // instead of the default NextAuth screen.
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // The matcher dictates exactly which routes the "bouncer" protects.
  // This currently protects the entire dashboard and the onboarding flow.
  matcher: [
    "/dashboard/:path*", 
    "/onboarding"
  ], 
};