import { AlertCircle, Loader2 } from "lucide-react";

interface Props {
  state: "loading" | "error" | "empty";
  title?: string;
  text?: string;
}

export function StatusView({ state, title, text }: Props) {
  if (state === "loading") {
    return (
      <div className="status-view">
        <Loader2 className="spin" size={28} />
        <strong>{title ?? "Загрузка"}</strong>
      </div>
    );
  }

  return (
    <div className="status-view">
      <AlertCircle size={28} />
      <strong>
        {title ?? (state === "empty" ? "Пока пусто" : "Не удалось загрузить")}
      </strong>
      {text && <span>{text}</span>}
    </div>
  );
}
