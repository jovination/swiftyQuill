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
import {  FaGithub } from "react-icons/fa"
import Image from "next/image";
import GoogleIcon from "@/public/google.svg"
import AuthModal from "@/components/AuthModal"



function LoginPortal() {
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

  const LoginContent = () => (
    <>
      <AuthModal mode="signin" />
      <div className="mt-4 text-center">
        <span className="text-sm">Don't have an account? </span>
        <Link className="text-sm underline text-grey-600" href="/login">
          Sign up
        </Link>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="text-sm w-[66px]">
            Log in
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-2xl">Welcome back!</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">
            <LoginContent />
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
          Log in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:w-[450px] w-[365px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Welcome back!</DialogTitle>
        </DialogHeader>
        <LoginContent />
      </DialogContent>
    </Dialog>
  )
}

export default LoginPortal

