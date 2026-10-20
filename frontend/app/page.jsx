'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PuppyLibrary from './components/PuppyLibrary';

export default function HomePage() {
  const router = useRouter();
  // const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
  }, [router]);

  // if (checking) {
  //   return (
  //     <main className="flex min-h-screen items-center justify-center bg-[#F4F6F0]">
  //       <p className="text-sm text-[#315D4B]">
  //         Loading PuppyHere...
  //       </p>
  //     </main>
  //   );
  // }

  return <PuppyLibrary />;
}
