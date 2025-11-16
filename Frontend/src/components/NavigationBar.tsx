import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Home, Gamepad2, FileText, HelpCircle, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { PlayerSettings } from "@/components/PlayerSettings";

interface NavigationBarProps {
  showPlayerSettings?: boolean;
  whitePlayerName?: string;
  blackPlayerName?: string;
  onPlayerNamesSave?: (whiteName: string, blackName: string) => void;
}

export const NavigationBar = ({
  showPlayerSettings = false,
  whitePlayerName = "White",
  blackPlayerName = "Black",
  onPlayerNamesSave
}: NavigationBarProps) => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/game", label: "Game", icon: Gamepad2 },
    { path: "/pgn-viewer", label: "PGN Viewer", icon: FileText },
    { path: "/how-to-play", label: "How to Play", icon: HelpCircle },
    { path: "/about", label: "About", icon: Users },
  ];

  return (
    <div className="bg-[hsl(var(--menu-bar))] border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--menu-bar-foreground))]">
              Chess
            </h1>
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "flex items-center gap-2",
                        isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                        !isActive && "text-[hsl(var(--menu-bar-foreground))] hover:bg-[hsl(var(--menu-bar-foreground))]/10"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {showPlayerSettings && onPlayerNamesSave && (
              <PlayerSettings
                whitePlayerName={whitePlayerName}
                blackPlayerName={blackPlayerName}
                onSave={onPlayerNamesSave}
              />
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        {/* Mobile navigation */}
        <nav className="md:hidden flex items-center gap-1 mt-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex-shrink-0">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex items-center gap-2",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                    !isActive && "text-[hsl(var(--menu-bar-foreground))] hover:bg-[hsl(var(--menu-bar-foreground))]/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
