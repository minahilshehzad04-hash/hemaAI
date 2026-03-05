// components/Frontend/Footer.tsx

"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">HemaAI</h2>
            <p className="mt-3 text-sm text-gray-600 max-w-xs">
              AI-powered healthcare & blood cancer detection system for better
              and faster diagnosis.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Quick Links</h3>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/Patients" className="text-sm text-gray-600 hover:text-gray-900">
              Patients
            </Link>
            <Link href="/Doctors" className="text-sm text-gray-600 hover:text-gray-900">
              Doctors
            </Link>
            <Link href="/Donors" className="text-sm text-gray-600 hover:text-gray-900">
              Donors
            </Link>
            <Link href="/About" className="text-sm text-gray-600 hover:text-gray-900">
              About Us
            </Link>
            <Link href="/Contact" className="text-sm text-gray-600 hover:text-gray-900">
              Contact Us
            </Link>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
            <p className="mt-2 text-sm text-gray-600">
              Email: <a href="mailto:info@hemaai.com" className="hover:underline">info@hemaai.com</a>
            </p>
            <p className="text-sm text-gray-600">Phone: +92 300 1234567</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} HemaAI. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
