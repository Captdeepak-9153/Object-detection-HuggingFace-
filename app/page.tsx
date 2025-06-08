'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Dropzone from '@/components/dropzone'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import dynamic from "next/dynamic";
const ProgressBar = dynamic(() => import('@/components/ui/progress'), {
  ssr: false,
})

export default function Home() {
  const [result, setResult] = useState(null)
  const [ready, setReady] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const worker = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL('../lib/worker.ts', import.meta.url),
        {
          type: 'module'
        }
      )
    }

    const onMessageReceived = (e: { data: any }) => {
      switch (e.data.status) {
        case 'initiate':
          setStatus('initiate')
          setReady(false)
          break
        case 'progress':
          setStatus('progress')
          setProgress(e.data.progress)
          break
        case 'ready':
          setStatus('ready')
          setReady(true)
          break
        case 'complete':
          setStatus('complete')
          setResult(e.data.result)
          break
      }
    }

    worker.current.addEventListener('message', onMessageReceived)

    return () =>
      worker.current.removeEventListener('message', onMessageReceived)
  }, [])

  const detector = useCallback((image: any) => {
    if (worker.current) {
      worker.current.postMessage({ image })
    }
  }, [])

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="bg-main-gradient min-h-screen relative flex flex-col justify-between px-4 sm:px-6 md:px-12">
      {/* Animated Blobs and Orbs */}
      <div className="bg-blob bg-blob-indigo"></div>
      <div className="bg-blob bg-blob-teal"></div>
      <div className="bg-orb bg-orb-blue"></div>
      <div className="bg-orb bg-orb-purple"></div>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center">
        <motion.section
          className="relative z-10 w-full max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/10">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between">
              <div className="flex-1">
                <h1 className="text-5xl font-extrabold mb-2 font-sans tracking-tight text-white drop-shadow-[0_2px_16px_rgba(99,102,241,0.7)]">
                  <span className="text-white">AI</span>
                  <span className="text-indigo-400 ml-2">Object</span>
                  <span className="text-teal-300 ml-2">Detection</span>
                </h1>
                <p className="text-base text-teal-300 font-medium mb-2">Using Transformer</p>
                {ready !== null && ready && (
                  <span className="text-green-400 text-sm flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 6.293a1 1 0 00-1.414 0L9 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    Transformer Ready
                  </span>
                )}
              </div>
              <div className="flex-1 flex justify-end">
                {ready !== null && !ready && (
                  <div className="text-end">
                    <p className="text-gray-400 text-sm mb-2">Transformer status</p>
                    <Progress value={progress} />
                  </div>
                )}
              </div>
            </div>

            <Dropzone
              status={status}
              setStatus={setStatus}
              detector={detector}
              result={result}
              setResult={setResult}
              className="mt-10 rounded-2xl border-2 border-dashed border-indigo-400/40 bg-white/10 p-10 shadow-md hover:border-indigo-400 transition-all duration-300 text-center cursor-pointer dropzone transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-indigo-400/30"
            />

            <input
              ref={inputRef}
              type="text"
              placeholder="Paste image URL or description"
              className="mt-4 w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />

            {/* Contact & Portfolio Section */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href="mailto:deepakkumarkar129@gmail.com"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl transition hover:-translate-y-1 shadow-md"
              >
                Contact Us
              </a>
              <a
                href="https://deepak-dev.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-xl transition hover:-translate-y-1 shadow-md"
              >
                Visit My Portfolio
              </a>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 text-center py-6 text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4">
            <a
              href="mailto:deepakkumarkar129@gmail.com"
              className="hover:text-indigo-400 transition"
            >
              Contact
            </a>
            <a
              href="https://deepak-dev.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-400 transition"
            >
              Portfolio
            </a>
          </div>
          <div className="text-xs mt-2">
            &copy; {new Date().getFullYear()} <span className="text-white font-semibold">Deepak</span>. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
