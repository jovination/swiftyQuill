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
import AuthModal from "@/components/AuthModal";


function SignupPortal() {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signup")

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
      <AuthModal mode={mode} />
      <div className="mt-4 text-center">
        {mode === "signup" ? (
          <>
            <span className="text-sm">Already have an account? </span>
            <button className="text-sm underline text-grey-600" onClick={() => setMode("signin")}>
              Log in
            </button>
          </>
        ) : (
          <>
            <span className="text-sm">Don't have an account? </span>
            <button className="text-sm underline text-grey-600" onClick={() => setMode("signup")}>
              Sign up
            </button>
          </>
        )}
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
      <DialogContent className="sm:max-w-[425px] md:w-[450px] w-[365px] rounded-3xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Create your account</DialogTitle>
        </DialogHeader>
        <SignupContent />
      </DialogContent>
    </Dialog>
  )
}

export default SignupPortal