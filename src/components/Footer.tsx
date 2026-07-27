import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.webp";

const Footer = () => {
  const handleScrollToSection = (targetId: string) => {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const quickLinks = [
    { name: "Jewellery", id: "jewellery" },
    { name: "Cosmetics", id: "cosmetics" },
    { name: "Purses", id: "ladies bags" },
    { name: "New Arrivals", id: "new-arrivals" },
  ];

  return (
    <footer className="border-t border-border bg-card py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 👇 Grid layout ko responsive kiya taake small mobile screens par content sahi wrap ho */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-6">
          <div className="col-span-2">
            <img
              src={logo}
              alt="Bambotia"
              className="h-[3.5em] sm:h-[5em] w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Global Luxury meets Pakistani Elegance. Premium jewellery,
              cosmetics & designer purses curated for the modern woman.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground mb-4 tracking-wider">
              SHOP
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {quickLinks?.map((item, index) => (
                <li key={index}>
                  <span
                    onClick={() => handleScrollToSection(item.id)}
                    className="hover:text-accent transition-colors cursor-pointer block select-none"
                  >
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground mb-4 tracking-wider">
              ABOUT
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/our-story"
                  className="hover:text-accent transition-colors"
                >
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground mb-4 tracking-wider">
              SUPPORT
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/contact"
                  className="hover:text-accent transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-returns"
                  className="hover:text-accent transition-colors"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  to="/faqs"
                  className="hover:text-accent transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-6 border-t border-border/40 pt-4">
          <div className="flex items-center justify-start md:justify-end gap-4">
            <a
              href="https://www.instagram.com/bambotiaa"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/bambotia"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/923323399238"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-colors"
              aria-label="Whatsapp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col-reverse md:flex-row items-center justify-between gap-4 pb-20 md:pb-4 mt-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} BAMBOTIA. All rights reserved.
          </p>

          <div className="flex gap-6 text-xs text-muted-foreground justify-center">
            <Link
              to="/privacy-policy"
              className="hover:text-accent transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-accent transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
