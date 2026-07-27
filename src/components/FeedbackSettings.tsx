import { Volume2, VolumeX, Smartphone, Settings2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFeedback } from "@/hooks/useFeedbackContext";

interface Props {
  variant?: "icon" | "inline";
}

const FeedbackSettings = ({ variant = "icon" }: Props) => {
  const { soundEnabled, hapticsEnabled, setSoundEnabled, setHapticsEnabled } =
    useFeedback();

  if (variant === "inline") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-accent" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
            <Label htmlFor="fb-sound" className="text-sm">
              Click sounds
            </Label>
          </div>
          <Switch
            id="fb-sound"
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Smartphone
              className={`w-4 h-4 ${hapticsEnabled ? "text-accent" : "text-muted-foreground"}`}
            />
            <Label htmlFor="fb-haptics" className="text-sm">
              Vibration
            </Label>
          </div>
          <Switch
            id="fb-haptics"
            checked={hapticsEnabled}
            onCheckedChange={setHapticsEnabled}
          />
        </div>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="text-foreground hover:text-accent transition-colors"
          aria-label="Sound and vibration preferences"
        >
          <Settings2 className="w-7 h-7 sm:w-6 sm:h-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="mb-3">
          <p className="text-sm font-medium">Tactile feedback</p>
          <p className="text-xs text-muted-foreground">
            Control click sounds and vibration.
          </p>
        </div>
        <FeedbackSettings variant="inline" />
      </PopoverContent>
    </Popover>
  );
};

export default FeedbackSettings;