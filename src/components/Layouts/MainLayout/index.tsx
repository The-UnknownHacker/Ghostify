/* eslint-disable @next/next/no-img-element */
import NavigationBar from "@/components/NavigationBar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { sendGAEvent } from "@next/third-parties/google";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Cog6ToothIcon, HomeIcon } from "@heroicons/react/24/outline";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { pathname, query } = router;

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href =
      "/" +
      pathSegments
        .slice(0, index + 1)
        .map((seg) => {
          const isDynamic = seg.startsWith("[") && seg.endsWith("]");
          const dynamicPartKey = seg.slice(1, -1);
          return isDynamic && query[dynamicPartKey]
            ? query[dynamicPartKey]
            : seg;
        })
        .join("/");

    const getCorrectSegment = () => {
      if (segment === "[noteId]") {
        return "Note";
      }

      if (segment === "[quizId]") {
        return "Quiz";
      }

      const formattedSegment = segment.replace(/-/g, " ");

      return (
        formattedSegment.charAt(0).toUpperCase() + formattedSegment.slice(1)
      );
    };

    const isLast = index === pathSegments.length - 1;

    return (
      <BreadcrumbItem
        onClick={() => {
          sendGAEvent("event", `breadcrumb_click_(${getCorrectSegment()})`);
        }}
        key={href}
      >
        {isLast ? (
          <BreadcrumbPage className="text-foreground">
            {getCorrectSegment()}
          </BreadcrumbPage>
        ) : (
          <>
            <Link href={href}>
              <BreadcrumbLink>{getCorrectSegment()}</BreadcrumbLink>
            </Link>
            <BreadcrumbSeparator />
          </>
        )}
      </BreadcrumbItem>
    );
  });

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      {/* Conditional Icon */}
      <div className="fixed top-4 left-4 z-50">
        {pathname === "/settings" ? (
          <Link href="/" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <HomeIcon className="h-6 w-6 text-gray-600" />
          </Link>
        ) : (
          <Link href="/settings" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
          </Link>
        )}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl m-auto sm:p-10 p-5">
          <div className="absolute top-5 right-5">
            <NavigationBar />
          </div>
          <div className="my-10">
            <Link className="flex items-center gap-2 my-3" href={"/"}>
              <img src="/images/Logo.png" alt="" className="w-[30px]" />
              <h1 className="text-2xl font-bold">Ghostify</h1>
            </Link>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem
                  onClick={() => {
                    sendGAEvent("event", `breadcrumb_click_(Home)`);
                  }}
                >
                  <Link href="/">
                    <BreadcrumbLink>Home</BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
                {pathSegments.length > 0 && <BreadcrumbSeparator />}
                {breadcrumbs}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="my-10">{children}</div>
        </div>
      </main>

      <Toaster position="bottom-center" />
    </div>
  );
};
