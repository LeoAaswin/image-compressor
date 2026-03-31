import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant = "default",
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: "rounded-md",
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  const style = {
    width: width || "100%",
    height: height || (variant === "text" ? "1rem" : "2rem"),
  };

  return (
    <div
      className={cn('animate-pulse bg-muted', variantClasses[variant], className)}
      style={style}
      {...props}
    />
  );
}

interface ToolCardSkeletonProps {
  count?: number;
}

export function ToolCardSkeleton({ count = 1 }: ToolCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-card/50 backdrop-blur-sm rounded-xl border p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height={20} />
              <Skeleton width="80%" height={16} />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton width="40%" height={14} />
            <Skeleton width="60%" height={14} />
            <Skeleton width="30%" height={14} />
          </div>
        </div>
      ))}
    </>
  );
}

interface StatsCardSkeletonProps {
  count?: number;
}

export function StatsCardSkeleton({ count = 4 }: StatsCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-card/50 backdrop-blur-sm rounded-xl border p-4 text-center"
        >
          <Skeleton variant="circular" width={48} height={48} className="mx-auto mb-2" />
          <Skeleton width="80%" height={32} className="mx-auto mb-1" />
          <Skeleton width="60%" height={16} className="mx-auto" />
        </div>
      ))}
    </>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  error?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function LoadingState({
  isLoading,
  error,
  children,
  fallback,
  errorFallback,
}: LoadingStateProps) {
  if (isLoading) {
    return <>{fallback || <LoadingSpinner />}</>;
  }

  if (error) {
    return (
      <>{errorFallback || <div className="text-destructive text-center p-4">{error}</div>}</>
    );
  }

  return <>{children}</>;
}

export { Skeleton };
