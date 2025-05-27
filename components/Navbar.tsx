"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { BsLightningCharge } from "react-icons/bs";
import ProfilePortal from "@/components/ProfilePortal"
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineKeyboardCommandKey } from "react-icons/md";





const Navbar = () => {
    return (
        <div className="w-full flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
                <Image
                    src="/logo.svg"
                    width={33}
                    height={33}
                    alt="logo"
                />
            </Link>
            <div className="hidden  max-w-[650px] w-full h-10 bg-black/5 hover:bg-black/10 rounded-xl px-3 md:flex items-center justify-between">
            <div className="flex items-center gap-1">
            <IoSearchOutline className='text-2xl text-gray-400 ' />
            <input className="bg-transparent focus:outline-none focus:ring-0 focus:border-none border-none placeholder:text-md" placeholder="Search" />
            </div>
            <div className="flex items-center gap-1">
            <MdOutlineKeyboardCommandKey  className='text-xl text-gray-400' />
            <span className="text-gray-500 text-md uppercase">k</span>
            </div> 
             </div>
            <div className="flex items-center gap-4">
                <Button className="rounded-xl flex items-center gap-1 px-3 ">
                <BsLightningCharge />
                Upgrade
                </Button>
               <ProfilePortal />

            </div>
        </div>
    );
};

export default Navbar;
