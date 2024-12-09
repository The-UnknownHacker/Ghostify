/* eslint-disable @next/next/no-img-element */
import MarkdownRenderer from "@/components/MarkdownRenderer";
import aboutMd from "@/docs/about.md";
import Link from "next/link";
import React from "react";

const About = () => {
  return (
    <div className="w-full flex flex-col items-center gap-5 p-4">
      <Link href={"/"} className="flex items-center gap-1 mr-auto z-40">
        <img src="/images/Logo.png" alt="" className="w-[55px]" />
        <span className="font-bold">Ghostify</span>
      </Link>
      <div className="w-full flex flex-col items-center gap-5 max-w-[1000px]">
        <div className="w-full">
          <MarkdownRenderer markdown={"## About Ghostify"} />
        </div>
        <div className="w-full">
          <MarkdownRenderer markdown={`Ghostify is a cutting-edge application designed and developed by **CyberZenDev**. Our mission is to bring innovation, simplicity, and efficiency to every user experience. For more information, visit our [GitHub page](https://github.com/cyberzen-dev).`} />
        </div>
        <div className="mt-10">
          <MarkdownRenderer markdown={aboutMd} />
        </div>
      </div>
    </div>
  );
};

export default About;
