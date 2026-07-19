"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function AdminHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border/50 bg-background/60 px-4 backdrop-blur-md lg:px-8 shadow-sm transition-all duration-300">
      <div className="w-full flex-1 flex items-center">
        <div className="h-8 w-64 rounded-full bg-muted/50 animate-pulse hidden md:block" />
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full hover:bg-accent/20 hover:text-accent transition-colors"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-accent/20 hover:text-accent transition-colors">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-accent to-chart-2 ring-2 ring-background cursor-pointer hover:scale-105 transition-transform" />
      </div>
    </header>
  );
}
