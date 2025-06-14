import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div>
      <SignIn />
    </div>
  );
}

// export default function SignInPage() {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <SignIn
//         appearance={{
//           elements: {
//             formButtonPrimary:
//               "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
//           },
//         }}
//       />
//     </div>
//   );
// }
// export const dynamic = "force-dynamic"; // This ensures the page is always rendered on the server
// export const revalidate = 0; // Disable static generation for this page
// // This is necessary to ensure the page is always rendered on the server
// // and to prevent caching issues with Clerk's authentication flow.
// // The `dynamic` export is used to control how Next.js handles the rendering of this page.
// // Setting it to "force-dynamic" ensures that the page is always rendered on the server,
// // which is important for authentication pages like SignIn.
// // The `revalidate` export is set to 0 to disable static generation for this page,
// // ensuring that it always fetches the latest authentication state from Clerk.
// // This is particularly useful for authentication pages where you want to ensure that
// // the user sees the most up-to-date state of their session and any potential redirects.