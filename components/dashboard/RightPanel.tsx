"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RightPanel = () => {
  return (
    <aside className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Resume & Cover Letter</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
            Generate Suggestions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex-center text-muted-foreground">
            [Chart here]
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default RightPanel;
