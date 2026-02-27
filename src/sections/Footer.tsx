import React, { useState } from 'react';
import { Mail, MapPin, Send, Github, Twitter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export const Footer: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <footer className="py-16 px-[8vw] border-t border-guide">
      <div className="max-w-4xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-12">
          <h2 className="font-display text-display text-ink tracking-tight mb-4">
            Ready to keep perfect books?
          </h2>
          <p className="font-serif text-body text-text-secondary max-w-lg mx-auto">
            Classic Ledger is built for students, educators, and professionals who want 
            clarity without clutter. Start your precision bookkeeping journey today.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-4">
                Get in Touch
              </h3>
              <div className="space-y-3">
                <a 
                  href="mailto:hello@classicledger.app"
                  className="flex items-center gap-3 font-serif text-body text-ink hover:text-accounting-red transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@classicledger.app
                </a>
                <div className="flex items-center gap-3 font-serif text-body text-text-secondary">
                  <MapPin className="w-4 h-4" />
                  Built remotely • UTC+1
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-4">
                Follow
              </h3>
              <div className="flex items-center gap-4">
                <a 
                  href="#"
                  className="p-2 border border-guide rounded-paper hover:border-ink hover:bg-ink hover:text-ivory transition-all"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a 
                  href="#"
                  className="p-2 border border-guide rounded-paper hover:border-ink hover:bg-ink hover:text-ivory transition-all"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-6 border border-guide rounded-paper bg-surface">
            <h3 className="font-sans text-label uppercase tracking-wide text-text-secondary mb-4">
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="font-serif text-body border-guide focus:border-ink rounded-paper"
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="font-serif text-body border-guide focus:border-ink rounded-paper"
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Your message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="font-serif text-body border-guide focus:border-ink rounded-paper min-h-[100px] resize-none"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitted}
                className="w-full font-sans text-label uppercase tracking-wide bg-ink text-ivory hover:bg-ink/90 rounded-paper"
              >
                {isSubmitted ? (
                  <span className="flex items-center gap-2">
                    Message Sent
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-guide flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-sans text-micro text-text-secondary">
            © {new Date().getFullYear()} Classic Ledger. No cookies, no tracking.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="font-sans text-micro text-text-secondary hover:text-ink transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-sans text-micro text-text-secondary hover:text-ink transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
