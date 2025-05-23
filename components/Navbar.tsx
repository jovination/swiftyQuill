import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { BsLightningCharge } from "react-icons/bs";
import ProfilePortal from "@/components/ProfilePortal"



const Navbar = () => {
    return (
        <div className="w-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <Image
                    src="/logo.svg"
                    width={33}
                    height={33}
                    alt="logo"
                />
            </Link>
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
