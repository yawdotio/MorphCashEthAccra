import { useState } from "react";

export const useCopyToClipboard = () => {
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      // Check if clipboard API is available (requires HTTPS in most browsers)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback method for browsers without clipboard API or non-HTTPS contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy method failed');
        }
      }
      
      setIsCopiedToClipboard(true);
      setTimeout(() => {
        setIsCopiedToClipboard(false);
      }, 800);
    } catch (err) {
      console.error("Failed to copy text:", err);
      // You might want to show a user-friendly message here
      alert(`Copy failed. Please manually copy: ${text}`);
    }
  };

  return { copyToClipboard, isCopiedToClipboard };
};
