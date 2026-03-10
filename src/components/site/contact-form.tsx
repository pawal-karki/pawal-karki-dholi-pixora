"use client";

import React from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const SiteContactForm: React.FC = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    const trimmedSubject = subject.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject || undefined,
          message: trimmedMessage,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit message.");
      }

      toast.success("Message sent", {
        description: "Thank you for contacting us. We will get back to you soon.",
      });

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: unknown) {
      console.error("CONTACT_FORM_SUBMIT_ERROR", error);
      toast.error("Something went wrong", {
        description: "We could not send your message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-md border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">Contact Us</CardTitle>
        <CardDescription>
          Have a question or need help? Send us a message and our team will reach out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-name">
                Name<span className="text-red-500">*</span>
              </label>
              <Input
                id="contact-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="contact-email">
                Email<span className="text-red-500">*</span>
              </label>
              <Input
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="contact-subject">
              Subject
            </label>
            <Input
              id="contact-subject"
              placeholder="How can we help?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="contact-message">
              Message<span className="text-red-500">*</span>
            </label>
            <Textarea
              id="contact-message"
              placeholder="Tell us a bit about what you need…"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SiteContactForm;

