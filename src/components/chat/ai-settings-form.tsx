"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ExternalLink,
  Key,
  Loader2,
  Save,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { upsertAISettings } from "@/queries/chat";

export const PROVIDERS = {
  gemini: {
    name: "Google Gemini",
    description: "Free tier available",
    keyUrl: "https://aistudio.google.com/apikey",
    keyPlaceholder: "AIzaSy...",
    models: [
      { value: "gemini-3.1-pro", label: "Gemini 3.1 Pro", badge: "Reasoning" },
      { value: "gemini-3.1-flash", label: "Gemini 3.1 Flash", badge: "Fast" },
      { value: "gemini-flash-latest", label: "Gemini Flash Latest", badge: "Stable API" },
      { value: "gemini-3.1-flash-image", label: "Gemini 3.1 Flash Image", badge: "Nano Banana 2" },
    ],
  },
  openai: {
    name: "OpenAI",
    description: "Most capable models",
    keyUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-...",
    models: [
      { value: "gpt-5.2", label: "GPT-5.2", badge: "Flagship" },
      { value: "gpt-5-mini", label: "GPT-5 Mini", badge: "Fast" },
      { value: "gpt-realtime-1.5", label: "GPT Realtime 1.5", badge: "Voice API" },
      { value: "gpt-image-1.5", label: "GPT Image 1.5", badge: "DALL-E Successor" },
    ],
  },
  anthropic: {
    name: "Anthropic",
    description: "Advanced reasoning & safety",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyPlaceholder: "sk-ant-...",
    models: [
      { value: "claude-opus-4-6", label: "Claude 4.6 Opus", badge: "Powerhouse" },
      { value: "claude-sonnet-4-6", label: "Claude 4.6 Sonnet", badge: "Workhorse" },
      { value: "claude-haiku-4-5", label: "Claude 4.5 Haiku", badge: "Low-latency" },
    ],
  },
  groq: {
    name: "Groq",
    description: "Lightning fast inference",
    keyUrl: "https://console.groq.com/keys",
    keyPlaceholder: "gsk_...",
    models: [
      { value: "llama-4-maverick-17b", label: "Llama 4 Maverick", badge: "128E MoE" },
      { value: "llama-4-scout-17b", label: "Llama 4 Scout", badge: "Lightweight" },
      { value: "llama-3.3-70b-instruct", label: "Llama 3.3 70B", badge: "Reliable" },
      { value: "deepseek-v3", label: "DeepSeek V3", badge: "Chat/Reasoning" },
      { value: "codestral-2025", label: "Codestral 2025", badge: "Coding" },
      { value: "grok-4", label: "Grok 4", badge: "Real-time" },
    ],
  },
} as const;

type ProviderKey = keyof typeof PROVIDERS;

interface Props {
  agencyId: string;
  currentSettings?: {
    aiProvider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    enabled: boolean;
    systemPrompt: string | null;
  } | null;
}

export function AISettingsForm({ agencyId, currentSettings }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [provider, setProvider] = useState<ProviderKey>(
    (currentSettings?.aiProvider as ProviderKey) || "gemini"
  );
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(
    currentSettings?.model || "gemini-3.1-pro-preview"
  );
  const [temperature, setTemperature] = useState(
    currentSettings?.temperature ?? 0.7
  );
  const [maxTokens, setMaxTokens] = useState(
    currentSettings?.maxTokens ?? 2000
  );
  const [enabled, setEnabled] = useState(currentSettings?.enabled ?? true);
  const [systemPrompt, setSystemPrompt] = useState(
    currentSettings?.systemPrompt || ""
  );

  const currentProvider = PROVIDERS[provider];

  const handleProviderChange = (val: string) => {
    const p = val as ProviderKey;
    setProvider(p);
    setModel(PROVIDERS[p].models[0].value);
  };

  const handleSave = async () => {
    if (!apiKey && !currentSettings) {
      toast.error(`Please enter your ${currentProvider.name} API key`);
      return;
    }

    setIsLoading(true);
    setSaved(false);
    try {
      await upsertAISettings({
        agencyId,
        apiKey: apiKey || "unchanged",
        aiProvider: provider,
        model,
        temperature,
        maxTokens,
        systemPrompt: systemPrompt || undefined,
        enabled,
      });
      setSaved(true);
      toast.success("AI settings saved successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">AI Chat Configuration</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 h-5 text-[10px]">
                <Sparkles className="mr-1 h-3 w-3" />
                2026 Fleet
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your AI provider integration and advanced model settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md border">
          <Label htmlFor="ai-enabled" className="text-sm font-medium cursor-pointer">
            {enabled ? "Active Integration" : "Integration Paused"}
          </Label>
          <Switch
            id="ai-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
            className="ml-2"
          />
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: Core Connnection */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4 text-primary" />
                Connection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {/* Provider */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform Provider</Label>
                <Select value={provider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="font-medium bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="openai">OpenAI (GPT-5)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude 4.6)</SelectItem>
                    <SelectItem value="groq">Groq (LPU Speed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* API Key */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">API Access Key</Label>
                  {currentSettings?.aiProvider === provider && (
                    <Badge variant="outline" className="text-[10px] h-4 py-0 text-green-600 border-green-200 bg-green-50">
                      <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> Verified
                    </Badge>
                  )}
                </div>
                <Input
                  type="password"
                  placeholder={currentSettings?.aiProvider === provider ? "••••••••••••••••••••••" : currentProvider.keyPlaceholder}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-sm bg-background"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Key className="h-3 w-3" /> Securely encrypted
                  </p>
                  <a href={currentProvider.keyUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5">
                    Get key <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Model Specs */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Model Parameters
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

              {/* Model Select */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Model Engine</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="font-medium bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs text-muted-foreground">{currentProvider.name} Fleet</SelectLabel>
                      {currentProvider.models.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          <span className="flex items-center justify-between w-full min-w-[200px]">
                            {m.label}
                            {m.badge && <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5 text-blue-600">{m.badge}</Badge>}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* System Prompt (Spanning 2 columns) */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Guidelines (Prompt)</Label>
                <Textarea
                  placeholder="E.g., You are an agentic assistant. Use tools for research and execution when necessary..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="resize-none h-20 text-sm bg-background"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-3 bg-muted/30 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Temperature</Label>
                  <Badge variant="outline" className="font-mono text-[10px] h-4 leading-none bg-background">{temperature.toFixed(1)}</Badge>
                </div>
                <Slider min={0} max={2} step={0.1} value={[temperature]} onValueChange={([v]) => setTemperature(v)} className="py-2" />
                <div className="flex justify-between text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                  <span>Precise</span>
                  <span className="text-primary/70">Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-3 bg-muted/30 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Max Output</Label>
                  <Badge variant="outline" className="font-mono text-[10px] h-4 leading-none bg-background">{maxTokens} tk</Badge>
                </div>
                <Slider min={256} max={16384} step={256} value={[maxTokens]} onValueChange={([v]) => setMaxTokens(v)} className="py-2" />
                <div className="flex justify-between text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                  <span>Short</span>
                  <span className="text-primary/70">Extended</span>
                </div>
              </div>

              {/* Save Button */}
              <div className="md:col-span-2 pt-2">
                <Button onClick={handleSave} disabled={isLoading} className="w-full shadow-sm hover:shadow-md transition-shadow">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  {isLoading ? "Synchronizing settings..." : saved ? "Configuration Applied!" : "Save & Apply Configuration"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}