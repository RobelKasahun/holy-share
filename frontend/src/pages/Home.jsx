"use client";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Hero from "./Hero";

export default function Home() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
    </div>
  );
}
