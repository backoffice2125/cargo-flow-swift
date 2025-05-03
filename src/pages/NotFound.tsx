
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#040714] text-white">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[#0084c7]">404</h1>
        <h2 className="text-3xl font-bold mt-6 mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-[#0084c7] hover:bg-[#006ca3] text-white px-8 py-6 text-lg">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
