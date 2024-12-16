/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ModeToggle } from "../ModeToggle";
import { Button } from "../ui/button";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

const NavigationBar = () => {
  const router = useRouter();
  const isHomePage = router.pathname === "/";

  return (
    <nav className="z-10">
      <div className="flex items-center gap-5">
        <Link href="/settings" className="font-semibold">
          <Button variant={"ghost"} className="flex items-center gap-2">
            <Cog6ToothIcon className="h-4 w-4" />
            Settings
          </Button>
        </Link>
        {!isHomePage && <ModeToggle />}
      </div>
    </nav>
  );
};

export default NavigationBar;
