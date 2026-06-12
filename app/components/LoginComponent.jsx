"use client"

import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"
import { useSignIn } from '@/context/signInContext'
import { BsGithub, BsGoogle } from "react-icons/bs"
import { GitHub } from "react-feather"

function LoginComponent() {
  const { showSignIn, setShowSignIn } = useSignIn()

  return (
    <AnimatePresence>
      {showSignIn && (
        <>
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSignIn(false)}
          />

          <motion.div
            className="auth-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 25,
            }}
          >
            <div className="loginContainer">
              <h2>Welcome to GoalIQ</h2>

              <span>
                Continue with
              </span>

              <div className="auth-options">
                <button
                  onClick={() => signIn("google")}
                  className="auth-option"
                >
                  <BsGoogle size={23} />
                </button>

                <button
                  onClick={() => signIn("github")}
                  className="auth-option"
                >
                  <BsGithub size={23} />
                </button>
              </div>
              <div className="agreement">
                By continuing, you agree to our <span style={{ color: "#0070f3", cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: "#0070f3", cursor: "pointer" }}>Privacy Policy</span>.
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default LoginComponent