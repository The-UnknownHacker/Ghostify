import { MainLayout } from "@/components/Layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6 bg-popover p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your app preferences</p>
          </div>

          <div className="grid gap-4">
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how Ghostify looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border bg-card">
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add account settings here */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Save Progress Automatically</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your quiz progress
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings; 