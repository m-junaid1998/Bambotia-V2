import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import { useContact } from "@/hooks/useContact";
import { useState } from "react";

const Contact = () => {
  const { createContact, isCreating: isSubmitting } = useContact({});
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const handleInputChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createContact(form);
    if (result.success) {
      setForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <PageShell
      eyebrow="GET IN TOUCH"
      title="Contact Us"
      subtitle="Our support team is here to help and typically replies within 24 hours."
      seoTitle="Contact BAMBOTIA — Help & Support"
      seoDescription="Contact BAMBOTIA for orders, custom pieces, and support. Reach us by email, phone, or visit our Karachi location."
    >
      <div className="grid md:grid-cols-3 gap-3 mb-10">
        {[
          { icon: Mail, label: "Email", value: "bambotiia@gmail.com" },
          { icon: Phone, label: "Phone", value: "+923433083783" },
          { icon: MapPin, label: "Location", value: "Karachi, Pakistan" },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="border border-border rounded-sm p-3 text-center bg-card"
          >
            <Icon className="w-4 h-4 text-accent mx-auto mb-3" />
            <p className="text-xs tracking-[0.2em] text-muted-foreground mb-1">
              {label.toUpperCase()}
            </p>
            <p className="text-sm text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="not-prose space-y-4 max-w-xl mx-auto"
      >
        <input
          required
          disabled={isSubmitting}
          placeholder="Your name"
          value={form.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground rounded-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <input
          required
          disabled={isSubmitting}
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground rounded-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <textarea
          required
          disabled={isSubmitting}
          rows={5}
          placeholder="How can we help?"
          value={form.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground rounded-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isSubmitting}
         className="w-full bg-accent text-accent-foreground px-6 py-3 text-sm font-medium tracking-[0.2em] rounded-xl border hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              SENDING...
            </>
          ) : (
            "SEND MESSAGE"
          )}
        </button>
      </form>
    </PageShell>
  );
};

export default Contact;
