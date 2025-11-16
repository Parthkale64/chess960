import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInEmail,
          password: signInPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Logged In",
        description: `Welcome back, ${data.user.name}!`,
      });

      navigate("/game");
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpName,
          email: signUpEmail,
          password: signUpPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Account Created",
        description: `Welcome, ${data.user.name}!`,
      });

      navigate("/game");
    } catch (err: any) {
      toast({
        title: "Signup Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAsGuest = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="h-16 w-16 text-primary" />
              <h1 className="text-6xl font-bold text-foreground">Chess</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Play chess online with friends or challenge yourself
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* SIGN IN */}
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          required
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          required
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* SIGN UP */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          type="text"
                          required
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          required
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : "Sign Up"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* RIGHT SIDE QUICK PLAY */}
            <div className="space-y-6">
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>Quick Play</CardTitle>
                  <CardDescription>
                    Jump right into a game without signing in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handlePlayAsGuest} size="lg" className="w-full">
                    Play as Guest
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="font-medium">Multiple Game Modes</p>
                  <p className="text-sm text-muted-foreground">
                    Play standard chess or Chess960
                  </p>
                  <p className="font-medium">PGN Viewer</p>
                  <p className="text-sm text-muted-foreground">
                    Review and analyze games
                  </p>
                  <p className="font-medium">Multiplayer</p>
                  <p className="text-sm text-muted-foreground">
                    Play with friends online
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;