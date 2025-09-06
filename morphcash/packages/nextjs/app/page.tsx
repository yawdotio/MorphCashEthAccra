import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { CTA } from "~~/components/CTA";
import { Features } from "~~/components/Features";
import { Hero } from "~~/components/Hero";
import { HowItWorks } from "~~/components/HowItWorks";
import { Testimonials } from "~~/components/Testimonials";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </div>
    </>
  );
};

export default Home;
