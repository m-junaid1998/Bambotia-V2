import { useNavigate } from "react-router-dom";
import { UserCheck2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthBoxProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AuthBox = ({ isOpen, setIsOpen }: AuthBoxProps) => {
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    setIsOpen(false);
    navigate("/signup");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[350px] rounded-3xl text-center p-8 bg-card border border-border z-[9999]">
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="p-4 bg-accent/10 rounded-full text-accent">
            <UserCheck2 size={32} />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="font-serif text-xl text-accent tracking-[0.15em] text-center uppercase">
              Login Required
            </DialogTitle>
            <p className="text-xs text-muted-foreground tracking-wide leading-relaxed">
              Please sign up or log in to your account to manage your cart, save
              premium products, and access your wishlist storefront.
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-2 w-full mt-4">
            <Button
              onClick={handleNavigate}
              className="w-full h-12 rounded-xl tracking-[0.2em] text-xs font-bold uppercase"
            >
              SIGN UP / LOGIN
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 rounded-xl tracking-[0.2em] text-xs text-muted-foreground uppercase"
              onClick={() => setIsOpen(false)}
            >
              CANCEL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthBox;