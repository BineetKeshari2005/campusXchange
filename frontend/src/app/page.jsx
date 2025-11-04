// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <h1 className="text-4xl font-bold text-blue-600">Welcome to CampusXchange 🎓</h1>
//       <p className="text-gray-700 mt-4">Buy, Sell & Exchange within your campus</p>
//     </div>
//   );
// }

import { redirect } from "next/navigation";

export default function Page() {
  redirect("/auth/login");
}
