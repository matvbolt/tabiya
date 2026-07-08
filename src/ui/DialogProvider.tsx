import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useI18n } from "../i18n";

type ConfirmOpts = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type DialogContextValue = {
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
  alert: (message: string, title?: string) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

type Internal = ConfirmOpts & {
  kind: "confirm" | "alert";
  resolve: (v: boolean) => void;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useI18n();
  const [state, setState] = useState<Internal | null>(null);
  const [closing, setClosing] = useState(false);

  const confirm = useCallback(
    (opts: ConfirmOpts) =>
      new Promise<boolean>((resolve) =>
        setState({ kind: "confirm", ...opts, resolve })
      ),
    []
  );

  const alert = useCallback(
    (message: string, title?: string) =>
      new Promise<void>((resolve) =>
        setState({
          kind: "alert",
          message,
          title,
          resolve: () => resolve(),
        })
      ),
    []
  );

  const close = useCallback(
    (result: boolean) => {
      setClosing(true);
      const s = state;
      setTimeout(() => {
        s?.resolve(result);
        setState(null);
        setClosing(false);
      }, 130);
    },
    [state]
  );

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {state && (
        <div
          className={`dlg-overlay${closing ? " is-closing" : ""}`}
          onClick={() => close(false)}
        >
          <div className="dlg" onClick={(e) => e.stopPropagation()}>
            {state.title && <h3 className="dlg__title">{state.title}</h3>}
            <p className="dlg__msg">{state.message}</p>
            <div className="dlg__actions">
              {state.kind === "confirm" && (
                <button className="btn-secondary" onClick={() => close(false)}>
                  {state.cancelLabel ?? t("common.cancel")}
                </button>
              )}
              <button
                className={state.danger ? "dlg-danger" : "btn-primary"}
                onClick={() => close(true)}
              >
                {state.confirmLabel ?? t("common.ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside <DialogProvider>");
  return ctx;
}
