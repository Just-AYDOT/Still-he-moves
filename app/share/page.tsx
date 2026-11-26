import type { Metadata } from "next";
import ShareFlow from "@/components/ShareFlow";
import { isDemo } from "@/lib/db";
import "./share.css";

export const metadata: Metadata = { title: "Share your testimony", description: "Write what God did in four short parts. About ten minutes. You can stay anonymous." };

export default function SharePage() {
  return <ShareFlow demo={isDemo()} />;
}
