import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SettingsModalProps {
  children: React.ReactNode;
}

export default function SettingsModal({ children }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    enabled: open,
  });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => 
      apiRequest("POST", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setOpen(false);
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [key]: checked.toString() }));
  };

  // Initialize form data when settings are loaded
  if (settings && Object.keys(formData).length === 0) {
    const initialData: Record<string, string> = {};
    settings.forEach((setting: any) => {
      initialData[setting.key] = setting.value;
    });
    setFormData(initialData);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration Settings
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="grok_api_key">Grok AI API Key</Label>
                  <Input
                    id="grok_api_key"
                    type="password"
                    value={formData.grok_api_key || ""}
                    onChange={(e) => handleInputChange("grok_api_key", e.target.value)}
                    placeholder="Enter your Grok AI API key"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter_api_key">X (Twitter) API Key</Label>
                  <Input
                    id="twitter_api_key"
                    type="password"
                    value={formData.twitter_api_key || ""}
                    onChange={(e) => handleInputChange("twitter_api_key", e.target.value)}
                    placeholder="Enter your X API key"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter_bearer_token">X Bearer Token</Label>
                  <Input
                    id="twitter_bearer_token"
                    type="password"
                    value={formData.twitter_bearer_token || ""}
                    onChange={(e) => handleInputChange("twitter_bearer_token", e.target.value)}
                    placeholder="Enter your X Bearer token"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Automation Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Automation Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="run_time">Run Time</Label>
                  <Input
                    id="run_time"
                    type="time"
                    value={formData.run_time || "12:00"}
                    onChange={(e) => handleInputChange("run_time", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select 
                    value={formData.frequency || "daily"}
                    onValueChange={(value) => handleInputChange("frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max_articles">Max Articles per Run</Label>
                  <Input
                    id="max_articles"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_articles || "10"}
                    onChange={(e) => handleInputChange("max_articles", e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="automation_enabled"
                    checked={formData.automation_enabled === "true"}
                    onCheckedChange={(checked) => handleCheckboxChange("automation_enabled", !!checked)}
                  />
                  <Label htmlFor="automation_enabled">Enable automated article generation</Label>
                </div>
              </CardContent>
            </Card>

            {/* Content Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Generation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="article_length">Article Length</Label>
                  <Select 
                    value={formData.article_length || "medium"}
                    onValueChange={(value) => handleInputChange("article_length", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (300-500 words)</SelectItem>
                      <SelectItem value="medium">Medium (500-800 words)</SelectItem>
                      <SelectItem value="long">Long (800-1200 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="writing_style">Writing Style</Label>
                  <Select 
                    value={formData.writing_style || "informative"}
                    onValueChange={(value) => handleInputChange("writing_style", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="engaging">Engaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={formData.language || "pt"}
                    onValueChange={(value) => handleInputChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Portuguese (PT)</SelectItem>
                      <SelectItem value="en">English (EN)</SelectItem>
                      <SelectItem value="es">Spanish (ES)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include_hashtags"
                    checked={formData.include_hashtags === "true"}
                    onCheckedChange={(checked) => handleCheckboxChange("include_hashtags", !!checked)}
                  />
                  <Label htmlFor="include_hashtags">Include trending hashtags in articles</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto_publish"
                    checked={formData.auto_publish === "true"}
                    onCheckedChange={(checked) => handleCheckboxChange("auto_publish", !!checked)}
                  />
                  <Label htmlFor="auto_publish">Auto-publish articles to blog</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
