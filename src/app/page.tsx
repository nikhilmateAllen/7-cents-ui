import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full h-full">
      <div className="flex items-center flex-col justify-center w-full">
        <h1 className="text-6xl font-bold">Hello World</h1>
        <Link href="/login">Login</Link>
      </div>
    </main>
  );
}
