import Overture from "@/components/acts/Overture";
import Film from "@/components/acts/Film";
import Thesis from "@/components/acts/Thesis";
import Pillars from "@/components/acts/Pillars";
import Seam from "@/components/acts/Seam";
import Principles from "@/components/acts/Principles";
import Colophon from "@/components/acts/Colophon";

export default function Home() {
  return (
    <>
      <Overture />
      <main>
        <Film />
        <Thesis />
        <Pillars />
        <Seam />
        <Principles />
      </main>
      <Colophon />
    </>
  );
}
