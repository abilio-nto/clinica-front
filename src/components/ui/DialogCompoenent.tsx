// components/ui/DialogCompoenent.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface DialogCompoenentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  title?: string;
  buttonText?: string;
  type?: "error" | "warning" | "success" | "info";
  onConfirm?: () => void;  // <-- ADICIONE ESTA LINHA
  showCancel?: boolean;     // <-- ADICIONE ESTA LINHA
  cancelText?: string;      // <-- ADICIONE ESTA LINHA
}

const typeConfig = {
  error: {
    title: "❌ Erro ao processar",
    buttonText: "OK, entendi",
    buttonClass: "bg-red-600 hover:bg-red-700",
    icon: "❌",
  },
  warning: {
    title: "⚠️ Atenção",
    buttonText: "Continuar",
    buttonClass: "bg-yellow-600 hover:bg-yellow-700",
    icon: "⚠️",
  },
  success: {
    title: "✅ Sucesso!",
    buttonText: "OK",
    buttonClass: "bg-green-600 hover:bg-green-700",
    icon: "✅",
  },
  info: {
    title: "ℹ️ Informação",
    buttonText: "OK",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    icon: "ℹ️",
  },
};

export function DialogCompoenent({
  open,
  onOpenChange,
  message,
  title,
  buttonText,
  type = "error",
  onConfirm,      // <-- RECEBE O CALLBACK
  showCancel = true,  // <-- MOSTRA BOTÃO CANCELAR
  cancelText = "Cancelar",
}: DialogCompoenentProps) {
  const config = typeConfig[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();  // Executa o callback
    }
    onOpenChange(false); // Fecha o dialog
  };

  const handleCancel = () => {
    onOpenChange(false); // Apenas fecha
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
              type === "error" ? "bg-red-100" :
              type === "warning" ? "bg-yellow-100" :
              type === "success" ? "bg-green-100" :
              "bg-blue-100"
            }`}>
              {config.icon}
            </div>
            <AlertDialogTitle className={`text-xl ${
              type === "error" ? "text-red-600" :
              type === "warning" ? "text-yellow-600" :
              type === "success" ? "text-green-600" :
              "text-blue-600"
            }`}>
              {title || config.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-700 mt-2 text-base">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel && type === "warning" && (
            <AlertDialogCancel onClick={handleCancel}>
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleConfirm} className={config.buttonClass}>
            {buttonText || config.buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}