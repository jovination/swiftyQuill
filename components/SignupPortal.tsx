"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"
import { FaApple, FaGithub } from "react-icons/fa"
import AuthModal from "@/components/AuthModal";


function SignupPortal() {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)

    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  const SignupContent = () => (
    <>
      <AuthModal mode="signup" />
      <div className="mt-4 text-center">
        <span className="text-sm">Already have an account? </span>
        <Link className="text-sm underline text-grey-600" href="/login">
          Log in
        </Link>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="text-sm w-[66px]">
            Sign up
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-2xl">Create your account</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            <SignupContent />
          </div>
          <DrawerFooter className="pt-2">
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-sm w-[66px]">
          Sign up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:w-[450px] w-[365px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Create your account</DialogTitle>
        </DialogHeader>
        <SignupContent />
      </DialogContent>
    </Dialog>
  )
}

export default SignupPortal