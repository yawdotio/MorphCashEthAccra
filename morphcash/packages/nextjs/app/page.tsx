import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { Hero } from "~~/components/Hero";
import { Features } from "~~/components/Features";
import { HowItWorks } from "~~/components/HowItWorks";
import { Testimonials } from "~~/components/Testimonials";
import { CTA } from "~~/components/CTA";

const Home: NextPage = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
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
