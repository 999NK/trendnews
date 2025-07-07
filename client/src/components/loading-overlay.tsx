import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Bot } from "lucide-react";

interface LoadingOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress?: number;
  message?: string;
  details?: string;
}

export default function LoadingOverlay({ 
  open, 
  onOpenChange, 
  progress = 0, 
  message = "Generating Articles",
  details = "Grok AI is analyzing trending topics and creating detailed articles..." 
}: LoadingOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Bot className="text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-secondary mb-2">{message}</h3>
          <p className="text-gray-500 mb-4">{details}</p>
          <Progress value={progress} className="w-full mb-2" />
          <p className="text-sm text-gray-500">
            {progress > 0 ? `${Math.round(progress)}% complete` : "Starting..."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
