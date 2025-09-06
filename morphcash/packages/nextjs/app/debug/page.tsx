import { DebugContracts } from "./_components/DebugContracts";
import { TestAuth } from "~~/components/auth/TestAuth";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Debug Contracts",
  description: "Debug your deployed MorphCash contracts in an easy way",
});

const Debug: NextPage = () => {
  return (
    <>
      <DebugContracts />
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Debug Contracts</h1>
        <p className="text-neutral">
          You can debug & interact with your deployed contracts here.
          <br /> Check{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / app / debug / page.tsx
          </code>{" "}
        </p>
      </div>
      
      {/* Auth Test Section */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Authentication Test</h2>
        <p className="text-gray-600 text-center mb-6">
          Test the persistent user storage and authentication system
        </p>
        <TestAuth />
      </div>

    </>
  );
};

export default Debug;
