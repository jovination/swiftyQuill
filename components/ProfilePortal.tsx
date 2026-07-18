"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoIosArrowForward } from "react-icons/io";
import { BsBrightnessHigh, BsMoonStars } from "react-icons/bs";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

function ProfilePortal() {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || "User";
    const userImage = session?.user?.image || "";
    const userEmail = session?.user?.email || "";

    useEffect(() => {
        setMounted(true);
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 1);
    };

    const cycleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const themeLabel = mounted ? (theme === 'dark' ? 'Night' : 'Day') : 'Day';
    const ThemeIcon = mounted && theme === 'dark' ? BsMoonStars : BsBrightnessHigh;

    const ProfileContent = () => (
        <>
            <div className="flex flex-col items-center h-auto">
                <Avatar className="w-16 h-16 mb-2">
                    <AvatarImage src={userImage} alt={displayName} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <span className="text-md font-semibold text-center">{displayName}</span>
            </div>

            <div className="w-full bg-white dark:bg-card h-auto rounded-[20px] shadow-md overflow-hidden mb-4">
                <div className="w-full h-[46px] border-b dark:border-border flex justify-between items-center px-4 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Name</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">{displayName}</span>
                        <IoIosArrowForward className="text-sm text-gray-500 dark:text-muted-foreground" />
                    </div>
                </div>

                <div className="w-full h-[46px] border-b dark:border-border flex justify-between items-center px-4 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Language</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">Detect language</span>
                        <IoIosArrowForward className="text-sm text-gray-500 dark:text-muted-foreground" />
                    </div>
                </div>

                <div className="w-full h-[46px] flex justify-between items-center px-4 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">Import notes</span>
                        <span className="text-xs font-semibold flex items-center justify-center w-9 h-5 rounded-md text-white bg-black dark:text-primary-foreground dark:bg-primary">New</span>
                    </div>
                    <IoIosArrowForward className="text-sm text-gray-500 dark:text-muted-foreground" />
                </div>
            </div>
            <div className="w-full bg-white dark:bg-card h-auto rounded-[20px] shadow-md overflow-hidden mb-4">
                <div
                    className="w-full h-[46px] border-b dark:border-border flex justify-between items-center px-4 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 transition-colors"
                    onClick={cycleTheme}
                >
                    <span className="text-sm">Theme</span>
                    <div className="flex items-center space-x-2">
                        <ThemeIcon className="text-sm text-gray-500 dark:text-muted-foreground" />
                        <span className="text-sm">{themeLabel}</span>
                        <IoIosArrowForward className="text-sm text-gray-500 dark:text-muted-foreground" />
                    </div>
                </div>

                <div className="w-full h-[46px] border-b dark:border-border flex justify-between items-center px-4 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Email</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">{userEmail}</span>
                        <IoIosArrowForward className="text-sm text-gray-500 dark:text-muted-foreground" />
                    </div>
                </div>

                <div className="w-full h-[46px] flex justify-between items-center px-4 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Password</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-md">**********</span>
                        <IoIosArrowForward className="text-sm text-gray-500 dark:text-muted-foreground" />
                    </div>
                </div>
            </div>

            <div className="w-full bg-white dark:bg-card h-auto rounded-[20px] shadow-md overflow-hidden">
                <div className="w-full h-[46px] border-b dark:border-border flex justify-between items-center px-4 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Help</span>
                    <IoIosArrowForward className="text-sm text-gray-500 dark:text-muted-foreground" />
                </div>

                <div className="w-full h-[46px] flex justify-between items-center px-4 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 transition-colors" onClick={() => signOut()}>
                    <span className="text-sm">Sign out</span>
                    <IoIosArrowForward className="text-sm text-gray-500 dark:text-muted-foreground" />
                </div>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerTrigger asChild>
                    <Avatar className="cursor-pointer">
                        <AvatarImage src={userImage} alt={displayName} />
                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                        <ProfileContent />
                    </div>
                    <DrawerFooter className="pt-2">
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Avatar className="cursor-pointer">
                    <AvatarImage src={userImage} alt={displayName} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] w-full rounded-3xl" aria-describedby={undefined}>
                <DialogHeader className="flex flex-col items-center">
                    <DialogTitle className="sr-only">Profile</DialogTitle>
                </DialogHeader>
                <ProfileContent />
            </DialogContent>
        </Dialog>
    );
}

export default ProfilePortal;
