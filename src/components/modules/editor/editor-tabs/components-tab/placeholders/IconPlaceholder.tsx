"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Zap,
  Shield,
  Star,
  Heart,
  Home,
  Settings,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Camera,
  Music,
  Play,
  Pause,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Download,
  Upload,
  Share2,
  Send,
  Bookmark,
  Bell,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  User,
  Users,
  UserPlus,
  Globe,
  Wifi,
  Cloud,
  Database,
  Server,
  Code,
  Terminal,
  GitBranch,
  Layers,
  Layout,
  Grid3X3,
  Box,
  Package,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Trophy,
  Gift,
  Rocket,
  Sparkles,
  Flame,
  Sun,
  Moon,
  Palette,
  Brush,
  Pen,
  FileText,
  Folder,
  Image,
  Video,
  Headphones,
  Mic,
  MessageCircle,
  MessageSquare,
  ThumbsUp,
  Check,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Plus,
  Minus,
  X,
  Menu,
  MoreHorizontal,
  Grip,
  Move,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCw,
  Filter,
  SlidersHorizontal,
  Cpu,
  Smartphone,
  Monitor,
  Printer,
  Link2,
  Unlink,
  Paperclip,
  Scissors,
  Copy,
  Clipboard,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const ICON_LIST: { name: string; Icon: LucideIcon }[] = [
  { name: "Zap", Icon: Zap },
  { name: "Shield", Icon: Shield },
  { name: "Star", Icon: Star },
  { name: "Heart", Icon: Heart },
  { name: "Home", Icon: Home },
  { name: "Settings", Icon: Settings },
  { name: "Mail", Icon: Mail },
  { name: "Phone", Icon: Phone },
  { name: "MapPin", Icon: MapPin },
  { name: "Clock", Icon: Clock },
  { name: "Calendar", Icon: Calendar },
  { name: "Camera", Icon: Camera },
  { name: "Music", Icon: Music },
  { name: "Play", Icon: Play },
  { name: "Pause", Icon: Pause },
  { name: "ChevronRight", Icon: ChevronRight },
  { name: "ChevronDown", Icon: ChevronDown },
  { name: "ArrowRight", Icon: ArrowRight },
  { name: "ArrowUpRight", Icon: ArrowUpRight },
  { name: "ExternalLink", Icon: ExternalLink },
  { name: "Download", Icon: Download },
  { name: "Upload", Icon: Upload },
  { name: "Share", Icon: Share2 },
  { name: "Send", Icon: Send },
  { name: "Bookmark", Icon: Bookmark },
  { name: "Bell", Icon: Bell },
  { name: "Lock", Icon: Lock },
  { name: "Unlock", Icon: Unlock },
  { name: "Eye", Icon: Eye },
  { name: "EyeOff", Icon: EyeOff },
  { name: "User", Icon: User },
  { name: "Users", Icon: Users },
  { name: "UserPlus", Icon: UserPlus },
  { name: "Globe", Icon: Globe },
  { name: "Wifi", Icon: Wifi },
  { name: "Cloud", Icon: Cloud },
  { name: "Database", Icon: Database },
  { name: "Server", Icon: Server },
  { name: "Code", Icon: Code },
  { name: "Terminal", Icon: Terminal },
  { name: "GitBranch", Icon: GitBranch },
  { name: "Layers", Icon: Layers },
  { name: "Layout", Icon: Layout },
  { name: "Grid", Icon: Grid3X3 },
  { name: "Box", Icon: Box },
  { name: "Package", Icon: Package },
  { name: "Cart", Icon: ShoppingCart },
  { name: "ShoppingBag", Icon: ShoppingBag },
  { name: "CreditCard", Icon: CreditCard },
  { name: "Dollar", Icon: DollarSign },
  { name: "TrendingUp", Icon: TrendingUp },
  { name: "BarChart", Icon: BarChart3 },
  { name: "PieChart", Icon: PieChart },
  { name: "Activity", Icon: Activity },
  { name: "Target", Icon: Target },
  { name: "Award", Icon: Award },
  { name: "Trophy", Icon: Trophy },
  { name: "Gift", Icon: Gift },
  { name: "Rocket", Icon: Rocket },
  { name: "Sparkles", Icon: Sparkles },
  { name: "Flame", Icon: Flame },
  { name: "Sun", Icon: Sun },
  { name: "Moon", Icon: Moon },
  { name: "Palette", Icon: Palette },
  { name: "Brush", Icon: Brush },
  { name: "Pen", Icon: Pen },
  { name: "FileText", Icon: FileText },
  { name: "Folder", Icon: Folder },
  { name: "Image", Icon: Image },
  { name: "Video", Icon: Video },
  { name: "Headphones", Icon: Headphones },
  { name: "Mic", Icon: Mic },
  { name: "MessageCircle", Icon: MessageCircle },
  { name: "MessageSquare", Icon: MessageSquare },
  { name: "ThumbsUp", Icon: ThumbsUp },
  { name: "Check", Icon: Check },
  { name: "CheckCircle", Icon: CheckCircle },
  { name: "XCircle", Icon: XCircle },
  { name: "AlertCircle", Icon: AlertCircle },
  { name: "Info", Icon: Info },
  { name: "HelpCircle", Icon: HelpCircle },
  { name: "Plus", Icon: Plus },
  { name: "Minus", Icon: Minus },
  { name: "Close", Icon: X },
  { name: "Menu", Icon: Menu },
  { name: "More", Icon: MoreHorizontal },
  { name: "Grip", Icon: Grip },
  { name: "Move", Icon: Move },
  { name: "Maximize", Icon: Maximize2 },
  { name: "Minimize", Icon: Minimize2 },
  { name: "Refresh", Icon: RefreshCw },
  { name: "Rotate", Icon: RotateCw },
  { name: "Filter", Icon: Filter },
  { name: "Sliders", Icon: SlidersHorizontal },
  { name: "Cpu", Icon: Cpu },
  { name: "Smartphone", Icon: Smartphone },
  { name: "Monitor", Icon: Monitor },
  { name: "Printer", Icon: Printer },
  { name: "Link", Icon: Link2 },
  { name: "Unlink", Icon: Unlink },
  { name: "Paperclip", Icon: Paperclip },
  { name: "Scissors", Icon: Scissors },
  { name: "Copy", Icon: Copy },
  { name: "Clipboard", Icon: Clipboard },
];

const IconPlaceholder: React.FC = () => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search
        ? ICON_LIST.filter((i) =>
            i.name.toLowerCase().includes(search.toLowerCase()),
          )
        : ICON_LIST,
    [search],
  );

  const handleDragStart = (e: React.DragEvent, iconName: string) => {
    e.dataTransfer.setData("componentType", "icon");
    e.dataTransfer.setData("iconName", iconName);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="h-7 pl-7 text-[11px] rounded-lg"
        />
      </div>
      <div className="grid grid-cols-6 gap-1 max-h-[240px] overflow-y-auto scrollbar-thin">
        {filtered.map(({ name, Icon }) => (
          <div
            key={name}
            draggable
            onDragStart={(e) => handleDragStart(e, name)}
            title={name}
            className="h-8 w-full flex items-center justify-center rounded-md cursor-grab hover:bg-muted/80 transition-colors border border-transparent hover:border-border/50"
          >
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-6 text-center text-[11px] text-muted-foreground py-4">
            No icons found
          </p>
        )}
      </div>
    </div>
  );
};

export { ICON_LIST };
export default IconPlaceholder;
