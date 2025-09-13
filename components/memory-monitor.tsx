"use client";

import { MemoryStick, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatFileSize } from "@/lib/memory-utils";
import { MEMORY_WARNING_THRESHOLD } from "@/lib/constants";

interface MemoryMonitorProps {
  memoryUsage: {
    used: number;
    max: number;
    percentage: number;
  };
  showWarning: boolean;
  processingCount?: number;
  totalImages?: number;
}

export function MemoryMonitor({ 
  memoryUsage, 
  showWarning, 
  processingCount = 0,
  totalImages = 0 
}: MemoryMonitorProps) {
  const getStatusColor = () => {
    if (memoryUsage.percentage >= 100) return "text-red-500";
    if (memoryUsage.percentage >= MEMORY_WARNING_THRESHOLD * 100) return "text-orange-500";
    return "text-green-500";
  };

  const getProgressColor = () => {
    if (memoryUsage.percentage >= 100) return "bg-red-500";
    if (memoryUsage.percentage >= MEMORY_WARNING_THRESHOLD * 100) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStatusIcon = () => {
    if (memoryUsage.percentage >= 100) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (memoryUsage.percentage >= MEMORY_WARNING_THRESHOLD * 100) return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (memoryUsage.percentage >= 100) return "Memory Full";
    if (memoryUsage.percentage >= MEMORY_WARNING_THRESHOLD * 100) return "High Usage";
    return "Optimal";
  };

  return (
    <div className="space-y-4">
      {/* Memory Status Card */}
      <div className="bg-card/50 backdrop-blur-sm rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MemoryStick className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Memory Status</h3>
            {getStatusIcon()}
          </div>
          <Badge 
            variant={memoryUsage.percentage >= MEMORY_WARNING_THRESHOLD * 100 ? "destructive" : "secondary"}
            className={getStatusColor()}
          >
            {getStatusText()}
          </Badge>
        </div>

        {/* Memory Usage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-medium">
              {formatFileSize(memoryUsage.used)} / {formatFileSize(memoryUsage.max)}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={memoryUsage.percentage} 
              className="h-3 bg-muted/50"
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(memoryUsage.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">{memoryUsage.percentage.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Processing Status */}
        {totalImages > 0 && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-muted-foreground">Processing</span>
            </div>
            <span className="font-medium">
              {processingCount} / {totalImages} images
            </span>
          </div>
        )}
      </div>

      {/* Memory Warning */}
      {showWarning && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>High memory usage detected!</strong> Consider processing fewer images at once 
            or clearing completed images to free up memory.
          </AlertDescription>
        </Alert>
      )}

      {/* Memory Tips */}
      {memoryUsage.percentage > 50 && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Memory Optimization Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Process images in smaller batches</li>
                <li>• Remove completed images to free memory</li>
                <li>• Use the optimized processors for large batches</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
