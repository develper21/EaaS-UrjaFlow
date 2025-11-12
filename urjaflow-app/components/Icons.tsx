import React from 'react';
import {
  Zap,
  Battery,
  TrendingUp,
  Leaf,
  Sun,
  Wind,
  Activity,
  DollarSign,
  CreditCard,
  FileText,
  HelpCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Minus,
  Edit,
  Trash,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Home,
  BarChart3,
  PieChart,
  LineChart,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Loader2,
} from 'lucide-react';

export const Icons = {
  // Energy & Power
  zap: Zap,
  battery: Battery,
  sun: Sun,
  wind: Wind,
  activity: Activity,
  
  // Charts & Analytics
  trendingUp: TrendingUp,
  barChart: BarChart3,
  pieChart: PieChart,
  lineChart: LineChart,
  
  // Environment
  leaf: Leaf,
  
  // Finance
  dollarSign: DollarSign,
  creditCard: CreditCard,
  fileText: FileText,
  
  // Support & Help
  helpCircle: HelpCircle,
  info: Info,
  
  // User & Account
  user: User,
  settings: Settings,
  logOut: LogOut,
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
  
  // Navigation
  menu: Menu,
  close: X,
  home: Home,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  
  // Notifications
  bell: Bell,
  check: Check,
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  
  // Actions
  search: Search,
  plus: Plus,
  minus: Minus,
  edit: Edit,
  trash: Trash,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  copy: Copy,
  share: Share2,
  externalLink: ExternalLink,
  loader: Loader2,
  
  // Visibility
  eye: Eye,
  eyeOff: EyeOff,
  
  // Date & Time
  calendar: Calendar,
  clock: Clock,
  
  // Location & Contact
  mapPin: MapPin,
  phone: Phone,
  mail: Mail,
};

export type IconName = keyof typeof Icons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className, ...props }: IconProps) {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <IconComponent size={size} className={className} {...props} />;
}

export default Icons;
