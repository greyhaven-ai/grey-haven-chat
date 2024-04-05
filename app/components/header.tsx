import Image from "next/image";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <div className="z-10 max-w-5xl w-full items-center justify-between sm:flex">
      <a
          href="https://www.greyhaven.ai/"
          className="flex items-center justify-center"
        >
          <Image
            className="rounded-xl"
            src="/grey-haven.png"
            alt="Grey Haven Logo"
            width={60}
            height={60}
            priority
          />
      </a>
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </div>
  );
}
