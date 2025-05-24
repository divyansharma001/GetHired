// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    // Use body background from globals.css for consistency
    <div className="min-h-screen flex items-center justify-center p-6"> 
      <SignIn />
    </div>
  );
}
// Apply similar minimal wrapper for sign-up page