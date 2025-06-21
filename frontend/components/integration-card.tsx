import { Button } from "@/components/ui/button";
import { Integration } from "@/types/integration.types";

interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{integration.type}</h3>
      <p className="text-gray-600">Status: {integration.connected ? "Connected" : "Disconnected"}</p>
      <Button className="mt-2" variant={integration.connected ? "outline" : "default"} asChild>
        <a href={`/${integration.type.toLowerCase()}`}>{integration.connected ? "Manage" : "Connect"}</a>
      </Button>
    </div>
  );
}