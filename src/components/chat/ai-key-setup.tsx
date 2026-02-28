"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    AlertCircle,
    Bot,
    CheckCircle2,
    ExternalLink,
    Key,
    Loader2,
    Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { upsertAISettings } from "@/queries/chat";

interface Props {
    agencyId: string;
    onSuccess: () => void;
    compact?: boolean;
}

const PROVIDERS = {
    gemini: {
        name: "Google Gemini",
        placeholder: "AIzaSy...",
        url: "https://aistudio.google.com/apikey",
        models: [
            { value: "gemini-3.1-pro", label: "Gemini 3.1 Pro", tag: "Reasoning" },
            { value: "gemini-3.1-flash", label: "Gemini 3.1 Flash", tag: "Fast" },
            { value: "gemini-flash-latest", label: "Gemini Flash Latest", tag: "Stable API" },
            { value: "gemini-3.1-flash-image", label: "Gemini 3.1 Flash Image", tag: "Nano Banana 2" },
        ],
    },
    openai: {
        name: "OpenAI",
        placeholder: "sk-...",
        url: "https://platform.openai.com/api-keys",
        models: [
            { value: "gpt-5.2", label: "GPT-5.2", tag: "Flagship" },
            { value: "gpt-5-mini", label: "GPT-5 Mini", tag: "Fast" },
            { value: "gpt-realtime-1.5", label: "GPT Realtime 1.5", tag: "Voice API" },
            { value: "gpt-image-1.5", label: "GPT Image 1.5", tag: "DALL-E Successor" },
        ],
    },
    anthropic: {
        name: "Anthropic",
        placeholder: "sk-ant-...",
        url: "https://console.anthropic.com/settings/keys",
        models: [
            { value: "claude-opus-4-6", label: "Claude 4.6 Opus", tag: "Powerhouse" },
            { value: "claude-sonnet-4-6", label: "Claude 4.6 Sonnet", tag: "Workhorse" },
            { value: "claude-haiku-4-5", label: "Claude 4.5 Haiku", tag: "Low-latency" },
        ],
    },
    groq: {
        name: "Groq",
        placeholder: "gsk_...",
        url: "https://console.groq.com/keys",
        models: [
            { value: "llama-4-maverick-17b", label: "Llama 4 Maverick", tag: "128E MoE" },
            { value: "llama-4-scout-17b", label: "Llama 4 Scout", tag: "Lightweight" },
            { value: "llama-3.3-70b-instruct", label: "Llama 3.3 70B", tag: "Reliable" },
            { value: "deepseek-v3", label: "DeepSeek V3", tag: "Chat/Reasoning" },
            { value: "codestral-2025", label: "Codestral 2025", tag: "Coding" },
            { value: "deepseek-r1-distill-llama-70b", label: "DeepSeek R1", tag: "Reasoning" },
        ],
    },
};

type ProviderKey = keyof typeof PROVIDERS;

export function AIKeySetup({ agencyId, onSuccess, compact = false }: Props) {
    const [provider, setProvider] = useState<ProviderKey>("gemini");
    const [model, setModel] = useState(PROVIDERS.gemini.models[0].value);
    const [apiKey, setApiKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const current = PROVIDERS[provider];

    const handleProviderChange = (val: string) => {
        const p = val as ProviderKey;
        setProvider(p);
        setModel(PROVIDERS[p].models[0].value);
    };

    const handleSave = async () => {
        if (!apiKey.trim()) {
            toast.error("Please enter an API key");
            return;
        }
        setIsLoading(true);
        try {
            await upsertAISettings({
                agencyId,
                apiKey: apiKey.trim(),
                aiProvider: provider,
                model,
                enabled: true,
            });
            toast.success("AI configured! Starting your chat...");
            onSuccess();
        } catch (err: any) {
            toast.error(err.message || "Failed to save API key");
        } finally {
            setIsLoading(false);
        }
    };

    if (compact) {
        return (
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Key className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Add your AI API key</p>
                        <p className="text-[11px] text-muted-foreground">Required to start AI chat</p>
                    </div>
                </div>

                {/* Provider */}
                <Select value={provider} onValueChange={handleProviderChange}>
                    <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[99999]">
                        <SelectItem value="gemini">
                            <span className="flex items-center gap-2">
                                Google Gemini
                                <Badge variant="secondary" className="text-[9px] h-3.5 px-1 text-green-600">v3.1 Ready</Badge>
                            </span>
                        </SelectItem>
                        <SelectItem value="openai">OpenAI (GPT-5)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude 4.6)</SelectItem>
                        <SelectItem value="groq">
                            <span className="flex items-center gap-2">
                                Groq
                                <Badge variant="secondary" className="text-[9px] h-3.5 px-1 text-green-600">LPU Speed</Badge>
                            </span>
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Model */}
                <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[99999]">
                        <SelectGroup>
                            <SelectLabel className="text-[10px]">{current.name} Models</SelectLabel>
                            {current.models.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    <span className="flex items-center gap-2">
                                        {m.label}
                                        {m.tag && <Badge variant="secondary" className="text-[9px] h-3.5 px-1">{m.tag}</Badge>}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* API Key */}
                <div className="space-y-1">
                    <Input
                        type="password"
                        placeholder={current.placeholder}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        className="h-9 text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Get key at{" "}
                        <a href={current.url} target="_blank" rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-0.5">
                            {new URL(current.url).hostname} <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                    </p>
                </div>

                <Button onClick={handleSave} disabled={isLoading || !apiKey.trim()} className="w-full h-9 text-sm">
                    {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-2 h-3.5 w-3.5" />}
                    {isLoading ? "Saving..." : "Save & Start Chat"}
                </Button>
            </div>
        );
    }

    // ─── Full-page form ─────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="mb-6 flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Configure AI Assistant</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Add your API key to enable AI-powered responses. Your key is encrypted and stored securely.
                    </p>
                </div>
            </div>

            <div className="w-full max-w-sm space-y-4">
                {/* Provider */}
                <div className="space-y-1.5 text-left">
                    <Label className="text-xs font-medium">AI Provider</Label>
                    <Select value={provider} onValueChange={handleProviderChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gemini">
                                <span className="flex items-center gap-2">
                                    Google Gemini
                                    <Badge variant="secondary" className="text-[9px] h-3.5 px-1 text-green-600">v3.1 Ready</Badge>
                                </span>
                            </SelectItem>
                            <SelectItem value="openai">OpenAI (GPT-5)</SelectItem>
                            <SelectItem value="anthropic">Anthropic (Claude 4.6)</SelectItem>
                            <SelectItem value="groq">
                                <span className="flex items-center gap-2">
                                    Groq
                                    <Badge variant="secondary" className="text-[9px] h-3.5 px-1 text-green-600">LPU Speed</Badge>
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Model */}
                <div className="space-y-1.5 text-left">
                    <Label className="text-xs font-medium">Model</Label>
                    <Select value={model} onValueChange={setModel}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel className="text-[10px]">{current.name} Models</SelectLabel>
                                {current.models.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        <span className="flex items-center gap-2">
                                            {m.label}
                                            {m.tag && <Badge variant="secondary" className="text-[9px] h-3.5 px-1">{m.tag}</Badge>}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                        {provider === "gemini"
                            ? "Gemini Flash is fastest. Gemini Pro is most capable."
                            : "GPT-4o is recommended. GPT-4o Mini is faster and cheaper."}
                    </p>
                </div>

                {/* API Key */}
                <div className="space-y-1.5 text-left">
                    <Label className="text-xs font-medium">{current.name} API Key</Label>
                    <Input
                        type="password"
                        placeholder={current.placeholder}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        Get your key at{" "}
                        <a href={current.url} target="_blank" rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-0.5">
                            {new URL(current.url).hostname} <ExternalLink className="h-3 w-3" />
                        </a>
                    </p>
                </div>

                <Button onClick={handleSave} disabled={isLoading || !apiKey.trim()} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                    {isLoading ? "Saving..." : "Save & Start AI Chat"}
                </Button>

                <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" /> Your API key is encrypted and never shared</p>
            </div>
        </div>
    );
}
