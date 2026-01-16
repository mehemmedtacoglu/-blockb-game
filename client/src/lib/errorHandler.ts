import { toast } from "sonner";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
}

export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): string {
  const {
    showToast = true,
    logToConsole = true,
    fallbackMessage = "Bir hata oluştu. Lütfen tekrar deneyin.",
  } = options;

  let errorMessage = fallbackMessage;

  // Extract error message
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object" && "message" in error) {
    errorMessage = String(error.message);
  }

  // Log to console in development
  if (logToConsole && process.env.NODE_ENV === "development") {
    console.error("Error:", error);
  }

  // Show toast notification
  if (showToast) {
    toast.error(errorMessage);
  }

  return errorMessage;
}

export function handleApiError(error: unknown): string {
  // Handle tRPC specific errors
  if (error && typeof error === "object" && "data" in error) {
    const trpcError = error as any;
    if (trpcError.data?.code === "UNAUTHORIZED") {
      return handleError("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.", {
        showToast: true,
      });
    }
    if (trpcError.data?.code === "FORBIDDEN") {
      return handleError("Bu işlem için yetkiniz yok.", { showToast: true });
    }
    if (trpcError.data?.code === "TOO_MANY_REQUESTS") {
      return handleError("Çok fazla istek gönderdiniz. Lütfen bekleyin.", {
        showToast: true,
      });
    }
  }

  return handleError(error, {
    showToast: true,
    fallbackMessage: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
  });
}

export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: ErrorHandlerOptions
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
      throw error;
    }
  }) as T;
}
