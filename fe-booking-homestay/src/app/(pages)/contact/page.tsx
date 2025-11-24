"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-primary/40 to-secondary/50">
      <Header />
      {/* Header Section */}
      <section className="mt-16">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <h1 className="text-4xl elegant-heading">Get In Touch</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We would love to hear from you. Send us a message and we will
            respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="px-8 py-4 mb-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              <Card className="border-0 bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="elegant-sans">Email</h3>
                    <p className="mt-1 text-muted-foreground">
                      support@4stay.com
                    </p>
                    <p className="text-sm text-muted">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-0 bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-indigo-100 p-3">
                    <Phone className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="elegant-sans">Phone</h3>
                    <p className="mt-1 text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted">
                      Monday - Sunday, 7AM - 10PM
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-0 bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-purple-100 p-3">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="elegant-sans">Office</h3>
                    <p className="mt-1 text-muted-foreground">1 Vo Van Ngan Street</p>
                    <p className="text-sm text-muted">
                      Thu Duc, Ho Chi Minh city, Viet Nam
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 bg-white p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message here..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="mt-2 h-12 rounded-xl bg-input"
                    />
                  </div>

                  <Button type="submit" className="h-12 w-full ">
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>

                  {submitted && (
                    <div className="rounded-lg bg-green-50 p-4 text-green-700">
                      Thank you for your message! We will get back to you
                      shortly.
                    </div>
                  )}
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
