import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { colors, type ColorKey } from "@/lib/theme";

const colorKeys = Object.keys(colors) as ColorKey[];
const techniques = ["clay", "glass", "flat"] as const;

export default function PreviewPage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 bg-[#fffbf7] p-12">
      <h1 className="text-2xl font-bold text-text">UI Component Preview</h1>

      <PreviewSection title="Button">
        {techniques.map((technique) => (
          <div key={`button-${technique}`} className="flex flex-wrap gap-4">
            {colorKeys.map((color) => (
              <Button
                key={`${technique}-${color}`}
                color={color}
                technique={technique}>
                {color}
              </Button>
            ))}
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="Input">
        {techniques.map((technique) => (
          <div
            key={`input-${technique}`}
            className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colorKeys.map((color) => (
              <Input
                key={`${technique}-${color}`}
                color={color}
                technique={technique}
                placeholder={color}
              />
            ))}
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="Label">
        <div className="flex flex-wrap gap-4">
          {colorKeys.map((color) => (
            <Label key={`label-${color}`} color={color}>
              {color} label
            </Label>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Card">
        {techniques.map((technique) => (
          <div
            key={`card-${technique}`}
            className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colorKeys.map((color) => (
              <Card
                key={`${technique}-${color}`}
                color={color}
                technique={technique}>
                <p className="font-semibold">{color}</p>
                <p className="text-sm opacity-80">{technique} card</p>
              </Card>
            ))}
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="Badge">
        <div className="flex flex-wrap gap-4">
          {colorKeys.map((color) => (
            <Badge key={`badge-${color}`} color={color}>
              {color}
            </Badge>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Avatar">
        <div className="flex flex-wrap items-center gap-4">
          {colorKeys.map((color) => (
            <Avatar
              key={`avatar-${color}`}
              color={color}
              fallback={color.slice(0, 1).toUpperCase()}
            />
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Checkbox">
        <div className="flex flex-wrap gap-4">
          {colorKeys.map((color) => (
            <Checkbox key={`checkbox-${color}`} color={color} label={color} />
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Skeleton">
        <div className="flex w-full max-w-4xl flex-col gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        </div>
      </PreviewSection>
    </main>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex w-full max-w-4xl flex-col gap-4">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      {children}
    </section>
  );
}
