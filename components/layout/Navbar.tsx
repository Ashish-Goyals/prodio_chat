"use client";
import Container from "./Container";
import { Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
const Navbar = () => {
  const router = useRouter();
  const { userId } = useAuth();
  return (
    <div className="sticky top-0 border-b-primary/10 bg-background/80 backdrop-blur-sm">
      <Container>
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Video />
            <div className="font-bold text-lg sm:text-xl">ProdioChat</div>
          </div>
          <div className="flex gap-2 items-center">
            <UserButton />
            {!userId && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-1 inline-flex"
                  onClick={() => router.push("/sign-in")}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-1 inline-flex"
                  onClick={() => router.push("/sign-up")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
export default Navbar;
