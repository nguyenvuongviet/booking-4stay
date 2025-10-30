"use client";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        return (
          <Toast key={id} {...props} variant={variant}>
            <ToastTitle>{title}</ToastTitle>
            {description ? (
              <ToastDescription>{description}</ToastDescription>
            ) : null}
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

export { Toast, ToastAction, ToastClose, ToastDescription, ToastTitle };
