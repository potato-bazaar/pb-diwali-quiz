type NativeMessage = {
  type: string;
  payload?: unknown;
};

type NativeWindow = Window & {
  ReactNativeWebView?: { postMessage: (data: string) => void };
  webkit?: {
    messageHandlers?: {
      native?: { postMessage: (data: string) => void };
    };
  };
  Android?: { postMessage?: (data: string) => void };
};

/**
 * Sends a message from this web UI into the host app.
 * Works with React Native, iOS WKWebView, and Android WebView.
 * Logs in the browser when no host app is attached.
 */
export function postToNative(message: NativeMessage) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify(message);
  const host = window as NativeWindow;

  if (host.ReactNativeWebView) {
    host.ReactNativeWebView.postMessage(payload);
    return;
  }

  const ios = host.webkit?.messageHandlers?.native;
  if (ios) {
    ios.postMessage(payload);
    return;
  }

  if (host.Android?.postMessage) {
    host.Android.postMessage(payload);
    return;
  }

  console.info("[native-bridge]", message);
}
