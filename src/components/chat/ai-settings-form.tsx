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
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">AI Chat Configuration</h1>
                <Badge variant="outline" className="animate-pulse bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="mr-1 h-3 w-3" />
                  2026 Fleet
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your AI provider to enable next-gen agentic capabilities
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Agentic Reasoning</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Gemini 3.1 and GPT-5.3 support native tool-calling for autonomous business tasks.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Flash Inference</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Groq OSS models and Gemini Flash offer sub-100ms response times for real-time chat.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Long Context</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Claude 4.6 and Gemini 3 support up to 2M tokens—perfect for analyzing huge datasets.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription className="mt-1">
                Configure your AI integration with the latest 2026 models
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="ai-enabled" className="text-sm">
                {enabled ? "Enabled" : "Disabled"}
              </Label>
              <Switch
                id="ai-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Provider */}
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">
                  <span className="flex items-center gap-2">
                    Google Gemini
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 text-green-600">v3.1 Ready</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="openai">OpenAI (GPT-5)</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude 4.6)</SelectItem>
                <SelectItem value="groq">
                  <span className="flex items-center gap-2">
                    Groq
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 text-green-600">LPU Speed</Badge>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {provider === "gemini"
                ? "Gemini 3.1 Pro is currently the top-performing model for ARC-AGI reasoning tasks."
                : provider === "anthropic"
                  ? "Claude 4.6 leads in professional preference (GDPval-AA) and large-scale context."
                  : provider === "groq"
                    ? "Groq features OpenAI's GPT-OSS 120B at nearly 500 tokens per second."
                    : "OpenAI GPT-5.2 is the industry standard for general intelligence and UI creation."}
            </p>
          </div>

          <Separator />

          {/* API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{currentProvider.name} API Key</Label>
              {currentSettings && currentSettings.aiProvider === provider && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Key configured
                </Badge>
              )}
            </div>
            <Input
              type="password"
              placeholder={
                currentSettings && currentSettings.aiProvider === provider
                  ? "••••••••••••••••••••••"
                  : currentProvider.keyPlaceholder
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Get your key at{" "}
              <a
                href={currentProvider.keyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                {new URL(currentProvider.keyUrl).hostname} <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <Separator />

          {/* Model */}
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{currentProvider.name} Models</SelectLabel>
                  {currentProvider.models.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <span className="flex items-center gap-2">
                        {m.label}
                        {m.badge && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1 text-blue-600">
                            {m.badge}
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperature</Label>
              <Badge variant="secondary" className="font-mono text-xs">
                {temperature.toFixed(1)}
              </Badge>
            </div>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Precise</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Max Response Length</Label>
              <Badge variant="secondary" className="font-mono text-xs">
                {maxTokens} tokens
              </Badge>
            </div>
            <Slider
              min={256}
              max={16384} // Increased for 2026 models
              step={256}
              value={[maxTokens]}
              onValueChange={([v]) => setMaxTokens(v)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Short</span>
              <span>Balanced</span>
              <span>Extended (Agentic)</span>
            </div>
          </div>

          <Separator />

          {/* System Prompt */}
          <div className="space-y-2">
            <Label>System Prompt (Optional)</Label>
            <Textarea
              placeholder="E.g., You are an agentic assistant. Use tools for research and execution when necessary..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Modern models respond best to "Chain of Thought" or "Persona-based" prompts.
            </p>
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Saving..." : saved ? "Settings Updated!" : "Save Configuration"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}