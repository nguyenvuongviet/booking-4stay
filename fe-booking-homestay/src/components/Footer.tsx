"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 ">
        <div className="text-center mb-12">
          <span className="elegant-heading text-4xl text-accent">
            THE 4STAY 
          </span>
          <p className="elegant-subheading text-background/70 mt-4 max-w-md mx-auto">
            Where every moment becomes a cherished memory
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 ">
          <div className="ml-12">
            <h4 className="elegant-heading text-lg text-background mb-4">
              Hotel
            </h4>
            <ul className="space-y-3 elegant-subheading text-background/70">
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Suites & Rooms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Amenities
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Location
                </a>
              </li>
            </ul>
          </div>
          <div className="ml-12">
            <h4 className="elegant-heading text-lg text-background mb-4">
              Experiences
            </h4>
            <ul className="space-y-3 elegant-subheading text-background/70">
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Dining
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Wellness
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Events
                </a>
              </li>
            </ul>
          </div>
          <div className="ml-12">
            <h4 className="elegant-heading text-lg text-background mb-4">
              Services
            </h4>
            <ul className="space-y-3 elegant-subheading text-background/70">
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Concierge
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Business Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Transportation
                </a>
              </li>
            </ul>
          </div>
          <div className="ml-12">
            <h4 className="elegant-heading text-lg text-background mb-4">
              Contact
            </h4>
            <ul className="space-y-3 elegant-subheading text-background/70">
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Reservations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Guest Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-background transition-colors">
                  Press Inquiries
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center">
          <p className="elegant-subheading text-background/50">
            © 2025 The 4Stay HomeStay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
