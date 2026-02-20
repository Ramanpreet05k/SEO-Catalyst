import Link from "next/link";
import { Command } from "lucide-react"; // Using an icon as a placeholder for "UserLogo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid md:max-w-none md:grid-cols-2 md:px-0">
      {/* Left Side - Decorative Pattern */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900">
          {/* You can replace this with an actual SVG pattern or image */}
          <div className="h-full w-full" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 20 L40 20 M20 0 L20 40' stroke='%23333' stroke-width='1' opacity='0.2'/%3E%3C/svg%3E")`,
            backgroundSize: '20px 20px'
          }} />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Command className="mr-2 h-6 w-6" /> UserLogo
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="relative flex h-full items-center justify-center p-4 lg:p-8">
        {/* Mobile Logo (only visible on small screens) */}
        <div className="absolute left-4 top-4 z-20 flex items-center text-lg font-medium md:hidden">
          <Command className="mr-2 h-6 w-6" /> UserLogo
        </div>
        
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}