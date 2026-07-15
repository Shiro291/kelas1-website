import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("Tabs components must be used within Tabs");
  return context;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: any) {
  const [active, setActive] = React.useState(value || defaultValue);
  
  React.useEffect(() => {
    if (value !== undefined) setActive(value);
  }, [value]);

  const handleValueChange = (v: string) => {
    setActive(v);
    if (onValueChange) onValueChange(v);
  }

  return (
    <TabsContext.Provider value={{ value: active, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: any) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ className, value, children }: any) {
  const { value: active, onValueChange } = useTabs();
  const isActive = active === value;
  
  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ className, value, children }: any) {
  const { value: active } = useTabs();
  
  if (active !== value) return null;
  
  return (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  )
}
